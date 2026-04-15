---
name: react-buenas-practicas
description: Buenas prácticas generales para desarrollo React. Cubre estructura de exports, code splitting, memoización, manejo de estado, y patrones de componentes. Aplicable a cualquier proyecto React.
---

# Skill: Buenas Prácticas React

Patrones probados y reglas para desarrollar aplicaciones React robustas, mantenibles y performantes.

---

## 1. Exports de Componentes

### Convención recomendada
Usar `export default function` para componentes de página y layout. Usar named exports para hooks, utilidades y constantes.

```jsx
// ✅ Página o layout — export default
export default function DashboardPage() {
    return <div>...</div>;
}

// ✅ Hook — named export
export function useAuth() {
    return useContext(AuthContext);
}

// ✅ Utilidad — named export
export const formatDate = (date) => { ... };
```

### ¿Por qué?
- `React.lazy()` requiere `export default` — si todos los componentes de página ya lo tienen, la migración a lazy loading es trivial.
- Los hooks y utilidades se importan frecuentemente con destructuring `{ useAuth }`, que es más explícito y permite importar múltiples.

### Patrón de compatibilidad
Si necesitas ambos tipos de import:
```jsx
export default function MiComponente() { ... }
// Los imports { MiComponente } NO funcionan con esto
// pero import MiComponente SÍ funciona
```

---

## 2. Code Splitting por Rutas

### Regla
Toda ruta que NO sea la primera pantalla visible debe usar `React.lazy()`.

```jsx
import { lazy, Suspense } from 'react';

// Estático: primera pantalla visible
import LoginPage from './pages/LoginPage';

// Lazy: todo lo demás
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
    return (
        <Suspense fallback={<Spinner />}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
            </Routes>
        </Suspense>
    );
}
```

### Spinner recomendado
Usar **inline styles** para el spinner de Suspense (no depende de CSS externo):

```jsx
function Spinner() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
                width: 32, height: 32,
                border: '2px solid rgba(128,128,128,0.3)',
                borderTopColor: 'currentColor',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
    );
}
```

---

## 3. Estructura de Carpetas por Feature

### Patrón recomendado
```
src/
├── features/
│   ├── auth/
│   │   ├── components/    # Componentes específicos de auth
│   │   ├── hooks/         # Hooks de auth (useAuth, useLogin)
│   │   └── pages/         # Páginas de auth (LoginPage, RegisterPage)
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   └── projects/
│       ├── components/
│       ├── hooks/
│       └── pages/
├── components/            # Componentes compartidos (UI genérica)
│   └── ui/
├── context/               # Contextos globales (ThemeContext, etc.)
├── lib/                   # Librerías y configuración (axios, firebase)
└── App.jsx
```

### Reglas
- Cada feature es autónoma: tiene sus propios components, hooks, y pages.
- Los componentes compartidos van en `components/ui/`.
- Los contextos globales van en `context/`.
- La configuración de librerías va en `lib/`.

---

## 4. Memoización Inteligente

### Cuándo usar `React.memo()`
- Componentes que reciben las mismas props frecuentemente.
- Componentes en listas largas (`map` con muchos elementos).
- Componentes hijos de un padre que se re-renderiza frecuentemente.

### Cuándo NO usar
- Componentes que SIEMPRE reciben props diferentes.
- Componentes muy simples (el costo de comparar puede ser mayor que re-renderizar).

```jsx
// ✅ Buena memoización: tarjeta en una lista larga
const ProjectCard = React.memo(function ProjectCard({ title, status, score }) {
    return (
        <div>
            <h3>{title}</h3>
            <span>{status}</span>
            <span>{score} pts</span>
        </div>
    );
});

// ❌ Memoización innecesaria: componente que siempre cambia
const Clock = React.memo(function Clock() {
    const [time, setTime] = useState(new Date());
    // Se actualiza cada segundo, memo no ayuda
    return <span>{time.toLocaleTimeString()}</span>;
});
```

### `useMemo` y `useCallback`
```jsx
// useMemo: para cálculos costosos
const sortedProjects = useMemo(() => 
    projects.sort((a, b) => b.score - a.score),
    [projects]
);

// useCallback: para funciones pasadas como props a componentes memoizados
const handleDelete = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
}, []);
```

---

## 5. Manejo de Estado

### Guía de selección
| Necesidad | Solución |
|---|---|
| Estado local de un componente | `useState` |
| Estado derivado de props | Calcularlo en render, NO en `useEffect` |
| Estado compartido entre 2-3 componentes cercanos | Elevar estado al padre común |
| Estado global (tema, auth, idioma) | `React.createContext` + `useContext` |
| Estado complejo con lógica | `useReducer` |
| Cache de datos del servidor | React Query, SWR, o similar |

### Anti-patrones comunes
```jsx
// ❌ MALO: useEffect para derivar estado
const [filteredItems, setFilteredItems] = useState([]);
useEffect(() => {
    setFilteredItems(items.filter(i => i.active));
}, [items]);

// ✅ BUENO: calcular en render
const filteredItems = items.filter(i => i.active);
// O con useMemo si el cálculo es costoso:
const filteredItems = useMemo(() => items.filter(i => i.active), [items]);
```

---

## 6. Componentes de Ruta Protegida

### Patrón
```jsx
function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Spinner />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// Uso con roles
function RoleGuard({ allowedRoles }) {
    const { userData } = useAuth();

    if (!allowedRoles.includes(userData?.rol)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
```

### Reglas
- Siempre manejar el estado `loading` — sin él, habrá un flash de redirect al login.
- Usar `replace` en `<Navigate>` para no contaminar el historial del navegador.
- Los componentes de guardia deben ser **ligeros** — no hacer fetch de datos aquí.
