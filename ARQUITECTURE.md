# ARCHITECTURA.md

> Guía de arquitectura para el proyecto React (TypeScript) actual. Este documento toma como base la estructura real del repo y define reglas claras para mantener el código modular, limpio y con una separación sólida entre lógica y vista.

---

## 1. Estructura actual del proyecto

```text
src/
├─ components/          # Componentes React (UI y contenedores ligeros)
├─ config/              # Configuración global, constantes y valores compartidos
│  └─ constants.ts
├─ hooks/               # Hooks reutilizables, manejo de estado o interacción con servicios
│  ├─ useLoading.ts
│  ├─ useSheetStore.ts
│  └─ useTheme.ts
├─ services/            # Lógica de negocio, orquestación, cálculos, persistencia, etc.
│  ├─ builtinCommands.ts
│  ├─ customCommandSystem.ts
│  ├─ inputProcessor.ts
│  ├─ mathScopeManager.ts
│  ├─ persistenceService.ts
│  ├─ plotCommandParser.ts
│  ├─ plotRenderer.ts
│  ├─ sheetService.ts
│  └─ symbolMemory.ts
├─ store/               # Estado global (Zustand, Redux u otro)
│  └─ sheetStore.ts
├─ types/               # Tipos y definiciones compartidas
│  └─ index.ts
├─ App.tsx              # Punto principal de la UI
├─ main.tsx             # Entry point, montaje del root React
└─ index.css            # Estilos globales
```

Esta estructura ya muestra una separación clara entre **UI**, **hooks**, **servicios**, y **estado global**, pero el objetivo es fortalecer las fronteras entre capas y formalizar sus responsabilidades.

---

## 2. Capas y responsabilidades

### 2.1 Componentes (`src/components/`)

- Responsabilidad: representación visual y composición.
- **Regla:** los componentes **no deben** contener lógica de negocio ni cálculos complejos. Solo mostrar datos y delegar eventos.
- **Ejemplo permitido:** manejar un `onClick`, renderizar condicionalmente o mostrar un loader.

Si un componente necesita transformar datos o ejecutar un flujo, debe hacerlo a través de un **hook** o **servicio**.

---

### 2.2 Hooks (`src/hooks/`)

- Responsabilidad: conectar la UI con la lógica de negocio o con el estado.
- **Ejemplo:** `useSheetStore` conecta componentes con el estado global de la hoja; `useTheme` gestiona temas visuales; `useLoading` maneja un flag de carga.
- **Regla:** la lógica aquí debe ser de orquestación o adaptación, **no de dominio**. Si un hook empieza a tener demasiada responsabilidad, separar su lógica en un servicio dentro de `src/services/`.

---

### 2.3 Servicios (`src/services/`)

Esta carpeta concentra la **lógica de negocio y procesamiento**. Cada archivo representa un módulo funcional o de dominio.

#### Ejemplos:

- `builtinCommands.ts` y `customCommandSystem.ts`: manejan comandos del sistema.
- `inputProcessor.ts`: interpreta y valida entradas del usuario.
- `mathScopeManager.ts`: gestiona el contexto matemático y las variables.
- `persistenceService.ts`: maneja guardado/carga de datos locales.
- `plotRenderer.ts`: se encarga de renderizar gráficos, separado de la UI React.
- `sheetService.ts`: operaciones sobre hojas (creación, actualización, lectura).

**Reglas para los servicios:**

1. Deben ser **puros** cuando sea posible (sin dependencias a React ni efectos colaterales ocultos).
2. Las llamadas a almacenamiento, red, o canvas deben ser explícitas y contenidas.
3. Los servicios no deben importar componentes ni hooks.
4. Cada módulo debe tener una interfaz o tipo que defina claramente sus inputs/outputs (`types/`).

> ⚡ Consejo: Si un servicio combina demasiadas responsabilidades (por ejemplo, lógica matemática y render), dividirlo en submódulos (`math/`, `graphics/`, etc.).

---

### 2.4 Store (`src/store/`)

- Contiene el estado global, actualmente `sheetStore.ts`.
- **Regla:** mantener el store limpio y predecible, sin mezclar lógica de negocio; sólo almacenar y exponer estado.
- La lógica que modifica el estado debe venir de los **servicios** o **hooks**, no implementarse directamente dentro del store.
- Usar tipos definidos en `src/types/` para las estructuras almacenadas.

---

### 2.5 Configuración y constantes (`src/config/`)

- Contiene configuraciones, valores fijos y claves compartidas.
- **Regla:** ningún archivo fuera de `config` debe definir hardcodes repetidos (como colores, límites numéricos o strings de sistema).

---

### 2.6 Tipos (`src/types/`)

- Centralizan todos los tipos compartidos.
- **Regla:** cada módulo de `services` o `store` debe exportar o reutilizar tipos desde aquí.
- Evitar usar `any` o `unknown` sin documentar; usar `type Result<T> = { ok: true; value: T } | { ok: false; error: string };` para errores predecibles.

---

## 3. Separación estricta de la lógica y la vista

**Nunca** se debe escribir lógica de negocio dentro de `components` o `App.tsx`.

Flujo recomendado:

```ts
// UI → Hook → Service → Store (si aplica)
```

Ejemplo:

```tsx
// Component.tsx
const Sheet = () => {
  const { data, refresh } = useSheetStore();
  return <SheetView data={data} onRefresh={refresh} />;
};
```

```ts
// useSheetStore.ts
import { getSheets } from "../services/sheetService";

export function useSheetStore() {
  const [data, setData] = useState([]);
  const refresh = async () => setData(await getSheets());
  return { data, refresh };
}
```

```ts
// sheetService.ts
export async function getSheets() {
  // pura lógica de negocio o acceso a almacenamiento
  const saved = localStorage.getItem("sheets");
  return saved ? JSON.parse(saved) : [];
}
```

---

## 4. Buenas prácticas generales

### Código limpio

- Cada módulo debe tener **una única responsabilidad**.
- Preferir **funciones puras** y evitar efectos colaterales.
- Mantener **nombres descriptivos**: `processInput` mejor que `handle`.
- Evitar dependencias circulares entre servicios.

### TypeScript

- Activar `strict` y mantener tipos explícitos en funciones exportadas.
- Tipos de errores y estados bien definidos.
- Centralizar enums, constantes de dominio y tipos globales.

### Testing

- Tests unitarios para `services` (dominio y cálculos).
- Tests de integración para `hooks`.
- Tests de UI (opcional) para validar comportamiento básico.

### Estilo y revisión

- ESLint y Prettier activos.
- Sin `console.log` en commits finales.
- Mantener PRs pequeños y con propósito único.

---

## 5. Deuda técnica y mantenimiento

### Plan de mejora progresiva:

1. Identificar componentes con lógica mezclada y moverla a hooks o servicios.
2. Revisar `services/` y dividir módulos demasiado grandes (por ejemplo, separar `plotRenderer` en lógica matemática y renderización).
3. Revisar `store/sheetStore.ts` y asegurar que no haya lógica duplicada de servicios.
4. Documentar los servicios clave con breves descripciones de propósito y entradas/salidas.
5. Crear una checklist para cada PR:

   - [ ] ¿La lógica está separada de la UI?
   - [ ] ¿Hay tipos bien definidos?
   - [ ] ¿El cambio mantiene el estilo general?

---

## 6. Sugerencia de estructura futura (a medio plazo)

```text
src/
├─ components/
├─ hooks/
├─ services/
│  ├─ core/            # Lógica matemática y procesamiento
│  ├─ io/              # Persistencia, lectura y escritura
│  └─ render/          # Renderizado de gráficos / canvas
├─ store/
├─ types/
└─ config/
```
