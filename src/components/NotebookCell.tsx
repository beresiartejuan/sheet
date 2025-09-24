import React from 'react';
import { Message } from '../types';
import { CellInput } from './CellInput';
import { CellOutput } from './CellOutput';

interface NotebookCellProps {
  message: Message;
  onEdit: (id: string, newContent: string) => void;
  onReEvaluate: (id: string) => void;
  sheetId: string;
}

export function NotebookCell({ message, onEdit, onReEvaluate, sheetId }: NotebookCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editContent, setEditContent] = React.useState(message.content);

  const handleSaveEdit = () => {
    onEdit(message.id, editContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  return (
    <div className="group">
      <CellInput
        message={message}
        isEditing={isEditing}
        editContent={editContent}
        onEditStart={() => setIsEditing(true)}
        onEditChange={setEditContent}
        onEditSave={handleSaveEdit}
        onEditCancel={handleCancelEdit}
        onReEvaluate={() => onReEvaluate(message.id)}
      />

      <CellOutput
        message={message}
        onReEvaluate={() => onReEvaluate(message.id)}
        sheetId={sheetId}
      />
    </div>
  );
}