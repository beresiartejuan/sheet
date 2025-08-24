import React, { useRef } from 'react';
import { Play } from 'lucide-react';

interface SheetInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  cellNumber: number;
}

export function SheetInput({ value, onChange, onSubmit, cellNumber }: SheetInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 px-8 py-6 bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="text-sm text-gray-500 font-mono min-w-0 py-2">
            In[{cellNumber}]:=
          </div>
          <div className="flex-1 flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe una expresión matemática o texto..."
              className="w-full py-2 focus:outline-none bg-transparent hover:bg-gray-50 transition-colors font-mono text-base border-b border-gray-200 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Evaluar</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}