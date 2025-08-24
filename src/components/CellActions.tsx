import React from 'react';
import { Copy, MoreHorizontal, Edit2 } from 'lucide-react';

interface CellActionsProps {
  onEdit: () => void;
  onCopy: () => void;
  className?: string;
}

export function CellActions({ onEdit, onCopy, className = '' }: CellActionsProps) {
  return (
    <div className={`absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity ${className}`}>
      <div className="flex gap-1">
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
          title="Editar entrada"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onCopy}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          title="Copiar"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          title="Más opciones"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}