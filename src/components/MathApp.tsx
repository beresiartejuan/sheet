import { useState, useEffect } from 'react';
import { PlusCircle, FileText } from 'lucide-react';
import { Sheet } from './Sheet';
import { Sidebar } from './Sidebar';
import { LoadingOverlay } from './LoadingComponents';
import { useSheets } from '../hooks/useSheetStore';

export function MathApp() {
  const [activeSheetId, setActiveSheetId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { sheets, isLoading, error, createSheet, deleteSheet, renameSheet } = useSheets();

  // Set active sheet when sheets change
  useEffect(() => {
    if (sheets.length > 0 && !activeSheetId) {
      setActiveSheetId(sheets[0].id);
    }
  }, [sheets, activeSheetId]);

  const createNewSheet = () => {
    try {
      const newSheetId = createSheet();
      setActiveSheetId(newSheetId);
    } catch (err) {
      console.error('Error creating sheet:', err);
    }
  };

  const handleDeleteSheet = (sheetId: string) => {
    try {
      deleteSheet(sheetId);

      // If active sheet was deleted, switch to first available
      if (activeSheetId === sheetId) {
        const remainingSheets = sheets.filter(sheet => sheet.id !== sheetId);
        setActiveSheetId(remainingSheets[0]?.id || '');
      }
    } catch (err) {
      console.error('Error deleting sheet:', err);
    }
  };

  const activeSheet = sheets.find(sheet => sheet.id === activeSheetId);

  // Show error state
  if (error) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-center text-red-500 p-8">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Recargar aplicación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex relative">
      <LoadingOverlay isVisible={isLoading} text="Cargando hojas..." type="spinner" />

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

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : 'ml-16'}`}>
        {activeSheet ? (
          <Sheet
            key={activeSheet.id}
            sheetId={activeSheet.id}
            sheetName={activeSheet.name}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
          />
        ) : !isLoading ? (
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
        ) : null}
      </main>
    </div>
  );
}