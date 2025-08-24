import React from 'react';
import { FileText } from 'lucide-react';

interface SheetHeaderProps {
  sheetName: string;
}

export function SheetHeader({ sheetName }: SheetHeaderProps) {
  return (
    <header className="border-b border-gray-200 px-6 py-4 bg-white">
      <div className="flex items-center gap-3">
        <FileText className="w-5 h-5 text-gray-500" />
        <h1 className="text-lg font-medium text-gray-900">{sheetName}</h1>
      </div>
    </header>
  );
}