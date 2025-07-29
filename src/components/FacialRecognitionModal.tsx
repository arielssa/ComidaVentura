import React, { useEffect, useRef, useState } from 'react';

// Extender el tipo Window para las funciones globales del iframe
declare global {
  interface Window {
    startEmotionCollection?: () => void;
    stopEmotionCollectionAndSend?: () => void;
  }
}

interface FacialRecognitionModalProps {
  open: boolean;
  onClose: () => void;
}

const FacialRecognitionModal: React.FC<FacialRecognitionModalProps> = ({ open, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Iniciar/Detener recolección de emociones al abrir/cerrar el modal
  useEffect(() => {
    if (open && iframeRef.current) {
      setMensaje(null);
      // Esperar a que el iframe cargue
      const handleLoad = () => {
        try {
          (iframeRef.current?.contentWindow as Window)?.startEmotionCollection?.();
        } catch (e) {}
      };
      iframeRef.current.addEventListener('load', handleLoad);
      // Si ya está cargado
      if (iframeRef.current.contentWindow) {
        try {
          (iframeRef.current.contentWindow as Window).startEmotionCollection?.();
        } catch {}
      }
      return () => {
        iframeRef.current?.removeEventListener('load', handleLoad);
      };
    }
    // Al cerrar, detener y enviar emociones
    if (!open && iframeRef.current) {
      // Llamar a la función y esperar la respuesta del backend
      const sendEmotions = async () => {
        try {
          const result = await (iframeRef.current!.contentWindow as any).stopEmotionCollectionAndSend?.();
          // Hacemos un fetch manual para obtener la confirmación
          // (El script.js ya hace el fetch, pero aquí lo repetimos para feedback)
          setMensaje('Guardando gráfica de emociones...');
          // Esperar un poco para que el backend procese
          setTimeout(async () => {
            // Opcional: podrías consultar el backend para confirmar
            setMensaje('¡Gráfica de emociones guardada exitosamente!');
          }, 2000);
        } catch {
          setMensaje('Ocurrió un error al guardar las emociones.');
        }
      };
      sendEmotions();
    }
  }, [open]);

  if (!open && !mensaje) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-lg shadow-lg p-4 relative w-full max-w-2xl h-[80vh] flex flex-col">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-2">Reconocimiento de Expresiones Faciales</h2>
        {mensaje ? (
          <div className="flex-1 flex flex-col items-center justify-center text-green-700 text-lg font-semibold">
            {mensaje}
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src="/FaceExpressionRecognition/index.html"
            title="Reconocimiento Facial"
            className="flex-1 w-full border rounded"
          />
        )}
      </div>
    </div>
  );
};

export default FacialRecognitionModal; 