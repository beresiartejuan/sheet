import React from 'react';
import { Message } from '../types';
import { CellActions } from './CellActions';

interface CellInputProps {
  message: Message;
  isEditing: boolean;
  editContent: string;
  onEditStart: () => void;
  onEditChange: (content: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onReEvaluate: () => Promise<void>;
}

export function CellInput({
  message,
  isEditing,
  editContent,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel,
  onReEvaluate
}: CellInputProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEditSave();
    }
    if (e.key === 'Escape') {
      onEditCancel();
    }
  };

  return (
    <div className="flex items-center gap-4 mb-2">
      <div className="text-sm text-gray-500 font-mono min-w-0">
        In[{message.cellNumber}]:=
      </div>
      <div className="flex-1 relative">
        {isEditing ? (
          <input
            type="text"
            value={editContent}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={onEditSave}
            className="w-full py-2 focus:outline-none bg-transparent font-mono text-blue-900 text-base"
            autoFocus
          />
        ) : (
          <div className="py-2 hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={onEditStart}>
            <div className="font-mono text-blue-900 text-base">
              {message.content}
            </div>
          </div>
        )}

        <CellActions
          onEdit={onEditStart}
          onCopy={() => copyToClipboard(message.content)}
          onReEvaluate={onReEvaluate}
        />
      </div>
    </div>
  );
}