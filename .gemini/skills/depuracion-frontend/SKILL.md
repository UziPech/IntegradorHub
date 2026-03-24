---
name: depuracion-frontend
description: Skill de depuración (debugging) para aplicaciones web frontend. Cubre cómo interpretar errores de consola, analizar rendimiento con DevTools, diagnosticar problemas de red, y resolver errores comunes de React, Vite, y Firebase.
---

# Skill: Depuración de Aplicaciones Frontend

Guía práctica para diagnosticar y resolver problemas en aplicaciones web React.

---

## 1. Lectura de Errores de Consola

### Errores comunes de React y su significado

| Error | Causa | Solución |
|---|---|---|
| `Cannot convert object to primitive value` | `React.lazy()` importando módulo sin `export default` | Agregar `export default` al componente |
| `Element type is invalid` | Import incorrecto o componente no exportado | Verificar nombre del export y la ruta del import |
| `Objects are not valid as a React child` | Intentar renderizar un objeto `{}` como texto | Usar `JSON.stringify()` o acceder a la propiedad específica |
| `Cannot read properties of undefined` | Acceder a propiedad de un objeto que aún no se cargó | Agregar optional chaining `?.` o verificar con `if` |
| `Too many re-renders` | `setState` llamado dentro del render sin condición | Mover a `useEffect` o agregar condición |
| `Each child in a list should have a unique key` | Falta `key` en elementos de un `.map()` | Agregar `key={item.id}` (nunca usar index como key) |

### Cómo leer un stack trace

```
Uncaught TypeError: Cannot read properties of undefined (reading 'name')
    at UserCard (UserCard.jsx:15:23)         ← AQUÍ está el error
    at renderWithHooks (react-dom.js:1430)   ← Interno de React (ignorar)
    at mountIndeterminateComponent (...)      ← Interno de React (ignorar)
```

**Regla**: Buscar la **primera línea** que apunte a tu código (no a `react-dom`, `node_modules`, o `chunk-*.js`).

---

## 2. Diagnóstico de Problemas de Rendimiento

### Paso 1: Identificar el cuello de botella

Abrir DevTools → Performance → Record → Navegar → Stop.

| Sección | Qué buscar |
|---|---|
| **Network** | ¿Hay muchos requests grandes bloqueando? ¿Waterfall largo? |
| **Main thread** | ¿Hay tareas largas (>50ms) que bloquean el render? |
| **Layout/Paint** | ¿Hay re-layouts excesivos? |

### Paso 2: Clasificar la causa

```
¿El problema es de CARGA (primer render lento)?
  → Revisar bundle size, code splitting, fonts, imágenes
  → Herramientas: Network tab, Lighthouse, webpack-bundle-analyzer

¿El problema es de INTERACCIÓN (lag al hacer clic/scroll)?
  → Revisar re-renders, listas largas, animaciones
  → Herramientas: React DevTools Profiler, Performance tab

¿El problema es de MEMORIA (se pone lenta con el tiempo)?
  → Revisar memory leaks, event listeners no limpiados
  → Herramientas: Memory tab, Heap snapshot
```

### Paso 3: Métricas clave

| Métrica | Objetivo | Cómo medir |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse |
| FID (First Input Delay) | < 100ms | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| Bundle size (main chunk) | < 200KB gzip | `npm run build` + revisar output |

---

## 3. Problemas de Red (Network)

### Diagnóstico
DevTools → Network tab → Hard refresh (Ctrl+Shift+R)

| Síntoma | Causa probable | Solución |
|---|---|---|
| Muchos 404s | Rutas de assets incorrectas | Verificar paths en `import` y `src` |
| Requests lentos a APIs | Servidor lento o CORS issues | Revisar backend, agregar `preconnect` |
| Bundle enorme (>1MB) | Sin code splitting | Implementar `React.lazy()` y `manualChunks` |
| Fonts bloqueando render | Carga síncrona de muchas fuentes | Separar críticas de decorativas (ver skill de rendimiento) |
| Imágenes tardando | Sin lazy loading | Agregar `loading="lazy"` a imgs below the fold |

### Preconnect/Preload checklist
```html
<!-- APIs externas que se usan en el primer render -->
<link rel="preconnect" href="https://mi-api.com" />

<!-- Assets grandes que se necesitarán pronto -->
<link rel="preload" href="/models/scene.glb" as="fetch" crossorigin />

<!-- Fuentes -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

---

## 4. Errores Comunes por Herramienta

### Vite

| Error | Causa | Solución |
|---|---|---|
| `Failed to resolve import` | Ruta incorrecta o archivo no existe | Verificar la ruta relativa y que el archivo exista |
| `Pre-transform error` | Syntax error en JSX/JS | Revisar el archivo indicado en el error |
| `CORS error` en dev | API no acepta requests de `localhost` | Configurar proxy en `vite.config.js` |
| HMR no funciona | Archivo no detecta cambios | Reiniciar dev server (`npm run dev`) |

### Firebase Auth

| Error | Causa | Solución |
|---|---|---|
| `auth/user-not-found` | Email no registrado | Mostrar mensaje amigable al usuario |
| `auth/wrong-password` | Contraseña incorrecta | Mostrar mensaje amigable |
| `auth/email-already-in-use` | Registro duplicado | Verificar existencia antes de crear |
| `auth/popup-closed-by-user` | Usuario cerró popup de Google | No hacer nada, es intencional |
| `auth/network-request-failed` | Sin conexión a internet | Mostrar estado offline |

### React Router

| Error | Causa | Solución |
|---|---|---|
| Pantalla en blanco | Ruta no coincide | Agregar ruta catch-all `<Route path="*">` |
| Redirect infinito | `ProtectedRoute` sin manejar `loading` | Agregar check de `if (loading) return <Spinner />` |
| `useNavigate` fuera de Router | Componente no está dentro de `<BrowserRouter>` | Asegurar que el provider envuelve la app |

---

## 5. Flujo de Depuración Paso a Paso

```
1. LEER el error completo (no solo la primera línea)
     ↓
2. IDENTIFICAR si es error de:
   - Compilación (Vite/Webpack) → revisar syntax
   - Runtime (React) → revisar lógica y estado
   - Red (Network) → revisar API/backend
     ↓
3. LOCALIZAR el archivo y línea exacta del error
     ↓
4. REPRODUCIR el error consistentemente
     ↓
5. AISLAR: ¿el error ocurre con datos específicos o siempre?
     ↓
6. SOLUCIONAR con el cambio mínimo necesario
     ↓
7. VERIFICAR que el fix no rompió otra cosa
```

### Reglas de depuración
- **Nunca** hacer cambios "a ciegas" sin entender el error primero.
- **Console.log temporal** es válido — pero limpiarlo después del fix.
- Si el error no es reproducible, agregar logging permanente para capturarlo.
- Si un fix requiere cambiar más de 3 archivos, detenerse y planificar antes.

---

## 6. Verificación Post-Fix

Después de arreglar un bug, verificar:

1. El error original ya no aparece.
2. La funcionalidad afectada funciona correctamente.
3. Las funcionalidades **cercanas** no se rompieron (regression test).
4. La consola está limpia de errores nuevos.
5. Dark mode y light mode — ambos funcionan.
6. Mobile viewport — no se rompió el responsive.
