import { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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

                // 1. Intentar leer datos directamente de Firestore (Robustez)
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        console.log('User data loaded from Firestore');
                        setUserData(userDoc.data());

                        // Sincronización silenciosa con backend por si acaso
                        api.post('/api/auth/login', {
                            firebaseUid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || 'Usuario',
                            photoUrl: firebaseUser.photoURL || ''
                        }).catch(e => console.warn('Backend sync warning:', e.message));

                    } else {
                        // 2. Si no existe, usar backend para crearlo
                        const response = await api.post('/api/auth/login', {
                            firebaseUid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || 'Usuario',
                            photoUrl: firebaseUser.photoURL || ''
                        });
                        setUserData(response.data);
                    }
                } catch (error) {
                    console.error('Error accessing user data:', error);
                    // Fallback último recurso
                    try {
                        const response = await api.post('/api/auth/login', {
                            firebaseUid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || 'Usuario',
                            photoUrl: firebaseUser.photoURL || ''
                        });
                        setUserData(response.data);
                    } catch (e) {
                        console.error('FATAL: Could not load user data', e);
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
