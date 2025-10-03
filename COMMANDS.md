# Sistema de Comandos - Guía Completa

## 🎯 Descripción General

Sheet utiliza un sistema híbrido que combina:

- **Sistema de Comandos Personalizados**: Para funcionalidades específicas
- **Motor MathJS**: Para evaluación matemática general

El flujo de procesamiento intercepta comandos específicos antes de pasar al motor matemático.

## 📋 Comandos Disponibles

### **Comandos de Sistema**

#### `help` / `?`

Muestra ayuda general o específica de comandos.

```bash
help                    # Ayuda general
help plot              # Ayuda específica del comando plot
? matrix               # Sintaxis alternativa
```

#### `clear` / `cls` / `reset`

Limpia toda la memoria de símbolos de la hoja actual.

```bash
clear                  # Elimina todas las variables y funciones
cls                    # Alias de clear
reset                  # Alias de clear
```

### **Comandos Matemáticos**

#### `solve <ecuación> for <variable>`

Resuelve ecuaciones algebraicas.

```bash
solve x^2 - 4 = 0 for x
solve 2*y + 5 = 15 for y
solve sin(x) = 0.5 for x
```

#### `derive <función> [variable]`

Calcula derivadas simbólicas.

```bash
derive x^2 + 3*x              # Deriva respecto a x (por defecto)
derive x^2 + y^2 for y        # Deriva respecto a y
d/dx sin(x) * cos(x)          # Sintaxis alternativa
```

#### `matrix <operación> <matriz>`

Operaciones con matrices.

```bash
matrix det [[1,2],[3,4]]           # Determinante
matrix inv [[2,0],[0,2]]           # Matriz inversa
matrix transpose [[1,2,3],[4,5,6]] # Transpuesta
```

**Operaciones disponibles:**

- `det` / `determinant`: Calcula el determinante
- `inv` / `inverse`: Calcula la matriz inversa
- `transpose` / `T`: Transpone la matriz

### **Comandos de Visualización**

#### `plot {funciones} from min to max`

Grafica funciones matemáticas.

```bash
plot {x^2} from -5 to 5
plot {sin(x), cos(x)} from -10 to 10
plot {x^2, x^3, sqrt(x)} from 0 to 5
plot {tan(x)} from -3.14 to 3.14
```

**Funciones soportadas:**

- Básicas: `+`, `-`, `*`, `/`, `^`
- Trigonométricas: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`
- Logarítmicas: `log`, `ln`, `log10`
- Otras: `sqrt`, `abs`, `exp`, `floor`, `ceil`
- Variables y funciones definidas por el usuario

## 🔧 Evaluación Matemática (MathJS)

Cuando no se encuentra un comando específico, la entrada se procesa con MathJS:

### **Definición de Variables**

```bash
a = 5
pi_custom = 3.14159
result = 2 * a + 10
```

### **Definición de Funciones**

```bash
f(x) = x^2 + 1
g(x, y) = sin(x) + cos(y)
quadratic(a, b, c, x) = a*x^2 + b*x + c
```

### **Consulta de Símbolos**

```bash
a                      # Muestra: a = 5
f                      # Muestra: f(x) = x^2 + 1
g                      # Muestra: g(x, y) = sin(x) + cos(y)
```

### **Cálculos**

```bash
2 + 3 * 4
sin(pi/2)
sqrt(16)
f(5)                   # Evalúa función definida
```

## 🎨 Crear Comandos Personalizados

### **Estructura Básica**

```typescript
import {
  commandRegistry,
  CustomCommand,
  CommandUtils,
} from "./customCommandSystem";

const miComando: CustomCommand = {
  name: "ejemplo",
  aliases: ["ej", "demo"],
  description: "Comando de ejemplo",
  usage: "ejemplo <argumento>",

  matcher: CommandUtils.prefixMatcher("ejemplo "),
  parser: CommandUtils.simpleParser,

  executor: (context, callbacks) => {
    callbacks.text(`Hola ${context.args[0] || "mundo"}!`);
  },
};

commandRegistry.register(miComando);
```

### **Tipos de Matchers**

```typescript
// Por prefijo
matcher: CommandUtils.prefixMatcher("comando ");

// Por regex
matcher: CommandUtils.regexMatcher(/^pattern\s+(.+)$/i);

// Personalizado
matcher: (input: string) => input.includes("keyword");
```

### **Tipos de Parsers**

```typescript
// Simple (separa por espacios)
parser: CommandUtils.simpleParser;
// "cmd arg1 arg2" → ['arg1', 'arg2']

// Resto (todo después del comando)
parser: CommandUtils.restParser;
// "cmd texto completo aquí" → ['texto completo aquí']

// Regex personalizado
parser: CommandUtils.regexParser(/pattern\s+(.+)/i);

// Función personalizada
parser: (input: string) => {
  /* lógica custom */
};
```

### **Tipos de Respuesta**

```typescript
// Texto simple
callbacks.text("Resultado del comando");

// Error
callbacks.error("Mensaje de error");

// Gráfico
callbacks.plot({
  functions: ["sin(x)", "cos(x)"],
  xMin: -5,
  xMax: 5,
});

// Imagen (Data URL)
callbacks.image("data:image/png;base64,...");
```

### **Ejemplo Completo: Comando Factorial**

```typescript
const factorialCommand: CustomCommand = {
  name: "factorial",
  aliases: ["fact"],
  description: "Calcula el factorial de un número",
  usage: "factorial <número>",

  matcher: CommandUtils.prefixMatcher("factorial "),
  parser: CommandUtils.simpleParser,

  executor: (context, callbacks) => {
    const n = parseInt(context.args[0]);

    if (isNaN(n) || n < 0) {
      callbacks.error("Proporciona un número entero positivo");
      return;
    }

    let result = 1;
    for (let i = 1; i <= n; i++) {
      result *= i;
    }

    callbacks.text(`${n}! = ${result}`);
  },
};

commandRegistry.register(factorialCommand);
```

## 🔍 Registro de Comandos

Los comandos se registran automáticamente en el sistema:

```typescript
// En builtinCommands.ts
export function registerBuiltinCommands(): void {
  commandRegistry.register(plotCommand);
  commandRegistry.register(helpCommand);
  commandRegistry.register(clearCommand);
  // ... más comandos
}
```

## 🎯 Patrones Comunes

### **Validación de Argumentos**

```typescript
executor: (context, callbacks) => {
  if (context.args.length < 2) {
    callbacks.error("Este comando requiere 2 argumentos");
    return;
  }

  const numero = parseFloat(context.args[0]);
  if (isNaN(numero)) {
    callbacks.error("El primer argumento debe ser un número");
    return;
  }

  // Lógica del comando...
};
```

### **Comandos Asíncronos**

```typescript
executor: async (context, callbacks) => {
  try {
    const result = await someAsyncOperation();
    callbacks.text(result);
  } catch (error) {
    callbacks.error(`Error: ${error.message}`);
  }
};
```

### **Integración con MathJS**

```typescript
executor: async (context, callbacks) => {
  try {
    const math = await import("mathjs");
    const result = math.evaluate(context.args[0]);
    callbacks.text(`Resultado: ${result}`);
  } catch (error) {
    callbacks.error(`Error matemático: ${error.message}`);
  }
};
```

## 📁 Organización de Archivos

```
src/services/
├── customCommandSystem.ts    # Core del sistema
├── builtinCommands.ts        # Comandos integrados
├── inputProcessor.ts         # Coordinador principal
├── mathScopeManager.ts       # Gestión de MathJS
├── symbolMemory.ts           # Memoria de símbolos
└── plotCommandParser.ts      # Parser específico para gráficos
```

## 🚀 Extensiones Futuras

El sistema está diseñado para soportar fácilmente:

- Comandos de conversión de unidades
- Generadores de secuencias
- Análisis estadístico
- Tablas de verdad
- Operaciones con conjuntos
- Cálculo simbólico avanzado
- Integración con APIs externas

---

**El sistema de comandos proporciona máxima flexibilidad para extender las capacidades matemáticas de Sheet.**
