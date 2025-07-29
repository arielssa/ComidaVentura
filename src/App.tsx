import NutritiousPlateGame from './components/NutritiousPlateGame';
import { useArduino } from './hooks/useArduino';
import { foods } from './data/foods';
import { Food } from './types';
import backgroundImage from './bg-comidaventura.png';
import { useState, useRef, useEffect } from 'react';

// Receta establecida (puedes cambiar los ids por los de la receta que quieras)
const recetaEstablecida = [
  'chicken', // Pollo a la Plancha
  'carrots', // Zanahorias
  'apple',   // Manzana
  'brown-rice' // Arroz Integral
];

function App() {
  const { dish } = useArduino();
  const [facialActive, setFacialActive] = useState(false);
  const [showCameraToast, setShowCameraToast] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Ingredientes leídos por NFC (del plato actual)
  const ingredientesActuales = dish.foods;

  // Alimentos de la receta (objetos Food)
  const recetaFoods = recetaEstablecida.map(id => foods.find(f => f.id === id)).filter(Boolean) as Food[];

  // Funciones para iniciar/finalizar prueba
  const startFacialRecognition = () => {
    console.log('Iniciando reconocimiento facial...');
    setFacialActive(true);
    setShowCameraToast(true);
    
    // Método de comunicación múltiple
    const tryStartCollection = () => {
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          console.log('Intentando comunicar con iframe...');
          
          // Método 1: Llamada directa a función
          const win = iframe.contentWindow as any;
          if (typeof win.startEmotionCollection === 'function') {
            win.startEmotionCollection();
            console.log('✅ Método 1: Función directa ejecutada');
          } else if (win.FacialRecognition?.start) {
            win.FacialRecognition.start();
            console.log('✅ Método 1b: Objeto FacialRecognition ejecutado');
          } else {
            // Método 2: PostMessage
            console.log('Método 1 falló, intentando PostMessage...');
            iframe.contentWindow.postMessage({ type: 'START_EMOTION_COLLECTION' }, '*');
            console.log('✅ Método 2: PostMessage enviado');
          }
        } else {
          console.error('❌ No se pudo acceder al iframe');
        }
      } catch (error) {
        console.error('❌ Error iniciando recolección:', error);
        // Como último recurso, usar PostMessage
        try {
          const iframe = iframeRef.current;
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'START_EMOTION_COLLECTION' }, '*');
            console.log('✅ Método de respaldo: PostMessage enviado');
          }
        } catch (e) {
          console.error('❌ Todos los métodos fallaron:', e);
        }
      }
    };

    // Intentar inmediatamente y luego con delay
    setTimeout(tryStartCollection, 500);
    setTimeout(tryStartCollection, 2000);
    setTimeout(tryStartCollection, 4000);
  };

  const stopFacialRecognition = () => {
    console.log('Deteniendo reconocimiento facial...');
    
    const tryStopCollection = () => {
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentWindow) {
          const win = iframe.contentWindow as any;
          
          // Método 1: Llamada directa
          if (typeof win.stopEmotionCollectionAndSend === 'function') {
            win.stopEmotionCollectionAndSend();
            console.log('✅ Método 1: Función directa ejecutada');
          } else if (win.FacialRecognition?.stop) {
            win.FacialRecognition.stop();
            console.log('✅ Método 1b: Objeto FacialRecognition ejecutado');
          } else {
            // Método 2: PostMessage
            console.log('Método 1 falló, intentando PostMessage...');
            iframe.contentWindow.postMessage({ type: 'STOP_EMOTION_COLLECTION' }, '*');
            console.log('✅ Método 2: PostMessage enviado');
          }
        }
      } catch (error) {
        console.error('❌ Error deteniendo recolección:', error);
        // Como último recurso, usar PostMessage
        try {
          const iframe = iframeRef.current;
          if (iframe?.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'STOP_EMOTION_COLLECTION' }, '*');
            console.log('✅ Método de respaldo: PostMessage enviado');
          }
        } catch (e) {
          console.error('❌ Todos los métodos fallaron:', e);
        }
      }
    };

    tryStopCollection();
    
    setFacialActive(false);
    setShowCameraToast(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  // Escuchar mensajes del iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Mensaje recibido del iframe:', event.data);
      
      if (event.data.type === 'EMOTION_COLLECTION_STARTED') {
        console.log('✅ Confirmación: Recolección iniciada');
      } else if (event.data.type === 'EMOTION_COLLECTION_STOPPED') {
        console.log(`✅ Confirmación: Recolección detenida (${event.data.count} emociones)`);
      } else if (event.data.type === 'EMOTION_SAVE_SUCCESS') {
        console.log('✅ Confirmación: Emociones guardadas exitosamente');
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 3000);
      } else if (event.data.type === 'EMOTION_SAVE_ERROR') {
        console.error('❌ Error guardando emociones:', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Toast de cámara activa */}
      {showCameraToast && (
        <div className="fixed top-8 right-8 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
          Cámara de reconocimiento facial activa
        </div>
      )}
      {/* Toast de guardado */}
      {showSavedToast && (
        <div className="fixed top-8 right-8 z-50 bg-blue-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
          ¡Gráfica de emociones guardada!
        </div>
      )}
      {/* Botones para reconocimiento de expresiones */}
      {!facialActive ? (
        <button
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ pointerEvents: 'auto' }}
          onClick={startFacialRecognition}
        >
          Iniciar prueba de reconocimiento de expresiones
        </button>
      ) : (
        <button
          className="fixed bottom-8 right-8 z-50 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400"
          style={{ pointerEvents: 'auto' }}
          onClick={stopFacialRecognition}
        >
          Finalizar prueba de reconocimiento de expresiones
        </button>
      )}
      {/* Iframe oculto para reconocimiento facial */}
      {facialActive && (
        <iframe
          ref={iframeRef}
          src="/FaceExpressionRecognition/index.html"
          title="Reconocimiento Facial"
          style={{ width: 0, height: 0, border: 'none', position: 'absolute', left: '-9999px' }}
          tabIndex={-1}
          aria-hidden="true"
          allow="camera; microphone"
        />
      )}
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20 pointer-events-none"></div>
      
      {/* Floating background elements - keeping subtle animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-12 h-12 bg-yellow-300 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-10 h-10 bg-green-300 rounded-full opacity-15 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-blue-300 rounded-full opacity-10 animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-pink-300 rounded-full opacity-15 animate-pulse"></div>
        <div className="absolute top-1/2 left-5 w-6 h-6 bg-orange-300 rounded-full opacity-10 animate-bounce"></div>
        <div className="absolute top-20 left-1/2 w-10 h-10 bg-purple-300 rounded-full opacity-10 animate-ping"></div>
      </div>
      
      {/* Game content */}
      <div className="relative z-10">
        <NutritiousPlateGame
          receta={recetaFoods}
          ingredientes={ingredientesActuales}
        />
      </div>
    </div>
  );
}

export default App;