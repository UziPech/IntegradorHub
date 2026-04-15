import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5093',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
    async (config) => {
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                // forceRefresh=true para garantizar que el token NO esté expirado.
                const token = await currentUser.getIdToken(true);
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error obteniendo token JWT:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.error('No autorizado — Token JWT rechazado por el backend');
            
            // Si el usuario tiene sesión activa pero el token fue rechazado,
            // intentar forzar un refresh y reintentar UNA vez.
            const originalRequest = error.config;
            if (auth.currentUser && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const freshToken = await auth.currentUser.getIdToken(true);
                    originalRequest.headers.Authorization = `Bearer ${freshToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    console.error('Error al refrescar token:', refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
