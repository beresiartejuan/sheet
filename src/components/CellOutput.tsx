import { Message } from '../types';
import { CellActions } from './CellActions';

interface CellOutputProps {
  message: Message;
}

export function CellOutput({ message }: CellOutputProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (message.output === undefined || message.output === null) return null;

  const isTextOutput = message.outputType === 'text';

  return (
    <div className={`flex gap-4 mb-6 ${isTextOutput ? 'items-center' : 'items-start'}`}>
      <div className="text-sm text-gray-500 font-mono min-w-0">
        Out[{message.cellNumber}]=
      </div>
      <div className="flex-1 relative">
        <div className="py-2">
          {message.outputType === 'image' ? (
            <img
              src={message.output}
              alt="Mathematical output"
              className="max-w-full h-auto"
            />
          ) : message.outputType === 'canvas' ? (
            <div className="bg-white border rounded p-4">
              <canvas
                width="400"
                height="300"
                className="border"
                ref={(canvas) => {
                  if (canvas && message.canvasData) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.fillStyle = '#f3f4f6';
                      ctx.fillRect(0, 0, 400, 300);
                      ctx.fillStyle = '#6b7280';
                      ctx.font = '16px monospace';
                      ctx.textAlign = 'center';
                      ctx.fillText('Canvas Output', 200, 150);
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="font-mono text-gray-700 text-base">
              {message.output}
            </div>
          )}
        </div>

        <CellActions
          onEdit={() => { }}
          onCopy={() => copyToClipboard(message.output || '')}
        />
      </div>
    </div>
  );
}