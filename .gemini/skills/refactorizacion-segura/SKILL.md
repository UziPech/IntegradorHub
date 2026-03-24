---
name: refactorizacion-segura
description: Reglas y patrones para modificar código de forma segura sin romper la aplicación. Cubre cambio de exports, renaming, migración de imports, y verificación incremental. Aplicable a cualquier proyecto JavaScript/TypeScript.
---

# Skill: Refactorización Segura de Código

Este skill define las reglas probadas para hacer cambios estructurales en un codebase sin introducir errores. Nacen de errores reales cometidos en producción.

---

## 1. Principio Fundamental: Cambio Atómico + Verificación

**Regla de oro**: Nunca hagas más de un tipo de cambio a la vez. Cada cambio debe ser verificado antes del siguiente.

```
Cambio A → Verificar → Cambio B → Verificar → Cambio C → Verificar
     ✅ CORRECTO

Cambio A + B + C → Verificar
     ❌ INCORRECTO (si falla, no sabes cuál rompió)
```

---

## 2. Cambio de Tipo de Export (Named ↔ Default)

### Riesgo
Cambiar `export function X()` a `export default function X()` rompe **todos** los archivos que usan `import { X }` (named import).

### Flujo seguro

```
1. ANTES de tocar el archivo, buscar todas las referencias:
   grep -r "import { NombreComponente }" src/

2. Anotar exactamente cuántos archivos lo importan y en qué líneas.

3. Cambiar el export del componente:
   export function X()  →  export default function X()

4. Actualizar TODOS los imports encontrados en el paso 1:
   import { X } from './...'  →  import X from './...'

5. Verificar en navegador/tests.
```

### Reglas
- **Usar herramientas de edición** para cada archivo. NUNCA usar `echo >>` o scripts de shell para modificar archivos JS/JSX/TS/TSX.
- Si el componente se importa en más de 5 archivos, considerar agregar el `export default` **sin eliminar** el named export:
  
  ```jsx
  // Ambos exports son válidos en el mismo archivo
  export function MiComponente() { ... }
  export default MiComponente;
  ```

  Esto mantiene compatibilidad con los imports existentes `{ X }` y permite nuevos `import X`.

---

## 3. Renaming de Archivos o Componentes

### Flujo seguro

```
1. Buscar todas las referencias al nombre actual:
   grep -r "NombreViejo" src/ --include="*.{js,jsx,ts,tsx}"

2. Crear el archivo nuevo (no borrar el viejo aún).

3. Actualizar los imports uno por uno.

4. Verificar que la app funciona.

5. Solo entonces, eliminar el archivo viejo.
```

### Reglas
- Nunca renombrar archivo y actualizar imports en el mismo paso.
- Si hay más de 10 referencias, hacerlo en lotes de 5 máximo, con verificación después de cada lote.

---

## 4. Migración de Imports a Lazy Loading

### Riesgo
`React.lazy()` requiere `export default`. Sin él, genera:
```
TypeError: Cannot convert object to primitive value
```

### Flujo seguro (paso a paso estricto)

```
Fase 1: Preparar componentes (NO cambiar App.jsx aún)
  1.1 Agregar export default a cada componente que lo necesite
  1.2 Verificar que la app funciona igual (sin cambiar nada más)

Fase 2: Migrar imports en App.jsx
  2.1 Cambiar import { X } → const X = lazy(() => import('./...'))
  2.2 Agregar import { lazy, Suspense } from 'react'
  2.3 Envolver <Routes> con <Suspense fallback={...}>
  2.4 Verificar en navegador
```

### Reglas
- Las páginas de la **primera pantalla visible** (login, landing) NUNCA se lazy-loadean.
- El fallback de Suspense debe usar **inline styles**, no clases CSS que podrían no estar cargadas.
- Verificar con DevTools → Network → Hard refresh que solo los chunks necesarios se descargan.

---

## 5. Modificaciones en Masa (Más de 5 Archivos)

### ❌ NUNCA
- Usar scripts de shell (`echo`, `sed`, `awk`) para modificar archivos de código fuente.
- Modificar más de 5 archivos sin verificar entre medio.
- Confiar en que un cambio "trivial" no puede romper nada.

### ✅ SIEMPRE
- Usar la herramienta de edición de código (replace_file_content o multi_replace_file_content).
- Verificar en el navegador o con tests después de cada grupo de 3-5 archivos.
- Mantener una lista (checklist) de archivos modificados para poder revertir si algo falla.

---

## 6. Revertir Cambios

Si algo se rompe:

1. **No entrar en pánico**. No hacer cambios adicionales "a ciegas".
2. Identificar exactamente QUÉ error aparece y EN QUÉ archivo.
3. Si hay versionado (git): `git diff` para ver qué cambió y `git checkout -- archivo.jsx` para revertir archivos específicos.
4. Sin versionado: Revertir manualmente archivo por archivo, verificando después de cada uno.

---

## Checklist Pre-Refactorización

Antes de empezar cualquier refactorización:

- [ ] ¿Tengo un backup o commit limpio?
- [ ] ¿Sé cuántos archivos voy a modificar?
- [ ] ¿Busqué TODAS las referencias con `grep`?
- [ ] ¿Tengo un plan de verificación (qué pantallas revisar)?
- [ ] ¿Puedo dividir el cambio en fases independientes?
