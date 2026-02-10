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
                    setUserData(response.data);

                    // Guardar en Firestore para sincronización
                    await setDoc(doc(db, 'users', firebaseUser.uid), {
                        ...response.data,
                        email: firebaseUser.email,
                        photoURL: firebaseUser.photoURL || '',
                        updatedAt: new Date().toISOString()
                    }, { merge: true });

                } catch (error) {
                    console.error('Error loading user data:', error);
                    // Fallback: usar datos de Firebase
                    setUserData({
                        UserId: firebaseUser.uid,
                        Email: firebaseUser.email,
                        Nombre: firebaseUser.displayName || 'Usuario',
                        Rol: 'Invitado',
                        IsFirstLogin: true
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
        isFirstLogin: userData?.IsFirstLogin ?? false,
        rol: userData?.Rol ?? 'Invitado'
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
