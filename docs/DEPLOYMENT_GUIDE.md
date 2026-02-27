# Guía de Despliegue - Backend (Render) y Frontend (Vercel)

Esta guía documenta los pasos y configuraciones necesarias para desplegar el proyecto IntegradorHub en producción, separando el backend en Render y el frontend en Vercel.

## 1. Backend (.NET 8) en Render

El backend fue dockerizado y configurado para ejecutarse en el tier gratuito de Render.

### Consideraciones Clave Implementadas:
*   **Dockerfile:** Se creó un `Dockerfile` multi-stage en `/backend/Dockerfile` para compilar y ejecutar la aplicación .NET 8.
*   **CORS Dinámico:** `Program.cs` lee los orígenes permitidos dinámicamente desde variables de entorno (`AllowedOrigins__0`, `AllowedOrigins__1`) en lugar de estar fijos.
*   **Credenciales de Firestore Seguras:** `FirestoreContext.cs` fue modificado para leer el archivo JSON de credenciales de Firebase desde una variable de entorno (`FIREBASE_CREDENTIALS_JSON`) creando un archivo temporal en producción, evitando subir el JSON al repositorio.

### Variables de Entorno en Render

Al configurar el Web Service en Render, se definieron las siguientes variables de entorno:

| Variable | Descripción / Valor de Ejemplo |
| :--- | :--- |
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `FIREBASE_PROJECT_ID` | `integradorhub-dsm` |
| `FIREBASE_CREDENTIALS_JSON` | `{"type": "service_account", ...}` *(El contenido completo del JSON de Firebase)* |
| `AllowedOrigins__0` | `https://integradorhub.vercel.app` *(La URL futura de producción del frontend en Vercel)* |
| `AllowedOrigins__1` | `http://localhost:5173` *(Para poder probar en local apuntando a prod)* |
| `Supabase__Url` | `https://[TU-PROYECTO].supabase.co` |
| `Supabase__ServiceKey` | `eyJhbG...` *(Clave de servicio de Supabase)* |
| `Supabase__BucketName` | `project-files` |

### Pasos de Despliegue (Render):
1.  Conectar repositorio de GitHub a Render.
2.  Crear nuevo Web Service.
3.  Directorio Raíz: `backend`
4.  Ruta del Dockerfile: `./Dockerfile` (A veces Render lo detecta solo).
5.  Configurar todas las variables de entorno mencionadas arriba.
6.  Desplegar. La URL resultante será similar a `https://integradorhub.onrender.com`.

---

## 2. Frontend (React/Vite) en Vercel

*(Estos son los próximos pasos a realizar en la siguiente sesión)*

### Preparación del Código (.env.local)

Antes de desplegar, nos aseguramos de que el Frontend consuma el Backend correcto mediante la variable entorno `VITE_API_URL`.

*   Para pruebas locales apuntando a Producción, el archivo `.env.local` debe tener:
    ```env
    VITE_API_URL=https://integradorhub.onrender.com
    ```
*   Además, se corrigió una URL "quemada" (hardcodeada) en `src/lib/axios.js` para asegurar que utilice esta variable:
    ```javascript
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5093',
    ```

### Próximos Pasos para el Despliegue en Vercel:

1.  **Variables de Entorno:** Al importar el proyecto en Vercel, el directorio raíz (Root Directory) debe ser `frontend`.
2.  Deberás configurar TODAS las variables de entorno que tenías en tus archivos `.env`. Es crucial configurar:
    *   `VITE_API_URL=https://integradorhub.onrender.com`
    *   Todas las variables `VITE_FIREBASE_*` (API Key, Domain, ProjectId, etc.) copiándolas directamente desde tu archivo local `.env`.

Al finalizar esto, ambas partes del sistema estarán en la nube interactuando exitosamente.
