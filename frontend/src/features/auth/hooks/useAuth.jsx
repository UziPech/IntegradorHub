import { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../../../lib/firebase';
import api from '../../../lib/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const fetchIdRef = useRef(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const currentFetchId = ++fetchIdRef.current;

                try {
                    // Siempre obtener datos del backend (source of truth)
                    const response = await api.post('/api/auth/login', {
                        firebaseUid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || 'Usuario',
                        photoUrl: firebaseUser.photoURL || ''
                    });

                    console.log('Backend user data:', response.data);

                    // NORMALIZATION: Map backend PascalCase to camelCase to match app standards
                    const d = response.data;

                    // Priority logic for name: Backend > Firebase > Default
                    // If backend returns "Usuario", try to use Firebase display name instead.
                    let finalNombre = d.nombre || d.Nombre;
                    if ((!finalNombre || finalNombre === 'Usuario') && firebaseUser.displayName && firebaseUser.displayName !== 'Usuario') {
                        finalNombre = firebaseUser.displayName;
                    }

                    const normalizedUser = {
                        userId: d.userId || d.UserId || firebaseUser.uid,
                        email: d.email || d.Email || firebaseUser.email || '',
                        nombre: finalNombre || 'Usuario',
                        apellidoPaterno: d.apellidoPaterno || d.ApellidoPaterno || null,
                        apellidoMaterno: d.apellidoMaterno || d.ApellidoMaterno || null,
                        fotoUrl: d.fotoUrl || d.FotoUrl || firebaseUser.photoURL || null,
                        rol: d.rol || d.Rol || 'Invitado',
                        isFirstLogin: d.isFirstLogin ?? d.IsFirstLogin ?? false,
                        grupoId: d.grupoId || d.GrupoId || null,
                        grupoNombre: d.grupoNombre || d.GrupoNombre || null,
                        matricula: d.matricula || d.Matricula || null,
                        carreraId: d.carreraId || d.CarreraId || null,
                        profesion: d.profesion || d.Profesion || null,
                        especialidadDocente: d.especialidadDocente || d.EspecialidadDocente || null,
                        organizacion: d.organizacion || d.Organizacion || null
                    };

                    if (currentFetchId !== fetchIdRef.current) return;

                    setUserData(normalizedUser);

                    // 1. SMART SYNC: Read Firestore FIRST to avoid corrupting good data with backend "placeholders"
                    if (firebaseUser.uid) {
                        const userDocRef = doc(db, 'users', firebaseUser.uid);
                        const userDocSnap = await getDoc(userDocRef);
                        const existingFirestoreData = userDocSnap.exists() ? userDocSnap.data() : {};

                        // Priority logic for Nombre: Use what's in Firestore if it's not "Usuario"
                        let finalNombreForFirestore = normalizedUser.nombre;
                        if (existingFirestoreData.nombre &&
                            existingFirestoreData.nombre !== 'Usuario' &&
                            (!normalizedUser.nombre || normalizedUser.nombre === 'Usuario')) {
                            finalNombreForFirestore = existingFirestoreData.nombre;

                            // Immediately update session user name if it was "Usuario" but we have a better one
                            normalizedUser.nombre = finalNombreForFirestore;
                        }

                        // Also sync other missing data from Firestore back to session if session is incomplete
                        normalizedUser.apellidoPaterno = normalizedUser.apellidoPaterno || existingFirestoreData.apellido_paterno || null;
                        normalizedUser.apellidoMaterno = normalizedUser.apellidoMaterno || existingFirestoreData.apellido_materno || null;
                        normalizedUser.fotoUrl = normalizedUser.fotoUrl || existingFirestoreData.foto_url || null;
                        normalizedUser.grupoId = normalizedUser.grupoId || existingFirestoreData.grupo_id || null;
                        normalizedUser.matricula = normalizedUser.matricula || existingFirestoreData.matricula || null;
                        normalizedUser.carreraId = normalizedUser.carreraId || existingFirestoreData.carrera_id || null;
                        normalizedUser.profesion = normalizedUser.profesion || existingFirestoreData.profesion || null;
                        normalizedUser.especialidadDocente = normalizedUser.especialidadDocente || existingFirestoreData.especialidad_docente || null;
                        normalizedUser.organizacion = normalizedUser.organizacion || existingFirestoreData.organizacion || null;

                        // Final state update with merged data
                        setUserData({ ...normalizedUser });

                        const firestoreData = {
                            userId: normalizedUser.userId,
                            email: normalizedUser.email,
                            nombre: finalNombreForFirestore,
                            apellido_paterno: normalizedUser.apellidoPaterno,
                            apellido_materno: normalizedUser.apellidoMaterno,
                            foto_url: normalizedUser.fotoUrl,
                            rol: normalizedUser.rol,
                            is_first_login: normalizedUser.isFirstLogin,
                            updatedAt: new Date().toISOString()
                        };

                        // Merge extended fields for Firestore update
                        const extendedFields = {
                            grupo_id: normalizedUser.grupoId,
                            matricula: normalizedUser.matricula,
                            carrera_id: normalizedUser.carreraId,
                            profesion: normalizedUser.profesion,
                            especialidad_docente: normalizedUser.especialidadDocente,
                            organizacion: normalizedUser.organizacion
                        };

                        // Only overwrite extended fields if they have value or if we're not in first login
                        if (!normalizedUser.isFirstLogin || Object.values(extendedFields).some(v => v !== null)) {
                            Object.assign(firestoreData, extendedFields);
                        }

                        await setDoc(userDocRef, firestoreData, { merge: true });
                    }

                } catch (error) {
                    console.error('Error loading user data:', error);
                    // Fallback: usar datos de Firebase
                    // NORMALIZATION: Always use camelCase for userData keys to match backend response
                    // This prevents issues with case sensitivity in other components (e.g., Sidebar, EvaluationPanel)
                    if (currentFetchId === fetchIdRef.current) {
                        setUserData({
                            userId: firebaseUser.uid,
                            email: firebaseUser.email,
                            nombre: firebaseUser.displayName || 'Usuario',
                            rol: 'Invitado',
                            isFirstLogin: true
                        });
                    }
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserData(null);
        } catch (error) {
            console.error('Error en logout:', error);
            throw error;
        }
    };

    const refreshUserData = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const currentFetchId = ++fetchIdRef.current;

        try {
            const response = await api.post('/api/auth/login', {
                firebaseUid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || 'Usuario',
                photoUrl: currentUser.photoURL || ''
            });

            const d = response.data;
            let finalNombre = d.nombre || d.Nombre;
            if ((!finalNombre || finalNombre === 'Usuario') && currentUser.displayName && currentUser.displayName !== 'Usuario') {
                finalNombre = currentUser.displayName;
            }

            const normalizedUser = {
                userId: d.userId || d.UserId || currentUser.uid,
                email: d.email || d.Email || currentUser.email || '',
                nombre: finalNombre || 'Usuario',
                apellidoPaterno: d.apellidoPaterno || d.ApellidoPaterno || null,
                apellidoMaterno: d.apellidoMaterno || d.ApellidoMaterno || null,
                fotoUrl: d.fotoUrl || d.FotoUrl || currentUser.photoURL || null,
                rol: d.rol || d.Rol || 'Invitado',
                isFirstLogin: d.isFirstLogin ?? d.IsFirstLogin ?? false,
                grupoId: d.grupoId || d.GrupoId || null,
                grupoNombre: d.grupoNombre || d.GrupoNombre || null,
                matricula: d.matricula || d.Matricula || null,
                carreraId: d.carreraId || d.CarreraId || null,
                profesion: d.profesion || d.Profesion || null,
                especialidadDocente: d.especialidadDocente || d.EspecialidadDocente || null,
                organizacion: d.organizacion || d.Organizacion || null
            };

            if (currentFetchId !== fetchIdRef.current) return;

            setUserData(normalizedUser);
            return normalizedUser;
        } catch (error) {
            console.error('Error refreshing user data:', error);
        }
    };

    const value = {
        user,
        userData,
        loading,
        loginWithGoogle,
        logout,
        refreshUserData,
        isAuthenticated: !!user,
        isFirstLogin: userData?.isFirstLogin ?? false,
        rol: userData?.rol ?? 'Invitado'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}
