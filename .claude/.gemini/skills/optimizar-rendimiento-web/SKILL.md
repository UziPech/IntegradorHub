---
name: optimizar-rendimiento-web
description: Skill para optimizar rendimiento de carga en apps React con Three.js. Cubre crossfade para contenido rotativo, code splitting, lazy loading, y compresión de modelos 3D con Draco.
---

# Skill: Optimización de Rendimiento Web (React + Three.js)

Este skill define los patrones probados para optimizar la carga y fluidez de una aplicación web React que usa Three.js (o similar). Sigue cada sección paso a paso.

---

## 1. Crossfade A/B para Contenido Rotativo

**Problema**: Cuando texto/tarjetas rotan (ej: testimonios, frases), el patrón de "fade out → cambiar contenido → fade in" genera un parpadeo visible (vacío entre fases).

**Solución**: Técnica de doble capa (A/B swap).

### Patrón

```jsx
// Hook reutilizable para crossfade
function useCrossfade(intervalMs, getNextIndex) {
    const [activeLayer, setActiveLayer] = useState('A');
    const [indexA, setIndexA] = useState(() => getNextIndex(-1));
    const [indexB, setIndexB] = useState(() => getNextIndex(getNextIndex(-1)));

    const swap = useCallback(() => {
        setActiveLayer(prev => {
            if (prev === 'A') {
                setIndexB(current => getNextIndex(current));
                return 'B';
            } else {
                setIndexA(current => getNextIndex(current));
                return 'A';
            }
        });
    }, [getNextIndex]);

    useEffect(() => {
        const timer = setInterval(swap, intervalMs);
        return () => clearInterval(timer);
    }, [swap, intervalMs]);

    return {
        layerA: { index: indexA, isActive: activeLayer === 'A' },
        layerB: { index: indexB, isActive: activeLayer === 'B' },
    };
}
```

### Reglas
- **Siempre** renderizar dos capas superpuestas con `position: absolute`.
- La capa activa tiene `opacity: 1`, la inactiva `opacity: 0`.
- Usar `transition: 'opacity 1s ease-in-out, transform 1s ease-in-out'`.
- Agregar `willChange: 'opacity, transform'` para GPU acceleration.
- Usar intervalos de **8-10 segundos** mínimo para dar tiempo de lectura.
- **Nunca** usar `setTimeout` encadenados para animaciones de rotación de contenido.

---

## 2. Code Splitting con Vite (manualChunks)

**Problema**: Librerías pesadas como Three.js (~1.1 MB) y Firebase (~340 KB) inflan el bundle principal, bloqueando el primer render.

**Solución**: Separar en chunks independientes via `vite.config.js`.

### Patrón

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
        }
      }
    }
  }
})
```

### Reglas
- Agrupar por **dominio funcional**: todas las piezas de Three.js juntas, todas las de Firebase juntas.
- El bundle principal solo debe contener React, React-Router, y los componentes de UI ligeros.
- Verificar con `ls -lhS dist/assets/*.js` que los chunks están correctamente separados.

---

## 3. Lazy Loading de Componentes Pesados

**Problema**: Componentes que importan Three.js incluyen todo el bundle de Three.js en el chunk principal, bloqueando el render del login/UI.

**Solución**: Extraer el componente pesado a un archivo separado y cargarlo con `React.lazy()`.

### Patrón

```jsx
// ComponentePrincipal.jsx (se carga inmediatamente)
import { lazy, Suspense } from 'react';

const ComponentePesado = lazy(() => import('./ComponentePesado'));

export function ComponentePrincipal() {
    return (
        <div>
            {/* UI ligera que se renderiza inmediato */}
            <header>Mi App</header>
            
            {/* Componente pesado carga en background */}
            <Suspense fallback={<FallbackLigero />}>
                <ComponentePesado />
            </Suspense>
        </div>
    );
}
```

```jsx
// ComponentePesado.jsx (chunk separado, lazy-loaded)
import { Canvas } from '@react-three/fiber';
// ... todos los imports de Three.js aquí

export default function ComponentePesado() {
    return <Canvas>...</Canvas>;
}
```

### Reglas
- El archivo lazy-loaded **debe** usar `export default`.
- El fallback del `<Suspense>` debe ser visualmente coherente (un gradiente, spinner sutil — nunca un texto "Loading...").
- Usar `requestAnimationFrame` para retrasar el montaje del componente pesado un frame, asegurando que la UI ligera pinte primero:

```jsx
useEffect(() => {
    const timer = requestAnimationFrame(() => setShowHeavy(true));
    return () => cancelAnimationFrame(timer);
}, []);
```

---

## 4. Compresión de Modelos 3D con Draco

**Problema**: Modelos GLB/GLTF sin comprimir pueden pesar 50-100+ MB, haciendo la descarga inviable en conexiones normales.

**Solución**: Compresión Draco + WebP para texturas.

### Paso 1: Comprimir el modelo

```bash
npx -y @gltf-transform/cli optimize \
  input.glb \
  output_compressed.glb \
  --compress draco \
  --texture-compress webp
```

Resultados típicos: **70-97% de reducción** de tamaño.

### Paso 2: Reemplazar el original

```bash
mv original.glb original_backup.glb
mv output_compressed.glb original.glb
```

> **IMPORTANTE**: Siempre conservar un backup del original.

### Paso 3: Configurar DRACOLoader en el código

```jsx
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useGLTF } from '@react-three/drei';

// Configurar una sola vez a nivel de módulo
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
dracoLoader.preload();

// Usar en el componente
function Model() {
    const { scene } = useGLTF('/models/model.glb', true, true, (loader) => {
        loader.setDRACOLoader(dracoLoader);
    });
    return <primitive object={scene} />;
}

// Preload con Draco
useGLTF.preload('/models/model.glb', true, true, (loader) => {
    loader.setDRACOLoader(dracoLoader);
});
```

### Reglas
- Usar la CDN de Google para el decoder Draco (`gstatic.com`) — cero bundle overhead.
- Configurar el `DRACOLoader` **una sola vez** a nivel de módulo, no dentro de un componente.
- Después de comprimir, **siempre** verificar visualmente que el modelo se vea igual.

---

## 5. Preload Hints en HTML

**Problema**: El navegador no empieza a descargar el modelo 3D hasta que el JavaScript lo solicita, creando un "waterfall" de red.

**Solución**: `<link rel="preload">` en `index.html`.

### Patrón

```html
<head>
  <!-- Preload del modelo 3D -->
  <link rel="preload" href="/models/model.glb" as="fetch" crossorigin />
  
  <!-- Preconnect a CDNs externos utilizados -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://api.dicebear.com" />
  
  <!-- Meta SEO -->
  <meta name="description" content="Descripción de la app" />
</head>
```

### Reglas
- `as="fetch"` + `crossorigin` para modelos GLB.
- `preconnect` para dominios externos (fonts, APIs de avatares, CDNs).
- No preloadear más de 3-4 recursos para evitar saturar la red.

---

## 6. Sistema de Performance Tiers

**Problema**: Dispositivos de gama baja no soportan escenas 3D pesadas.

**Solución**: Hook `usePerformance` que detecta capacidades del dispositivo.

### Patrón

```jsx
export function usePerformance() {
    return useMemo(() => {
        const memory = navigator.deviceMemory || 8;
        const cores = navigator.hardwareConcurrency || 4;
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);

        if (memory < 4 || cores < 4) {
            return { performanceTier: 'low', isLowEnd: true };
        }
        if (isMobile || memory < 8 || cores < 8) {
            return { performanceTier: 'medium', isLowEnd: false };
        }
        return { performanceTier: 'high', isLowEnd: false };
    }, []);
}
```

### Uso por tier
| Tier | Comportamiento |
|------|---------------|
| **low** | No renderizar Canvas/3D. Solo gradientes CSS. |
| **medium** | Canvas con DPR=1, menos partículas, sin sombras. |
| **high** | Canvas con DPR=[1,2], sombras completas, todas las partículas. |

---

## Checklist de Verificación

Después de aplicar estas optimizaciones, verificar:

1. `npm run build` — sin errores.
2. `ls -lhS dist/assets/*.js` — chunks separados visibles.
3. Abrir DevTools → Network → Hard refresh — formulario/UI carga antes que el 3D.
4. Verificación visual — modelo 3D y animaciones se ven igual que antes.
5. Probar en modo dark y light.
6. Probar en viewport < 1100px (mobile) — contenido pesado se oculta/simplifica.

---

## 7. Route-Level Code Splitting (Lazy Loading de Páginas Completas)

**Problema**: Cuando `App.jsx` importa estáticamente 20+ páginas, **todo** el código (Dashboard, Admin, Editor, Evaluaciones…) se descarga junto al Login, aunque el usuario solo necesita ver el formulario de login.

**Solución**: Usar `React.lazy()` para todas las rutas protegidas. Las páginas de autenticación (LoginPage, RegisterPage, AuthLayout) se mantienen como imports estáticos porque son la primera pantalla visible.

### Patrón

```jsx
// App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ─── Imports estáticos: páginas de la primera pantalla visible ───
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import AuthLayout from './features/auth/components/AuthLayout';

// ─── Lazy-loaded: se descargan solo cuando el usuario navega a ellas ───
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const ProjectsPage = lazy(() => import('./features/projects/pages/ProjectsPage'));
const AdminPanel = lazy(() => import('./features/admin/pages/AdminPanel'));
// ... todas las demás rutas protegidas

// ─── Spinner minimalista (inline styles, sin dependencias CSS externas) ───
function RouteSpinner() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'inherit' }}>
      <div style={{ width: 32, height: 32, border: '2px solid rgba(128,128,128,0.3)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteSpinner />}>
        <Routes>
          {/* Auth - estáticas */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protegidas - lazy-loaded */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Reglas
- **React.lazy()** solo funciona con `export default`. Los componentes DEBEN tener `export default function X()`.
- **Suspense** debe envolver `<Routes>`, no cada `<Route>` individual.
- Las páginas de la **primera pantalla visible** (login, registro) NUNCA se lazy-loadean.
- El RouteSpinner debe usar **inline styles**, no clases de Tailwind/CSS que podrían no estar cargadas aún.
- Verificar con DevTools → Network que al cargar `/login`, los chunks de Dashboard/Admin NO se descargan.

---

## 8. Optimización de Google Fonts

**Problema**: Cargar 5 familias de fuentes en un solo `<link>` bloquea el primer render. Si solo se usa "Inter" en el login, las demás fuentes (Playfair, Dancing Script, Bodoni, Oswald) retrasan la pintura innecesariamente.

**Solución**: Separar fuentes críticas de decorativas. Las decorativas se cargan con la técnica `media="print" onload`.

### Patrón

```html
<head>
  <!-- Fuente crítica: carga síncrona (necesaria para el primer render) -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
    rel="stylesheet" />

  <!-- Fuentes decorativas: carga diferida (no bloquean el render) -->
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Dancing+Script:wght@400;700&display=swap"
    media="print" onload="this.media='all'" />
</head>
```

### Reglas
- Identificar cuáles fuentes se usan en la **primera pantalla visible** — solo ésas se cargan síncronamente.
- Las demás se cargan con `media="print" onload="this.media='all'"`.
- Incluir `display=swap` siempre para evitar FOIT (Flash of Invisible Text).
- Combinar `preconnect` para `fonts.googleapis.com` Y `fonts.gstatic.com`.

---

## 9. Lazy Loading de Imágenes Externas

**Problema**: Componentes como testimonios/testimonials hacen múltiples requests a APIs externas (ej: `api.dicebear.com`) para avatares durante la carga inicial, compitiendo con recursos críticos.

**Solución**: Atributos nativos HTML `loading="lazy"` y `decoding="async"`.

### Patrón

```jsx
<img
    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.avatar}`}
    alt="avatar"
    loading="lazy"
    decoding="async"
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
/>
```

### Reglas
- `loading="lazy"` → el browser solo descarga la imagen cuando está cerca del viewport.
- `decoding="async"` → la decodificación no bloquea el hilo principal.
- Aplicar a **toda** imagen que no sea visible en el primer viewport (above the fold).
- NO aplicar a logos, iconos del header, o imágenes críticas de la primera pantalla.

---

## 10. Reglas de Seguridad para Modificaciones en Masa

> **CRÍTICO**: Estas reglas nacen de errores reales. Seguirlas previene romper la aplicación.

### ❌ NUNCA hacer
1. **Nunca usar scripts de shell** (`echo >>`) para modificar archivos JSX/JS en masa. Los scripts no verifican errores de sintaxis y pueden fallar silenciosamente.
2. **Nunca cambiar `export function X` a `export default function X` sin verificar** que TODOS los archivos que importan `{ X }` (named import) sean actualizados a `import X` (default import).
3. **Nunca lazy-loadear sin haber agregado `export default` primero**. `React.lazy()` sin default export genera: `TypeError: Cannot convert object to primitive value`.

### ✅ SIEMPRE hacer
1. **Usar la herramienta de edición de código** (replace_file_content) para cada archivo individual. Esto garantiza que el diff se aplica correctamente.
2. **Buscar todas las referencias** de un componente antes de cambiar su tipo de export:
   ```bash
   grep -r "import { MiComponente }" src/
   ```
3. **Verificar en el navegador** después de cada grupo de cambios (máximo 5 archivos). Nunca esperar a modificar 15+ archivos sin verificar.
4. **Test incremental**: Primero agregar `export default` a todos los archivos → verificar que la app funciona igual. LUEGO convertir a `lazy()` → verificar de nuevo.

### Flujo seguro de migración a lazy loading
```
1. Agregar `export default` (uno por uno, con herramienta de edición)
     ↓
2. Verificar que la app sigue funcionando (sin cambiar nada más)
     ↓
3. Actualizar App.jsx: imports estáticos → lazy()
     ↓
4. Actualizar App.jsx: named imports → default imports
     ↓
5. Agregar <Suspense> con fallback
     ↓
6. Verificar en navegador
```

---

## Checklist de Verificación Completa

Después de aplicar cualquier optimización de este skill, verificar:

1. `npm run build` — sin errores de compilación.
2. `ls -lhS dist/assets/*.js` — chunks separados visibles (three-vendor, firebase-vendor, chunks de páginas).
3. DevTools → Network → Hard refresh en `/login` — solo se descargan los chunks necesarios para login.
4. DevTools → Console — **zero errores** (warnings de development son aceptables).
5. Verificación visual — modelo 3D, animaciones, y UI se ven **exactamente igual** que antes.
6. Probar en modo dark y light — colores y transiciones intactas.
7. Probar navegación: login → dashboard → proyectos → admin → cerrar sesión → login.
8. Probar en viewport < 1100px (mobile) — contenido pesado se oculta/simplifica.

