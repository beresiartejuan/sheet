import React, { useState } from 'react';
import { PlusCircle, FileText, Trash2, Edit2, Check, X, Menu } from 'lucide-react';
import { SheetInfo } from '../types';

interface SidebarProps {
  sheets: SheetInfo[];
  activeSheetId: string;
  onSheetSelect: (sheetId: string) => void;
  onCreateSheet: () => void;
  onDeleteSheet: (sheetId: string) => void;
  onRenameSheet: (sheetId: string, newName: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  sheets,
  activeSheetId,
  onSheetSelect,
  onCreateSheet,
  onDeleteSheet,
  onRenameSheet,
  isOpen,
  onToggle
}: SidebarProps) {
  const [editingSheetId, setEditingSheetId] = useState<string>('');
  const [editingName, setEditingName] = useState('');

  const startEditing = (sheet: SheetInfo) => {
    setEditingSheetId(sheet.id);
    setEditingName(sheet.name);
  };

  const saveEdit = () => {
    if (editingName.trim()) {
      onRenameSheet(editingSheetId, editingName.trim());
    }
    setEditingSheetId('');
    setEditingName('');
  };

  const cancelEdit = () => {
    setEditingSheetId('');
    setEditingName('');
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-10 ${
      isOpen ? 'w-80' : 'w-16'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {isOpen && (
              <h2 className="font-semibold text-gray-900 dark:text-white">Hojas de Trabajo</h2>
            )}
            <div className="flex items-center gap-2">
              {isOpen && <ThemeToggle />}
              <button
                onClick={onToggle}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Create New Sheet Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onCreateSheet}
            className={`w-full flex items-center gap-3 px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors ${
              !isOpen ? 'justify-center' : ''
            }`}
            title={!isOpen ? 'Nueva hoja' : undefined}
          >
            <PlusCircle className="w-5 h-5" />
            {isOpen && <span className="font-medium">Nueva hoja</span>}
          </button>
        </div>

        {/* Sheets List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {sheets.map((sheet) => (
              <div
                key={sheet.id}
                className={`group relative rounded-lg transition-colors ${
                  activeSheetId === sheet.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {editingSheetId === sheet.id ? (
                  <div className="p-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus
                    />
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={saveEdit}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onSheetSelect(sheet.id)}
                    className={`w-full p-3 text-left flex items-center gap-3 ${
                      !isOpen ? 'justify-center' : ''
                    }`}
                    title={!isOpen ? sheet.name : undefined}
                  >
                    <FileText className={`w-5 h-5 ${
                      activeSheetId === sheet.id ? 'text-blue-600' : 'text-gray-500'
                    } dark:text-gray-400`} />
                    {isOpen && (
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium truncate ${
                          activeSheetId === sheet.id ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                        }`}>
                          {sheet.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(sheet.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </button>
                )}

                {/* Action buttons */}
                {isOpen && editingSheetId !== sheet.id && (
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(sheet);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {sheets.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSheet(sheet.id);
                          }}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {sheets.length} {sheets.length === 1 ? 'hoja' : 'hojas'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}