const video = document.getElementById('video')

// Array global para almacenar emociones
window.emotionResults = [];
window._collectingEmotions = false;

// Iniciar la recolección de emociones
window.startEmotionCollection = function() {
  console.log('=== INICIANDO RECOLECCIÓN DE EMOCIONES ===');
  console.log('Limpiando array de emociones...');
  window.emotionResults = [];
  window._collectingEmotions = true;
  console.log('✅ Recolección de emociones ACTIVADA');
  
  // Actualizar textarea para mostrar estado
  const textarea = document.querySelector('textarea');
  if (textarea) {
    textarea.value = '🟢 RECOLECCIÓN ACTIVA - Mira a la cámara y haz diferentes expresiones...\n\n';
  }
  
  // Notificar al padre si estamos en iframe
  if (window.parent !== window) {
    try {
      window.parent.postMessage({ type: 'EMOTION_COLLECTION_STARTED' }, '*');
    } catch(e) {}
  }
}

// Detener y enviar emociones al backend
window.stopEmotionCollectionAndSend = async function() {
  console.log('=== INICIANDO GUARDADO DE EMOCIONES ===');
  console.log('Deteniendo recolección de emociones...');
  console.log(`Total de emociones recolectadas: ${window.emotionResults.length}`);
  
  window._collectingEmotions = false;
  
  // Notificar al padre si estamos en iframe
  if (window.parent !== window) {
    try {
      window.parent.postMessage({ 
        type: 'EMOTION_COLLECTION_STOPPED', 
        count: window.emotionResults.length 
      }, '*');
    } catch(e) {}
  }
  
  if (window.emotionResults.length > 0) {
    try {
      console.log('Guardando datos localmente...');
      console.log('Datos a guardar:', window.emotionResults);
      console.log('Número de emociones:', window.emotionResults.length);
      
      // Crear timestamp para los archivos
      const now = new Date();
      const timestamp = now.getFullYear().toString() + 
                       (now.getMonth() + 1).toString().padStart(2, '0') + 
                       now.getDate().toString().padStart(2, '0') + '_' +
                       now.getHours().toString().padStart(2, '0') + 
                       now.getMinutes().toString().padStart(2, '0') + 
                       now.getSeconds().toString().padStart(2, '0');
      
      // Convertir datos de emociones a formato JSON plano
      const emotionsData = window.emotionResults.map(emotion => {
        // Convertir objeto de emociones a objeto plano
        const plainEmotion = {};
        for (const key in emotion) {
          plainEmotion[key] = emotion[key];
        }
        return plainEmotion;
      });
      
      // 1. Crear y descargar archivo JSON
      const jsonData = {
        timestamp: timestamp,
        totalSamples: emotionsData.length,
        sampleRate: '~10 Hz (1 sample every 100ms)',
        duration: `${(emotionsData.length / 10).toFixed(1)} seconds`,
        emotions: emotionsData
      };
      
      const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      
      const jsonLink = document.createElement('a');
      jsonLink.href = jsonUrl;
      jsonLink.download = `emotions_${timestamp}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);
      
      console.log('✅ Archivo JSON descargado:', `emotions_${timestamp}.json`);
      
      // 2. Crear y descargar reporte CSV
      const csvHeaders = ['Tiempo(s)', 'neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'];
      let csvContent = csvHeaders.join(',') + '\n';
      
      emotionsData.forEach((emotion, index) => {
        const time = (index / 10).toFixed(1);
        const values = [
          time,
          emotion.neutral?.toFixed(4) || '0',
          emotion.happy?.toFixed(4) || '0',
          emotion.sad?.toFixed(4) || '0',
          emotion.angry?.toFixed(4) || '0',
          emotion.fearful?.toFixed(4) || '0',
          emotion.disgusted?.toFixed(4) || '0',
          emotion.surprised?.toFixed(4) || '0'
        ];
        csvContent += values.join(',') + '\n';
      });
      
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      const csvUrl = URL.createObjectURL(csvBlob);
      
      const csvLink = document.createElement('a');
      csvLink.href = csvUrl;
      csvLink.download = `emotions_${timestamp}.csv`;
      document.body.appendChild(csvLink);
      csvLink.click();
      document.body.removeChild(csvLink);
      URL.revokeObjectURL(csvUrl);
      
      console.log('✅ Archivo CSV descargado:', `emotions_${timestamp}.csv`);
      
      // 3. Crear y descargar reporte de texto
      let report = `REPORTE DE ANÁLISIS DE EMOCIONES - COMIDAVENTURA
===============================================
Fecha: ${new Date().toLocaleString()}
Duración de la sesión: ${emotionsData.length} muestras
Frecuencia de muestreo: ~10 Hz (1 muestra cada 100ms)
Tiempo total: ${(emotionsData.length / 10).toFixed(1)} segundos

ESTADÍSTICAS GENERALES:
=======================
`;

      // Calcular estadísticas
      const emotionNames = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'];
      const stats = {};
      
      emotionNames.forEach(emotionName => {
        const values = emotionsData.map(sample => sample[emotionName] || 0);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        
        stats[emotionName] = { avg, max, min, sum };
        
        report += `${emotionName.charAt(0).toUpperCase() + emotionName.slice(1)}:
  - Promedio: ${(avg * 100).toFixed(2)}%
  - Máximo: ${(max * 100).toFixed(2)}%
  - Mínimo: ${(min * 100).toFixed(2)}%
  - Tiempo total activa: ${(sum / 10).toFixed(1)}s

`;
      });
      
      // Emoción dominante
      const dominantEmotion = emotionNames.reduce((a, b) => stats[a].avg > stats[b].avg ? a : b);
      report += `EMOCIÓN DOMINANTE: ${dominantEmotion.toUpperCase()} (${(stats[dominantEmotion].avg * 100).toFixed(2)}%)

`;
      
      // Momentos de alta intensidad emocional
      report += `MOMENTOS DE ALTA INTENSIDAD EMOCIONAL (>70%):
=============================================
`;
      
      let highIntensityFound = false;
      emotionsData.forEach((sample, index) => {
        const time = (index / 10).toFixed(1);
        const maxEmotion = emotionNames.reduce((a, b) => 
          (sample[a] || 0) > (sample[b] || 0) ? a : b
        );
        const intensity = sample[maxEmotion] || 0;
        
        if (intensity > 0.7) {
          report += `${time}s: ${maxEmotion} (${(intensity * 100).toFixed(1)}%)
`;
          highIntensityFound = true;
        }
      });
      
      if (!highIntensityFound) {
        report += `No se detectaron momentos de alta intensidad emocional (>70%)

`;
      }
      
      const reportBlob = new Blob([report], { type: 'text/plain' });
      const reportUrl = URL.createObjectURL(reportBlob);
      
      const reportLink = document.createElement('a');
      reportLink.href = reportUrl;
      reportLink.download = `reporte_${timestamp}.txt`;
      document.body.appendChild(reportLink);
      reportLink.click();
      document.body.removeChild(reportLink);
      URL.revokeObjectURL(reportUrl);
      
      console.log('✅ Reporte de texto descargado:', `reporte_${timestamp}.txt`);
      
      // Notificar éxito al padre
      if (window.parent !== window) {
        try {
          window.parent.postMessage({ 
            type: 'EMOTION_SAVE_SUCCESS', 
            result: {
              message: 'Archivos descargados exitosamente',
              count: window.emotionResults.length,
              timestamp: timestamp,
              files: [`emotions_${timestamp}.json`, `emotions_${timestamp}.csv`, `reporte_${timestamp}.txt`],
              path: 'Carpeta de Descargas'
            }
          }, '*');
        } catch(e) {}
      }
      
      alert(`¡Emociones guardadas exitosamente!\n\n📁 Archivos descargados en tu carpeta de Descargas:\n\n- emotions_${timestamp}.json (datos completos)\n- emotions_${timestamp}.csv (para Excel/análisis)\n- reporte_${timestamp}.txt (resumen estadístico)\n\n📊 Total de emociones analizadas: ${emotionsData.length}\n⏱️ Duración de la sesión: ${(emotionsData.length / 10).toFixed(1)} segundos`);
      
    } catch (e) {
      console.error('❌ Error guardando emociones:', e);
      console.error('- Nombre del error:', e.name);
      console.error('- Mensaje:', e.message);
      console.error('- Stack:', e.stack);
      
      // Notificar error al padre
      if (window.parent !== window) {
        try {
          window.parent.postMessage({ 
            type: 'EMOTION_SAVE_ERROR', 
            error: e.message 
          }, '*');
        } catch(err) {}
      }
      
      alert(`Error guardando: ${e.message}`);
    }
  } else {
    console.log('⚠️ No hay emociones para enviar');
    
    // Notificar al padre
    if (window.parent !== window) {
      try {
        window.parent.postMessage({ 
          type: 'EMOTION_SAVE_ERROR', 
          error: 'No se capturaron emociones' 
        }, '*');
      } catch(e) {}
    }
    
    alert('No se capturaron emociones durante la sesión');
  }
  
  console.log('=== FIN DEL PROCESO DE GUARDADO ===');
}

window.addEventListener('message', function(event) {
  console.log('Mensaje recibido en iframe:', event.data);
  
  if (event.data.type === 'START_EMOTION_COLLECTION') {
    window.startEmotionCollection();
  } else if (event.data.type === 'STOP_EMOTION_COLLECTION') {
    window.stopEmotionCollectionAndSend();
  }
});

// Exponer las funciones globalmente de múltiples maneras
if (typeof window !== 'undefined') {
  // Método 1: Propiedades directas
  window.startEmotionCollection = window.startEmotionCollection;
  window.stopEmotionCollectionAndSend = window.stopEmotionCollectionAndSend;
  
  // Método 2: En un objeto global
  window.FacialRecognition = {
    start: window.startEmotionCollection,
    stop: window.stopEmotionCollectionAndSend,
    isCollecting: () => window._collectingEmotions,
    getResults: () => window.emotionResults
  };
}

console.log('Cargando modelos de face-api...');
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/FaceExpressionRecognition/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/FaceExpressionRecognition/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/FaceExpressionRecognition/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/FaceExpressionRecognition/models')
]).then(() => {
  console.log('Modelos cargados exitosamente');
  startVideo();
}).catch(err => {
  console.error('Error cargando modelos:', err);
});

async function startVideo() {
  try {
    console.log('Solicitando acceso a la cámara...');
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: 720, 
        height: 560,
        facingMode: 'user'
      } 
    });
    video.srcObject = stream;
    
    // Forzar que el video se reproduzca
    video.play().then(() => {
      console.log('✅ Video reproduciendo correctamente');
    }).catch(err => {
      console.error('❌ Error reproduciendo video:', err);
    });
    
    console.log('Cámara iniciada correctamente');
  } catch (err) {
    console.error('Error accediendo a la cámara:', err);
    
    // Mostrar mensaje de error más específico
    const errorMessages = {
      'NotAllowedError': 'Permiso denegado. Por favor, permite el acceso a la cámara.',
      'NotFoundError': 'No se encontró cámara. Conecta una cámara e intenta de nuevo.',
      'NotReadableError': 'Cámara en uso por otra aplicación.',
      'OverconstrainedError': 'Configuración de cámara no soportada.',
      'SecurityError': 'Acceso denegado por razones de seguridad.'
    };
    
    const message = errorMessages[err.name] || `Error desconocido: ${err.message}`;
    alert(`Error de cámara: ${message}`);
  }
}

// Función para iniciar la detección
function startDetection() {
  console.log('🎯 Iniciando bucle de detección...');
  
  // Verificar que el video esté listo antes de crear el canvas
  if (video.readyState < 2) {
    console.log('⏳ Video no está listo, esperando...');
    setTimeout(startDetection, 500);
    return;
  }
  
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    console.log('⏳ Dimensiones del video no disponibles, esperando...');
    setTimeout(startDetection, 500);
    return;
  }
  
  console.log(`✅ Video listo: ${video.videoWidth}x${video.videoHeight}, readyState: ${video.readyState}`);
  
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  
  let detectionCount = 0;
  let lastLogTime = 0;
  
  const detectionInterval = setInterval(async () => {
    try {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      
      detectionCount++;
      const now = Date.now();
      
      // Log cada 2 segundos para no saturar la consola
      if (now - lastLogTime > 2000) {
        console.log(`[${detectionCount}] Rostros detectados: ${detections?.length || 0}`);
        console.log(`Estado recolección: ${window._collectingEmotions ? 'ACTIVA' : 'INACTIVA'}`);
        console.log(`Total emociones guardadas: ${window.emotionResults.length}`);
        lastLogTime = now;
      }
      
      // Guardar emociones si está activo
      if (window._collectingEmotions && detections && detections.length > 0) {
        // Solo guardamos las emociones del primer rostro detectado
        const emotions = detections[0].expressions;
        window.emotionResults.push(emotions);
        console.log(`✅ Emoción capturada ${window.emotionResults.length}:`, emotions);
        
        // Actualizar textarea con la última emoción
        const textarea = document.querySelector('textarea');
        if (textarea) {
          const emotionText = Object.entries(emotions)
            .map(([emotion, value]) => `${emotion}: ${(value * 100).toFixed(1)}%`)
            .join(', ');
          textarea.value = `🟢 RECOLECTANDO - Total emociones: ${window.emotionResults.length}\nÚltima: ${emotionText}\n` + textarea.value.split('\n').slice(2).join('\n');
        }
      } else if (window._collectingEmotions && (!detections || detections.length === 0)) {
        if (detectionCount % 50 === 0) { // Log cada 5 segundos aprox
          console.log('⚠️ Recolectando emociones pero no hay rostros detectados');
        }
      }
      
      const resizedDetections = faceapi.resizeResults(detections, displaySize)
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
      faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    } catch (error) {
      console.error('Error en detección:', error);
    }
  }, 100);
  
  // Guardar referencia al intervalo para poder detenerlo si es necesario
  window.detectionInterval = detectionInterval;
}

// Event listeners para el video
video.addEventListener('loadedmetadata', () => {
  console.log('📹 Metadatos del video cargados');
  console.log(`Dimensiones del video: ${video.videoWidth}x${video.videoHeight}`);
});

video.addEventListener('canplay', () => {
  console.log('📹 Video puede empezar a reproducirse');
});

video.addEventListener('loadeddata', () => {
  console.log('📊 Datos del video cargados completamente');
  // Intentar iniciar detección cuando los datos estén listos
  if (!window.detectionInterval) {
    setTimeout(startDetection, 100);
  }
});

video.addEventListener('play', () => {
  console.log('▶️ Video iniciado, comenzando detección...');
  // Dar un pequeño delay para asegurar que esté reproduciendo
  setTimeout(startDetection, 200);
});

video.addEventListener('playing', () => {
  console.log('🎬 Video reproduciéndose activamente');
  // Como último recurso, intentar aquí también
  if (!window.detectionInterval) {
    setTimeout(startDetection, 100);
  }
});

// También intentar iniciar la detección después de un delay si los eventos no se disparan
setTimeout(() => {
  if (video.readyState >= 2 && !window.detectionInterval) {
    console.log('🔄 Iniciando detección manualmente (video listo)');
    startDetection();
  }
}, 3000);