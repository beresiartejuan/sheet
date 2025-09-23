import { useState, useEffect } from 'react';
import { sheetStore } from '../store/sheetStore';
import { SheetInfo, Message } from '../types';

export function useSheets() {
  const [sheets, setSheets] = useState<SheetInfo[]>([]);

  useEffect(() => {
    const updateSheets = () => {
      const newSheets = sheetStore.getSheets();
      setSheets(newSheets);
    };

    // Initial load
    updateSheets();

    // Subscribe to changes
    const unsubscribe = sheetStore.subscribe(updateSheets);

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    sheets,
    createSheet: () => sheetStore.createSheet(),
    deleteSheet: (id: string) => sheetStore.deleteSheet(id),
    renameSheet: (id: string, name: string) => sheetStore.renameSheet(id, name)
  };
}

export function useSheetMessages(sheetId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const updateMessages = () => {
      const newMessages = sheetStore.getSheetMessages(sheetId);
      setMessages(newMessages);
    };

    // Initial load
    updateMessages();

    // Subscribe to changes
    const unsubscribe = sheetStore.subscribe(updateMessages);

    return () => {
      unsubscribe();
    };
  }, [sheetId]);

  return {
    messages,
    addMessage: (content: string) => sheetStore.addMessage(sheetId, content),
    reEvaluateMessage: (messageId: string) => sheetStore.reEvaluateMessage(sheetId, messageId),
    updateMessage: (messageId: string, content: string) =>
      sheetStore.updateMessage(sheetId, messageId, content)
  };
}