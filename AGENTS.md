# Documentación Técnica para Agentes de IA

## 🤖 Información General

Esta documentación está dirigida a agentes de IA que necesitan entender la arquitectura y funcionamiento interno de **Sheet**, una terminal matemática interactiva construida en React.

## 🏗️ Arquitectura del Sistema

### **Stack Tecnológico**

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Motor Matemático**: MathJS
- **Estado**: Zustand
- **Persistencia**: SessionStorage

### **Estructura de Directorios**

```
src/
├── components/          # Componentes React UI
│   ├── MathApp.tsx     # Componente principal
│   ├── Sheet.tsx       # Hoja de trabajo individual
│   ├── NotebookCell.tsx # Celda individual
│   └── ...
├── services/           # Lógica de negocio
│   ├── inputProcessor.ts       # Coordinador principal
│   ├── customCommandSystem.ts  # Sistema de comandos
│   ├── mathScopeManager.ts     # Gestión MathJS
│   ├── symbolMemory.ts         # Memoria de símbolos
│   └── builtinCommands.ts      # Comandos predefinidos
├── hooks/              # Hooks personalizados
├── store/              # Estado global (Zustand)
├── types/              # Definiciones TypeScript
└── config/             # Configuración
```

## 🔧 Sistema de Procesamiento de Entrada

### **Flujo Principal (`inputProcessor.ts`)**

```typescript
export async function processUserInput({
  input,
  sheetId,
  cellNumber,
  callbacks,
}: ProcessInputParams): Promise<void>;
```

**Secuencia de procesamiento:**

1. **Limpieza**: Trim del input
2. **Sistema de Comandos**: Intenta ejecutar comandos personalizados
3. **Fallback MathJS**: Si no hay comando, evalúa con MathJS
4. **Detección de Tipos**:
   - `FunctionAssignmentNode`: Registro de función
   - `AssignmentNode`: Asignación de variable
   - `SymbolNode`: Consulta de símbolo
   - Otros: Evaluación directa

### **Callbacks Disponibles**

```typescript
interface ProcessorCallbacks {
  text: (result: string) => void;
  image: (imageUrl: string) => void;
  plot: (config: PlotConfig) => void;
}
```

## 🎯 Sistema de Comandos Personalizados

### **Arquitectura (`customCommandSystem.ts`)**

```typescript
interface CustomCommand {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  matcher: (input: string) => boolean;
  parser: (input: string) => string[];
  executor: (
    context: CommandContext,
    callbacks: CommandCallbacks
  ) => void | Promise<void>;
  getHelp?: () => string;
}
```

### **Registry Pattern**

```typescript
class CommandRegistry {
  private commands: Map<string, CustomCommand>;
  private aliases: Map<string, string>;

  register(command: CustomCommand): void;
  findMatchingCommand(input: string): CustomCommand | null;
  tryExecute(input, sheetId, cellNumber, callbacks): Promise<boolean>;
}
```

### **Utilidades (`CommandUtils`)**

```typescript
// Matchers
static prefixMatcher(prefix: string): (input: string) => boolean
static regexMatcher(pattern: RegExp): (input: string) => boolean

// Parsers
static simpleParser(input: string): string[]        // Separa por espacios
static restParser(input: string): string[]          // Todo después del comando
static regexParser(pattern: RegExp): (input: string) => string[]
```

## 🧠 Gestión de Memoria

### **Dual Memory System**

**1. SymbolMemory (`symbolMemory.ts`)**

- Almacena versiones **user-friendly** de símbolos
- Mantiene expresiones originales para mostrar al usuario
- Historial con timestamps

```typescript
interface StoredSymbol {
  name: string;
  originalExpression: string;
  type: "function" | "variable";
  timestamp: Date;
}
```

**2. MathScopeManager (`mathScopeManager.ts`)**

- Maneja **scopes compilados** de MathJS para cálculos
- Evaluación eficiente de expresiones
- Aislamiento por hoja (`sheetId`)

```typescript
class MathScopeManager {
  private sheetScopes = new Map<string, Map<string, unknown>>();

  getScope(sheetId: string): Map<string, unknown>;
  evaluate(expression: string, sheetId: string): unknown;
  parse(expression: string): MathNode;
}
```

### **Sincronización**

Ambos sistemas se mantienen sincronizados:

- **SymbolMemory**: Para UX y consultas
- **MathScopeManager**: Para cálculos matemáticos

## 📊 Sistema de Gráficos

### **PlotCommandParser (`plotCommandParser.ts`)**

```typescript
// Sintaxis: plot {function1, function2} from minX to maxX
static parse(command: string): PlotConfig | null
```

### **PlotRenderer (`plotRenderer.ts`)**

```typescript
static async generatePlotImage(config: PlotConfig, sheetId: string): Promise<string>
```

**Proceso de renderizado:**

1. Genera puntos evaluando funciones con MathJS
2. Calcula rangos automáticos si no se especifican
3. Renderiza en Canvas HTML5
4. Retorna Data URL para mostrar

## 🔄 Gestión de Estado

### **Zustand Store (`useSheetStore.ts`)**

```typescript
interface SheetStore {
  sheets: SheetInfo[];
  createSheet: (customName?: string) => string;
  deleteSheet: (sheetId: string) => void;
  renameSheet: (sheetId: string, newName: string) => void;
}
```

### **Persistencia (`persistenceService.ts`)**

- **Storage**: SessionStorage (datos se pierden al cerrar pestaña)
- **Estructura**:
  - Lista de hojas: `sheets_list`
  - Datos por hoja: `sheet_data_{sheetId}`

## 🎨 Componentes UI Principales

### **MathApp.tsx**

- Componente raíz
- Gestión de hojas activas
- Sidebar toggle

### **Sheet.tsx**

- Hoja de trabajo individual
- Gestión de celdas
- Input handling

### **NotebookCell.tsx**

- Celda individual con input/output
- Renderizado de diferentes tipos de salida
- Gestión de focus

## 🔍 Tipos TypeScript Clave

### **Message (Celda)**

```typescript
interface Message {
  id: string;
  type: "cell";
  content: string; // Input del usuario
  output?: string; // Resultado
  outputType?: "text" | "image" | "canvas" | "plot";
  plotData?: PlotConfig; // Datos de gráfico
  isFormula: boolean; // Si contiene fórmula
  timestamp: Date;
  cellNumber: number;
}
```

### **PlotConfig**

```typescript
interface PlotConfig {
  functions: string[]; // Funciones a graficar
  xMin: number; // Range X mínimo
  xMax: number; // Range X máximo
  yMin?: number; // Range Y mínimo (opcional)
  yMax?: number; // Range Y máximo (opcional)
  steps?: number; // Puntos de evaluación
}
```

## 🚀 Comandos Built-in Implementados

### **Sistema**

- `help` / `?`: Sistema de ayuda contextual
- `clear` / `cls` / `reset`: Limpieza de memoria

### **Matemáticas**

- `solve <equation> for <variable>`: Resolución de ecuaciones
- `matrix <operation> <matrix>`: Operaciones matriciales
- `derive <function> [variable]`: Derivadas simbólicas

### **Visualización**

- `plot {functions} from min to max`: Gráficos de funciones

## ⚙️ Inicialización del Sistema

### **Secuencia de Arranque**

1. `MathApp.tsx` monta
2. `useSheets` hook inicializa
3. `registerBuiltinCommands()` ejecuta
4. Componentes UI renderizan
5. Sistema listo para recibir input

### **Lazy Loading**

- Comandos se registran una sola vez
- MathJS se importa dinámicamente en comandos que lo necesitan
- Canvas rendering on-demand

## 🔧 Extensibilidad

### **Agregar Nuevos Comandos**

1. Crear comando siguiendo interfaz `CustomCommand`
2. Registrar con `commandRegistry.register()`
3. Comandos disponibles inmediatamente

### **Modificar Procesamiento**

- Interceptar en `inputProcessor.ts` antes de MathJS
- Agregar nuevos tipos de nodos MathJS
- Extender callbacks con nuevos tipos de salida

### **Nuevos Tipos de Salida**

1. Extender `outputType` en interface `Message`
2. Agregar callback en `CommandCallbacks`
3. Implementar renderizado en `NotebookCell.tsx`

## 🐛 Debugging y Logging

### **Console Logging**

- Comandos registrados: `✅ Comando registrado: {name}`
- Errores de comandos se capturan y muestran como `❌ {message}`
- Parsing y evaluación loggeados en desarrollo

### **Error Handling**

- Try-catch en todos los executors de comandos
- Fallback graceful a MathJS si comando falla
- Validación de argumentos con mensajes claros

## 📈 Performance Considerations

### **Optimizaciones Actuales**

- Scopes de MathJS reutilizados por hoja
- Parsing lazy de comandos
- Canvas rendering optimizado para múltiples funciones
- SessionStorage para persistencia ligera

### **Limitaciones Conocidas**

- Sin cache de gráficos (se regeneran en cada render)
- Sin lazy loading de comandos pesados
- Sin optimización de memoria para hojas grandes

---

**Esta documentación proporciona el contexto técnico completo necesario para que un agente de IA entienda y pueda trabajar efectivamente con el sistema Sheet.**
