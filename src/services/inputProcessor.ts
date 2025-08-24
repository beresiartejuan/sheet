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
export function processUserInput({ input, cellNumber, callbacks }: ProcessInputParams): void {
  // Determinar si es par o impar
  const isEven = cellNumber % 2 === 0;
  
  if (isEven) {
    // Respuesta con texto para números pares
    const textResult = 'Resultado calculado correctamente. La expresión ha sido evaluada.';
    callbacks.text(textResult);
  } else {
    // Respuesta con imagen para números impares
    const imageUrl = 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800';
    callbacks.image(imageUrl);
  }
}