import { create, all, MathJsInstance } from "mathjs";

/**
 * Servicio para manejar los scopes de mathjs (versiones compiladas para cálculos)
 */
class MathScopeManager {
    private math: MathJsInstance;
    private sheetScopes = new Map<string, Map<string, unknown>>();

    constructor() {
        this.math = create(all);
    }

    /**
     * Obtiene el scope de mathjs para una hoja específica
     */
    getScope(sheetId: string): Map<string, unknown> {
        if (!this.sheetScopes.has(sheetId)) {
            this.sheetScopes.set(sheetId, new Map());
        }
        return this.sheetScopes.get(sheetId)!;
    }

    /**
     * Obtiene la instancia de mathjs
     */
    getMath(): MathJsInstance {
        return this.math;
    }

    /**
     * Parsea una expresión matemática
     */
    parse(expression: string) {
        return this.math.parse(expression);
    }

    /**
     * Evalúa una expresión en el contexto de una hoja
     */
    evaluate(expression: string, sheetId: string): unknown {
        const scope = this.getScope(sheetId);
        const node = this.parse(expression);
        const compiled = node.compile();
        return compiled.evaluate(scope);
    }

    /**
     * Limpia el scope de una hoja
     */
    clearScope(sheetId: string): void {
        this.sheetScopes.delete(sheetId);
    }

    /**
     * Elimina una variable/función específica del scope
     */
    deleteFromScope(sheetId: string, name: string): boolean {
        const scope = this.getScope(sheetId);
        return scope.delete(name);
    }
}

export const mathScopeManager = new MathScopeManager();
