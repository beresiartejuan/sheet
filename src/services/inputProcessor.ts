import { create, all } from "mathjs";

const math = create(all);
const sheetScopes = new Map<string, Map<string, any>>();

function getSheetScope(sheetId: string): Map<string, any> {
  if (!sheetScopes.has(sheetId)) {
    sheetScopes.set(sheetId, new Map());
  }
  return sheetScopes.get(sheetId)!;
}
export interface ProcessorCallbacks {
  text: (result: string) => void;
  image: (imageUrl: string) => void;
}

export interface ProcessInputParams {
  input: string;
  sheetId: string;
  cellNumber: number;
  callbacks: ProcessorCallbacks;
}

export function processUserInput({ input, sheetId, cellNumber, callbacks }: ProcessInputParams): void {
  const scope = getSheetScope(sheetId);
  
  try {
    const node = math.parse(input);

    if(node.isAssignmentNode && node.value.isFunctionNode){
      callbacks.text(node.value.toString());
    }else{
     callbacks.text(node.compile().evaluate(scope)); 
    }
  } catch (error) {
    callbacks.text(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}