import React, { useState, useEffect, useRef } from 'react';
import { NotebookCell } from './NotebookCell';
import { SheetHeader } from './SheetHeader';
import { SheetInput } from './SheetInput';
import { EmptySheet } from './EmptySheet';
import { useSheetMessages } from '../hooks/useSheetStore';

interface SheetProps {
  sheetId: string;
  sheetName: string;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function Sheet({ sheetId, sheetName, onToggleSidebar, isSidebarOpen }: SheetProps) {
  const [inputValue, setInputValue] = useState('');
  const { messages, addMessage, updateMessage } = useSheetMessages(sheetId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    addMessage(inputValue);
    setInputValue('');
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    updateMessage(messageId, newContent);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <SheetHeader sheetName={sheetName} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <EmptySheet />
          ) : (
            messages.map((message) => (
              <NotebookCell 
                key={message.id} 
                message={message} 
                onEdit={handleEditMessage}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <SheetInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        cellNumber={messages.length + 1}
      />
    </div>
  );
}