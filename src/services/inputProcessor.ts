import { create, all } from "mathjs";

const math = create(all);
const scope = new Map();

export interface ProcessorCallbacks {
  text: (result: string) => void;
  image: (imageUrl: string) => void;
}

export interface ProcessInputParams {
  input: string;
  cellNumber: number;
  callbacks: ProcessorCallbacks;
}

/**
 * Procesa la entrada del usuario y determina el tipo de respuesta
 * basado en si el número de celda es par o impar
 */
export function processUserInput({ input, callbacks }: ProcessInputParams): void {
  const exp = math.parse(input).compile().evaluate(scope);

  callbacks.text(exp);
}