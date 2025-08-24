import React from 'react';
import { FileText } from 'lucide-react';

export function EmptySheet() {
  return (
    <div className="text-center text-gray-500 mt-32">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-xl mb-2 font-light">Hoja en blanco</p>
      <p className="text-gray-400">Escribe una fórmula matemática o toma notas</p>
    </div>
  );
}