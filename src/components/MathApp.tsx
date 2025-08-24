import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, Send, X } from 'lucide-react';
import { Sheet } from './Sheet';
import { Sidebar } from './Sidebar';
import { useSheets } from '../hooks/useSheetStore';
import { sheetStore } from '../store/sheetStore';

export function MathApp() {
  const [activeSheetId, setActiveSheetId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { sheets, createSheet, deleteSheet, renameSheet } = useSheets();

  // Initialize store and set active sheet
  useEffect(() => {
    sheetStore.initialize();
    const currentSheets = sheetStore.getSheets();
    if (currentSheets.length > 0 && !activeSheetId) {
      setActiveSheetId(currentSheets[0].id);
    }
  }, [sheets, activeSheetId]);

  const createNewSheet = () => {
    const newSheet = createSheet();
    setActiveSheetId(newSheet.id);
  };

  const handleDeleteSheet = (sheetId: string) => {
    const success = deleteSheet(sheetId);
    if (!success) return;
    
    // If active sheet was deleted, switch to first available
    if (activeSheetId === sheetId) {
      const remainingSheets = sheetStore.getSheets();
      setActiveSheetId(remainingSheets[0]?.id || '');
    }
  };

  const activeSheet = sheets.find(sheet => sheet.id === activeSheetId);

  return (
    <div className="h-screen bg-white flex">
      <Sidebar
        sheets={sheets}
        activeSheetId={activeSheetId}
        onSheetSelect={setActiveSheetId}
        onCreateSheet={createNewSheet}
        onDeleteSheet={handleDeleteSheet}
        onRenameSheet={renameSheet}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        isSidebarOpen ? 'ml-80' : 'ml-16'
      }`}>
        {activeSheet ? (
          <Sheet
            key={activeSheet.id}
            sheetId={activeSheet.id}
            sheetName={activeSheet.name}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-4">No hay hojas disponibles</p>
              <button
                onClick={createNewSheet}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <PlusCircle className="w-4 h-4" />
                Crear nueva hoja
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}