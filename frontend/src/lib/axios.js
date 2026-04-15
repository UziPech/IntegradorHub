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
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // TODO: Redirigir a login
            console.error('No autorizado');
        }
        return Promise.reject(error);
    }
);

export default api;
