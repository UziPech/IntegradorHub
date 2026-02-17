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
                    const normalizedUser = {
                        userId: response.data.userId || response.data.UserId,
                        email: response.data.email || response.data.Email,
                        nombre: response.data.nombre || response.data.Nombre,
                        rol: response.data.rol || response.data.Rol,
                        isFirstLogin: response.data.isFirstLogin ?? response.data.IsFirstLogin,
                        grupoId: response.data.grupoId || response.data.GrupoId,
                        matricula: response.data.matricula || response.data.Matricula,
                        carreraId: response.data.carreraId || response.data.CarreraId
                    };

                    setUserData(normalizedUser);

                    // Guardar en Firestore para sincronización
                    // FIREBASE FIX: Firestore crashes with 'undefined'. convert undefined to null.
                    const firestoreData = {
                        ...normalizedUser,
                        grupoId: normalizedUser.grupoId || null,
                        matricula: normalizedUser.matricula || null,
                        carreraId: normalizedUser.carreraId || null,
                        photoURL: firebaseUser.photoURL || '',
                        updatedAt: new Date().toISOString()
                    };

                    await setDoc(doc(db, 'users', firebaseUser.uid), firestoreData, { merge: true });

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
