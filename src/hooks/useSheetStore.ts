import { useState, useEffect } from 'react';
import { sheetStore } from '../store/sheetStore';
import { SheetInfo, Message } from '../types';

export function useSheets() {
  const [sheets, setSheets] = useState<SheetInfo[]>([]);

  useEffect(() => {
    const updateSheets = () => setSheets(sheetStore.getSheets());

    // Initial load
    updateSheets();

    // Subscribe to changes
    const unsubscribe = sheetStore.subscribe(updateSheets);

    return () => {
      unsubscribe()
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
    const updateMessages = () => setMessages(sheetStore.getSheetMessages(sheetId));

    // Initial load
    updateMessages();

    // Subscribe to changes
    const unsubscribe = sheetStore.subscribe(updateMessages);

    return () => {
      unsubscribe()
    };
  }, [sheetId]);

  return {
    messages,
    addMessage: (content: string) => sheetStore.addMessage(sheetId, content),
    updateMessage: (messageId: string, content: string) =>
      sheetStore.updateMessage(sheetId, messageId, content)
  };
}