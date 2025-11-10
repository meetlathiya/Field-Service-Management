
import React, { useRef, useEffect, useCallback } from 'react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClear: () => void;
  existingSignature?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear, existingSignature }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const getCanvasContext = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const clearCanvas = useCallback(() => {
    const ctx = getCanvasContext();
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      onClear();
    }
  }, [onClear]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (canvas && ctx) {
        // Set canvas size
        const { width, height } = canvas.getBoundingClientRect();
        canvas.width = width;
        canvas.height = height;

        if (existingSignature) {
            const img = new Image();
            img.src = existingSignature;
            img.onload = () => ctx.drawImage(img, 0, 0);
        } else {
            ctx.fillStyle = "#FFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
  }, [existingSignature]);
  

  const getCoordinates = (event: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if (event instanceof MouseEvent) {
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
    if (event.touches && event.touches.length > 0) {
      return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    isDrawing.current = true;
    const { x, y } = getCoordinates(event.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const ctx = getCanvasContext();
    if (!ctx) return;
    const { x, y } = getCoordinates(event.nativeEvent);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div>
        <canvas
            ref={canvasRef}
            className="w-full h-48 border border-gray-300 rounded-md cursor-crosshair bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        />
        <div className="flex justify-end space-x-2 mt-2">
            <button onClick={clearCanvas} className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Clear</button>
            <button onClick={handleSave} className="px-3 py-1 text-sm bg-accent text-white rounded-md hover:bg-green-600">Save Signature</button>
        </div>
    </div>
  );
};
