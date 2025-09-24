import { useCallback, useEffect, useState } from 'react';
import { Message, SheetInfo } from '../types';
import { SheetService } from '../services/sheetService';
import { useLoading } from './useLoading';

// Create service instance
const sheetService = SheetService.getInstance();

// Legacy hooks for compatibility (simplified)
export function useSheets() {
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const { isLoading, error, startLoading, stopLoading, setLoadingError } = useLoading();

  useEffect(() => {
    const loadSheets = () => {
      startLoading();
      const result = sheetService.getSheets();
      if (result.success) {
        setSheets(result.data || []);
        stopLoading();
      } else {
        setLoadingError(result.error || 'Error al cargar las hojas');
      }
    };

    loadSheets();
    const unsubscribe = sheetService.subscribe(loadSheets);
    return unsubscribe;
  }, [startLoading, stopLoading, setLoadingError]);

  const createSheet = useCallback(() => {
    startLoading();
    const result = sheetService.createSheet();
    if (result.success) {
      stopLoading();
      return result.data!.id;
    } else {
      setLoadingError(result.error || 'Error al crear la hoja');
      throw new Error(result.error || 'Error al crear la hoja');
    }
  }, [startLoading, stopLoading, setLoadingError]);

  const deleteSheet = useCallback((id: string) => {
    startLoading();
    const result = sheetService.deleteSheet(id);
    if (result.success) {
      stopLoading();
    } else {
      setLoadingError(result.error || 'Error al eliminar la hoja');
    }
  }, [startLoading, stopLoading, setLoadingError]);

  const renameSheet = useCallback((id: string, name: string) => {
    const result = sheetService.renameSheet(id, name);
    if (!result.success) {
      console.error('Error renaming sheet:', result.error);
    }
  }, []);

  return {
    sheets,
    isLoading,
    error,
    createSheet,
    deleteSheet,
    renameSheet,
  };
}

export function useSheetMessages(sheetId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { isLoading, error, startLoading, stopLoading, setLoadingError } = useLoading();

  useEffect(() => {
    const loadMessages = () => {
      const result = sheetService.getSheetMessages(sheetId);
      if (result.success) {
        setMessages(result.data || []);
      }
    };

    loadMessages();
    const unsubscribe = sheetService.subscribe(loadMessages);
    return unsubscribe;
  }, [sheetId]);

  const addMessage = useCallback((content: string) => {
    startLoading();
    const result = sheetService.addMessage(sheetId, content);
    if (result.success) {
      stopLoading();
    } else {
      setLoadingError(result.error || 'Error al agregar el mensaje');
    }
  }, [sheetId, startLoading, stopLoading, setLoadingError]);

  const reEvaluateMessage = useCallback((messageId: string) => {
    startLoading();
    const result = sheetService.reEvaluateMessage(sheetId, messageId);
    if (result.success) {
      stopLoading();
    } else {
      setLoadingError(result.error || 'Error al re-evaluar el mensaje');
    }
  }, [sheetId, startLoading, stopLoading, setLoadingError]);

  const updateMessage = useCallback((_messageId: string, _content: string) => {
    // TODO: Implement update functionality in sheetService
    console.warn('Update message functionality not yet implemented');
  }, []);

  return {
    messages,
    isLoading,
    error,
    addMessage,
    reEvaluateMessage,
    updateMessage,
  };
}