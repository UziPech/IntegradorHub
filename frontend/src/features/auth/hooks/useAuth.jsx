import { createContext, useContext, useEffect, useState } from 'react';
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

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

                    setUserData(normalizedUser);

                    // Sync to Firestore using SNAKE_CASE for backend compatibility
                    const firestoreData = {
                        userId: normalizedUser.userId,
                        email: normalizedUser.email,
                        nombre: normalizedUser.nombre,
                        apellido_paterno: normalizedUser.apellidoPaterno,
                        apellido_materno: normalizedUser.apellidoMaterno,
                        foto_url: normalizedUser.fotoUrl,
                        rol: normalizedUser.rol,
                        is_first_login: normalizedUser.isFirstLogin,
                        grupo_id: normalizedUser.grupoId,
                        matricula: normalizedUser.matricula,
                        carrera_id: normalizedUser.carreraId,
                        profesion: normalizedUser.profesion,
                        especialidad_docente: normalizedUser.especialidadDocente,
                        organizacion: normalizedUser.organizacion,
                        updatedAt: new Date().toISOString()
                    };

                    // Only update Firestore if we are authenticated and have data
                    if (firebaseUser.uid) {
                        await setDoc(doc(db, 'users', firebaseUser.uid), firestoreData, { merge: true });
                    }

                } catch (error) {
                    console.error('Error loading user data:', error);
                    // Fallback: usar datos de Firebase
                    // NORMALIZATION: Always use camelCase for userData keys to match backend response
                    // This prevents issues with case sensitivity in other components (e.g., Sidebar, EvaluationPanel)
                    setUserData({
                        userId: firebaseUser.uid,
                        email: firebaseUser.email,
                        nombre: firebaseUser.displayName || 'Usuario',
                        rol: 'Invitado',
                        isFirstLogin: true
                    });
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

    const value = {
        user,
        userData,
        loading,
        loginWithGoogle,
        logout,
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
