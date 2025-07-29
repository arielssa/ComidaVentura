const video = document.getElementById('video')

// Array global para almacenar emociones
window.emotionResults = [];
window._collectingEmotions = false;

// Iniciar la recolección de emociones
window.startEmotionCollection = function() {
  window.emotionResults = [];
  window._collectingEmotions = true;
}
// Detener y enviar emociones al backend
window.stopEmotionCollectionAndSend = async function() {
  window._collectingEmotions = false;
  if (window.emotionResults.length > 0) {
    try {
      await fetch('http://localhost:5000/save-emotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emotions: window.emotionResults })
      });
    } catch (e) {
      console.error('Error enviando emociones:', e);
    }
  }
}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/FaceExpressionRecognition/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/FaceExpressionRecognition/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/FaceExpressionRecognition/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/FaceExpressionRecognition/models')
]).then(startVideo)

async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: 720, 
        height: 560,
        facingMode: 'user'
      } 
    });
    video.srcObject = stream;
    console.log('Cámara iniciada correctamente');
  } catch (err) {
    console.error('Error accediendo a la cámara:', err);
    alert('Error: No se pudo acceder a la cámara. Asegúrate de que esté conectada y de dar permisos.');
  }
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    // Guardar emociones si está activo
    if (window._collectingEmotions && detections && detections.length > 0) {
      // Solo guardamos las emociones del primer rostro detectado
      window.emotionResults.push(detections[0].expressions)
    }
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 100)
})