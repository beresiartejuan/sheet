# Sheet - Terminal Matemática Interactiva

Una terminal matemática construida en React que permite realizar cálculos, definir funciones, graficar y ejecutar comandos personalizados en tiempo real.

## 🚀 Características

- **Motor Matemático**: Basado en MathJS para cálculos avanzados
- **Sistema de Comandos**: Extensible con comandos personalizados
- **Gráficos**: Visualización de funciones matemáticas
- **Memoria de Símbolos**: Gestión inteligente de variables y funciones
- **Múltiples Hojas**: Organización por hojas de trabajo
- **Persistencia**: Guarda automáticamente el trabajo en sesión

## 🎯 Uso Básico

### Cálculos Matemáticos

```
2 + 3 * 4
sin(pi/2)
sqrt(16)
```

### Definición de Variables y Funciones

```
a = 5
f(x) = x^2 + 2*x + 1
g(x, y) = sin(x) * cos(y)
```

### Comandos Especiales

```
help                              # Ayuda general
plot {sin(x), cos(x)} from -5 to 5  # Gráficos
solve x^2 - 4 = 0 for x           # Resolver ecuaciones
matrix det [[1,2],[3,4]]          # Operaciones matriciales
derive x^2 + 3*x for x            # Derivadas
clear                             # Limpiar memoria
```

## 🏗️ Arquitectura

### Servicios Principales

- **`inputProcessor.ts`**: Coordinador principal del procesamiento de entrada
- **`customCommandSystem.ts`**: Sistema extensible de comandos personalizados
- **`mathScopeManager.ts`**: Gestión de scopes de MathJS para cálculos
- **`symbolMemory.ts`**: Almacenamiento de definiciones user-friendly
- **`builtinCommands.ts`**: Comandos integrados del sistema

### Flujo de Procesamiento

```
Input Usuario → Sistema de Comandos → ¿Comando encontrado?
    ↓ NO                           ↓ SÍ
MathJS Engine ←                   Ejecutar Comando
    ↓                                ↓
Evaluar expresión                 Callback (text/plot/error)
    ↓                                ↓
Resultado                        Resultado
```

## 📚 Documentación

- **[COMMANDS.md](./COMMANDS.md)**: Guía completa de comandos disponibles
- **[AGENTS.md](./AGENTS.md)**: Documentación técnica para agentes de IA

## 🛠️ Desarrollo

### Requisitos

- Node.js 18+
- React 18+
- TypeScript
- Vite

### Instalación

```bash
npm install
npm run dev
```

### Estructura del Proyecto

```
src/
├── components/          # Componentes React
├── services/           # Lógica de negocio
├── hooks/              # Hooks personalizados
├── store/              # Estado global
├── types/              # Definiciones TypeScript
└── config/             # Configuración
```

## 🔧 Extensibilidad

El sistema permite agregar comandos personalizados fácilmente. Ver [COMMANDS.md](./COMMANDS.md) para detalles sobre cómo crear nuevos comandos.

## 📄 Licencia

MIT
