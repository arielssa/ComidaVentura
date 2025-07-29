const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ML Service configuration
const ML_SERVICE_URL = 'http://localhost:5000';

// ML Service helper functions
async function callMLService(endpoint, data = null, method = 'GET') {
  try {
    const config = {
      method,
      url: `${ML_SERVICE_URL}${endpoint}`,
      timeout: 30000, // 30 segundos
    };
    
    if (data && method !== 'GET') {
      config.data = data;
      config.headers = {
        'Content-Type': 'application/json'
      };
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error calling ML service ${endpoint}:`, error.message);
    throw error;
  }
}

async function checkMLServiceHealth() {
  try {
    const response = await callMLService('/health');
    return response.status === 'healthy';
  } catch (error) {
    return false;
  }
}

// Convert food data to ML format
function convertFoodToMLFormat(food) {

  // Función auxiliar para estimar sodio basado en el tipo de alimento
  function estimateSodium(food) {
    const category = food.category?.toLowerCase() || '';
    const name = food.name?.toLowerCase() || '';
    
    // Alimentos procesados tienen más sodio
    if (name.includes('frito') || name.includes('chips') || name.includes('embutido')) return 400;
    if (category === 'snack') return 300;
    if (category === 'processed') return 350;
    // Carnes y pescados
    if (category === 'protein') return 80;
    // Vegetales y frutas
    if (category === 'vegetable' || category === 'fruit') return 5;
    // Granos y cereales
    if (category === 'grain') return 10;
    // Por defecto
    return 50;
  }
  
  // Función auxiliar para estimar colesterol
  function estimateCholesterol(food) {
    const category = food.category?.toLowerCase() || '';
    const name = food.name?.toLowerCase() || '';
    
    // Productos de origen animal tienen colesterol
    if (name.includes('pollo') || name.includes('chicken')) return 85;
    if (name.includes('carne') || name.includes('beef')) return 90;
    if (name.includes('pescado') || name.includes('salmon') || name.includes('fish')) return 60;
    if (name.includes('huevo') || name.includes('egg')) return 186;
    if (category === 'protein') return 70;
    // Productos vegetales no tienen colesterol
    return 0;
  }
  
  // Función auxiliar para puntaje de vitaminas/minerales
  function estimateVitaminScore(food) {
    const category = food.category?.toLowerCase() || '';
    const name = food.name?.toLowerCase() || '';
    
    // Frutas y vegetales tienen más vitaminas
    if (category === 'fruit' || category === 'vegetable') return 8;
    if (name.includes('brócoli') || name.includes('espinaca')) return 9;
    // Proteínas animales tienen vitaminas B
    if (category === 'protein') return 6;
    // Granos integrales
    if (category === 'grain') return 5;
    // Alimentos procesados tienen menos
    if (category === 'snack' || category === 'processed') return 2;
    // Por defecto
    return 4;
  }

  let baseData;
  
  console.log('🔍 Procesando alimento:', food.name, {
    hasNutrition: !!food.nutrition,
    hasActualCalories: !!food.actualCalories,
    calories: food.calories,
    actualCalories: food.actualCalories,
    nutrition: food.nutrition
  });

  // Si el alimento tiene información nutricional completa, úsala
  if (food.nutrition) {
    console.log('✅ Usando datos nutrition:', food.nutrition);
    baseData = {
      calories: food.nutrition.calories || 0,
      protein: food.nutrition.protein || 0,
      carbs: food.nutrition.carbs || 0,
      fat: food.nutrition.fat || 0,
      fiber: food.nutrition.fiber || 0,
      sugar: food.nutrition.sugar || 0
    };
  }
  // Si solo tiene actualCalories (de Arduino), usar valores básicos
  else if (food.actualCalories) {
    console.log('⚠️ Solo actualCalories, usando valores básicos');
    baseData = {
      calories: food.actualCalories,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    };
  }
  // Valores por defecto
  else {
    console.log('❌ Sin datos nutricionales, usando valores por defecto');
    baseData = {
      calories: food.calories || 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    };
  }
  
  // Agregar las 3 características adicionales para completar las 9
  return {
    ...baseData,
    sodium: estimateSodium(food),
    cholesterol: estimateCholesterol(food),
    vitaminScore: estimateVitaminScore(food)
  };
}

// Food data mapping (matching your Arduino code) - Includes full nutrition data
const foodMapping = {
  "Salmon": { 
    id: 'fish', 
    name: 'Salmón', 
    calories: 208, 
    category: 'protein',
    nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0 },
    healthScore: 5,
    image: '🐟',
    color: 'bg-blue-100'
  },
  "Chicken": { 
    id: 'chicken', 
    name: 'Pollo a la Plancha', 
    calories: 165, 
    category: 'protein',
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 },
    healthScore: 5,
    image: '🍗',
    color: 'bg-orange-100'
  },
  "Eggs": { 
    id: 'eggs', 
    name: 'Huevos', 
    calories: 155, 
    category: 'protein',
    nutrition: { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sugar: 1 },
    healthScore: 4,
    image: '🥚',
    color: 'bg-yellow-100'
  },
  "Broccoli": { 
    id: 'broccoli', 
    name: 'Brócoli', 
    calories: 34, 
    category: 'vegetable',
    nutrition: { calories: 34, protein: 3, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5 },
    healthScore: 5,
    image: '🥦',
    color: 'bg-green-100'
  },
  "Carrot": { 
    id: 'carrots', 
    name: 'Zanahorias', 
    calories: 41, 
    category: 'vegetable',
    nutrition: { calories: 41, protein: 1, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7 },
    healthScore: 5,
    image: '🥕',
    color: 'bg-orange-100'
  },
  "Banana": { 
    id: 'banana', 
    name: 'Plátano', 
    calories: 89, 
    category: 'fruit',
    nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12 },
    healthScore: 4,
    image: '🍌',
    color: 'bg-yellow-100'
  },
  "Apple": { 
    id: 'apple', 
    name: 'Manzana', 
    calories: 52, 
    category: 'fruit',
    nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10 },
    healthScore: 5,
    image: '🍎',
    color: 'bg-red-100'
  },
  "Rice": { 
    id: 'brown-rice', 
    name: 'Arroz Integral', 
    calories: 111, 
    category: 'grain',
    nutrition: { calories: 111, protein: 3, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4 },
    healthScore: 4,
    image: '🍚',
    color: 'bg-amber-100'
  },
  "Bread": { 
    id: 'white-bread', 
    name: 'Pan Blanco', 
    calories: 75, 
    category: 'grain',
    nutrition: { calories: 75, protein: 2.3, carbs: 14, fat: 1, fiber: 0.8, sugar: 1.2 },
    healthScore: 2,
    image: '🍞',
    color: 'bg-orange-100'
  },
  "Cheese": { 
    id: 'cheese', 
    name: 'Queso', 
    calories: 113, 
    category: 'dairy',
    nutrition: { calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0, sugar: 0.5 },
    healthScore: 3,
    image: '🧀',
    color: 'bg-yellow-100'
  },
  "Yogurt": { 
    id: 'yogurt', 
    name: 'Yogur Natural', 
    calories: 59, 
    category: 'dairy',
    nutrition: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.2 },
    healthScore: 4,
    image: '🥛',
    color: 'bg-blue-100'
  },
  "Fried potatoes": { 
    id: 'chips', 
    name: 'Papas Fritas', 
    calories: 152, 
    category: 'snack',
    nutrition: { calories: 152, protein: 2, carbs: 15, fat: 10, fiber: 1.4, sugar: 0.1 },
    healthScore: 1,
    image: '🍟',
    color: 'bg-red-100'
  }
};

// Current dish state
let currentDish = {
  foods: [],
  totalCalories: 0,
  timestamp: new Date()
};

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 8080 });

// Broadcast to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Serial port configuration
let serialPort;
let parser;

// Function to initialize serial connection
function initializeSerial(portPath = '/dev/cu.usbmodem1201', baudRate = 9600) {
  try {
    serialPort = new SerialPort({   
      path: portPath,
      baudRate: baudRate,
    });

    parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    serialPort.on('open', () => {
      console.log(`✅ Serial port ${portPath} opened successfully`);
    });

    serialPort.on('error', (err) => {
      console.error('❌ Serial port error:', err.message);
    });

    // Parse Arduino data
    parser.on('data', (data) => {
      console.log('📡 Arduino data:', data);
      parseArduinoData(data.trim());
    });

  } catch (error) {
    console.error('❌ Failed to initialize serial port:', error.message);
  }
}

// Parse data from Arduino
function parseArduinoData(data) {
  try {
    // Handle reset command
    if (data.includes('Dish Reset!')) {
      currentDish = {
        foods: [],
        totalCalories: 0,
        timestamp: new Date()
      };
      
      broadcast({
        type: 'DISH_RESET',
        dish: currentDish
      });
      
      console.log('🔄 Dish reset');
      return;
    }

    // Handle food addition
    if (data.includes('Added:')) {
      const match = data.match(/Added: (.+?) \((\d+) calories\)/);
      if (match) {
        const foodName = match[1];
        const calories = parseInt(match[2]);
        
        const foodInfo = foodMapping[foodName];
        if (foodInfo) {
          const foodItem = {
            ...foodInfo,
            addedAt: new Date(),
            actualCalories: calories
          };
          
          console.log('🔍 Arduino - foodInfo from mapping:', foodInfo);
          console.log('🔍 Arduino - created foodItem:', foodItem);
          
          currentDish.foods.push(foodItem);
          currentDish.totalCalories += calories;
          currentDish.timestamp = new Date();
          
          console.log('🔍 Arduino - current dish foods:', currentDish.foods.map(f => ({
            name: f.name,
            id: f.id,
            hasNutrition: !!f.nutrition
          })));
          
          broadcast({
            type: 'FOOD_ADDED',
            food: foodItem,
            dish: currentDish
          });
          
          console.log(`🍽️ Added ${foodName} (${calories} cal) - Total: ${currentDish.totalCalories}`);
        }
      }
    }

    // Handle total calories update
    if (data.includes('Current Dish Total:')) {
      const match = data.match(/Current Dish Total: (\d+) calories/);
      if (match) {
        const totalFromArduino = parseInt(match[1]);
        currentDish.totalCalories = totalFromArduino;
        
        console.log('🔍 TOTAL_UPDATE - dish.foods antes de enviar:', currentDish.foods.map(f => ({
          name: f.name,
          id: f.id,
          hasNutrition: !!f.nutrition,
          nutrition: f.nutrition
        })));
        
        broadcast({
          type: 'TOTAL_UPDATE',
          totalCalories: totalFromArduino,
          dish: currentDish
        });
      }
    }

  } catch (error) {
    console.error('❌ Error parsing Arduino data:', error);
  }
}

// REST API Endpoints

// ML Service Endpoints

// Get ML service status
app.get('/api/ml/status', async (req, res) => {
  try {
    const isHealthy = await checkMLServiceHealth();
    if (isHealthy) {
      const info = await callMLService('/model-info');
      res.json({ 
        status: 'healthy',
        ml_service: info
      });
    } else {
      res.json({ 
        status: 'unhealthy',
        message: 'ML service is not responding'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      error: error.message 
    });
  }
});

// Train ML models
app.post('/api/ml/train', async (req, res) => {
  try {
    const result = await callMLService('/train', {}, 'POST');
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to start training',
      details: error.message 
    });
  }
});

// Get training status
app.get('/api/ml/training-status', async (req, res) => {
  try {
    const status = await callMLService('/training-status');
    res.json(status);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get training status',
      details: error.message 
    });
  }
});

// Predict dish health
app.post('/api/ml/predict', async (req, res) => {
  try {
    console.log('🚨 /api/ml/predict LLAMADO desde frontend!');
    const { foods, model_type = 'neural' } = req.body;
    
    console.log('🔍 Frontend enviado - foods:', foods.map(f => ({
      calories: f.calories,
      protein: f.protein,
      hasNutrition: f.nutrition !== undefined,
      originalKeys: Object.keys(f)
    })));
    
    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      return res.status(400).json({ 
        error: 'Foods array is required and cannot be empty' 
      });
    }
    
    // Los foods ya vienen procesados desde el frontend, NO necesitan convertFoodToMLFormat
    console.log('⚠️ USANDO ALIMENTOS YA PROCESADOS DEL FRONTEND');
    
    // Call ML service directly with the processed foods from frontend
    const prediction = await callMLService('/predict', {
      foods: foods,  // Ya procesados por getNutritionData() en el frontend
      model_type
    }, 'POST');
    
    res.json({
      ...prediction,
      foods_analyzed: foods.length
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to predict dish health',
      details: error.message 
    });
  }
});

// Predict current dish health
app.post('/api/ml/predict-current', async (req, res) => {
  try {
    console.log('🚨 /api/ml/predict-current LLAMADO!');
    console.log('🚨 Request body:', req.body);
    console.log('🚨 currentDish.foods:', currentDish.foods.map(f => ({
      id: f.id,
      name: f.name,
      hasNutrition: !!f.nutrition
    })));
    
    const { model_type = 'neural' } = req.body;
    
    if (!currentDish.foods || currentDish.foods.length === 0) {
      return res.status(400).json({ 
        error: 'No foods in current dish' 
      });
    }
    
    // Convert current dish foods to ML format with better nutrition mapping
    const mlFoods = currentDish.foods.map(food => {
      console.log('🔍 Processing food from currentDish:', { 
        id: food.id, 
        name: food.name, 
        hasNutrition: !!food.nutrition 
      });
      
      // Intentar encontrar la información nutricional completa en foodMapping
      const fullFoodData = Object.values(foodMapping).find(mappedFood => 
        mappedFood.id === food.id || mappedFood.name === food.name
      );
      
      console.log('🔍 Found fullFoodData:', fullFoodData ? { 
        id: fullFoodData.id, 
        name: fullFoodData.name, 
        hasNutrition: !!fullFoodData.nutrition 
      } : null);
      
      if (fullFoodData && fullFoodData.nutrition) {
        console.log('✅ Using fullFoodData with nutrition');
        return convertFoodToMLFormat(fullFoodData);
      }
      
      // Si no se encuentra, usar los datos disponibles del plato actual
      console.log('❌ Using food from currentDish (fallback)');
      return convertFoodToMLFormat(food);
    });
    
    // Call ML service
    const prediction = await callMLService('/predict', {
      foods: mlFoods,
      model_type
    }, 'POST');
    
    res.json({
      ...prediction,
      dish: currentDish,
      foods_analyzed: currentDish.foods.length
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to predict current dish health',
      details: error.message 
    });
  }
});

// Get current dish
app.get('/api/dish', (req, res) => {
  res.json(currentDish);
});

// Get available foods
app.get('/api/foods', (req, res) => {
  res.json(Object.values(foodMapping));
});

// Reset dish manually
app.post('/api/dish/reset', (req, res) => {
  currentDish = {
    foods: [],
    totalCalories: 0,
    timestamp: new Date()
  };
  
  broadcast({
    type: 'DISH_RESET',
    dish: currentDish
  });
  
  res.json({ success: true, dish: currentDish });
});

// Get serial port status
app.get('/api/serial/status', (req, res) => {
  res.json({
    connected: serialPort && serialPort.isOpen,
    port: serialPort ? serialPort.path : null
  });
});

// Change serial port
app.post('/api/serial/connect', (req, res) => {
  const { port, baudRate = 9600 } = req.body;
  
  if (serialPort && serialPort.isOpen) {
    serialPort.close();
  }
  
  try {
    initializeSerial(port, baudRate);
    res.json({ success: true, message: `Connecting to ${port}` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List available serial ports
app.get('/api/serial/ports', async (req, res) => {
  try {
    const ports = await SerialPort.list();
    res.json(ports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('🔌 New WebSocket client connected');
  
  // Send current dish state to new client
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    dish: currentDish
  }));
  
  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
  });
});

// Emotion files endpoints
app.post('/api/save-emotion-files', async (req, res) => {
  try {
    const { emotions, timestamp } = req.body;
    
    // Crear directorio si no existe
    const emotionResultsDir = path.join(__dirname, '..', 'FaceExpressionRecognition', 'emotion_results');
    if (!fs.existsSync(emotionResultsDir)) {
      fs.mkdirSync(emotionResultsDir, { recursive: true });
    }
    
    const files = [];
    
    // 1. Guardar archivo JSON
    const jsonPath = path.join(emotionResultsDir, `emotions_${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify({ emotions, timestamp }, null, 2));
    files.push(`emotions_${timestamp}.json`);
    
    // 2. Generar y guardar gráfica PNG
    const chartPath = path.join(emotionResultsDir, `chart_${timestamp}.png`);
    const chartData = await generateEmotionChartServer(emotions);
    fs.writeFileSync(chartPath, chartData);
    files.push(`chart_${timestamp}.png`);
    
    // 3. Generar y guardar reporte TXT
    const reportPath = path.join(emotionResultsDir, `report_${timestamp}.txt`);
    const reportContent = generateTextReportServer(emotions, timestamp);
    fs.writeFileSync(reportPath, reportContent);
    files.push(`report_${timestamp}.txt`);
    
    console.log(`✅ Archivos de emociones guardados: ${files.join(', ')}`);
    
    res.json({
      success: true,
      message: 'Archivos guardados exitosamente',
      files: files,
      path: emotionResultsDir
    });
    
  } catch (error) {
    console.error('❌ Error guardando archivos de emociones:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Función para generar gráfica en el servidor
async function generateEmotionChartServer(emotions) {
  const { createCanvas } = require('canvas');
  
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext('2d');
  
  // Configuración de la gráfica
  const padding = 60;
  const chartWidth = canvas.width - 2 * padding;
  const chartHeight = canvas.height - 2 * padding;
  
  // Fondo blanco
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Título
  ctx.fillStyle = 'black';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Evolución de Emociones - ComidaVentura', canvas.width / 2, 30);
  
  // Preparar datos
  const emotionNames = ['neutral', 'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised'];
  const colors = ['#808080', '#FFD700', '#4169E1', '#DC143C', '#9932CC', '#228B22', '#FF8C00'];
  
  // Dibujar ejes
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();
  
  // Etiquetas de ejes
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Tiempo (muestras)', canvas.width / 2, canvas.height - 10);
  
  ctx.save();
  ctx.translate(15, canvas.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Probabilidad', 0, 0);
  ctx.restore();
  
  // Dibujar líneas de emociones
  emotionNames.forEach((emotion, emotionIndex) => {
    if (emotions[0][emotion] !== undefined) {
      ctx.strokeStyle = colors[emotionIndex];
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      emotions.forEach((sample, index) => {
        const x = padding + (index / (emotions.length - 1)) * chartWidth;
        const y = canvas.height - padding - (sample[emotion] * chartHeight);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }
  });
  
  // Leyenda
  const legendX = canvas.width - 150;
  let legendY = 60;
  ctx.font = '12px Arial';
  ctx.textAlign = 'left';
  
  emotionNames.forEach((emotion, index) => {
    if (emotions[0][emotion] !== undefined) {
      ctx.fillStyle = colors[index];
      ctx.fillRect(legendX, legendY, 15, 10);
      
      ctx.fillStyle = 'black';
      ctx.fillText(emotion.charAt(0).toUpperCase() + emotion.slice(1), legendX + 20, legendY + 9);
      
      legendY += 20;
    }
  });
  
  return canvas.toBuffer('image/png');
}

// Función para generar reporte de texto en el servidor
function generateTextReportServer(emotions, timestamp) {
  let report = `REPORTE DE ANÁLISIS DE EMOCIONES - COMIDAVENTURA
===============================================
Fecha: ${new Date().toLocaleString()}
Duración de la sesión: ${emotions.length} muestras
Frecuencia de muestreo: ~10 Hz (1 muestra cada 100ms)

ESTADÍSTICAS GENERALES:
=======================
`;

  // Calcular estadísticas
  const emotionNames = Object.keys(emotions[0]);
  const stats = {};
  
  emotionNames.forEach(emotion => {
    const values = emotions.map(sample => sample[emotion]);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    stats[emotion] = { avg, max, min, sum };
    
    report += `${emotion.charAt(0).toUpperCase() + emotion.slice(1)}:
  - Promedio: ${(avg * 100).toFixed(2)}%
  - Máximo: ${(max * 100).toFixed(2)}%
  - Mínimo: ${(min * 100).toFixed(2)}%
  - Tiempo total: ${(sum / 10).toFixed(1)}s

`;
  });
  
  // Emoción dominante
  const dominantEmotion = emotionNames.reduce((a, b) => stats[a].avg > stats[b].avg ? a : b);
  report += `EMOCIÓN DOMINANTE: ${dominantEmotion.toUpperCase()} (${(stats[dominantEmotion].avg * 100).toFixed(2)}%)

`;
  
  // Momentos de mayor intensidad emocional
  report += `MOMENTOS DE ALTA INTENSIDAD EMOCIONAL:
======================================
`;
  
  emotions.forEach((sample, index) => {
    const time = (index / 10).toFixed(1);
    const maxEmotion = Object.keys(sample).reduce((a, b) => sample[a] > sample[b] ? a : b);
    const intensity = sample[maxEmotion];
    
    if (intensity > 0.7) {
      report += `${time}s: ${maxEmotion} (${(intensity * 100).toFixed(1)}%)
`;
    }
  });
  
  report += `

DATOS COMPLETOS (CSV):
=====================
Tiempo,${emotionNames.join(',')}
`;
  
  emotions.forEach((sample, index) => {
    const time = (index / 10).toFixed(1);
    const values = emotionNames.map(emotion => sample[emotion].toFixed(4));
    report += `${time},${values.join(',')}
`;
  });
  
  return report;
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server running on ws://localhost:8080`);
  
  // Check ML service status
  console.log('🧠 Verificando estado del servicio ML...');
  try {
    const isHealthy = await checkMLServiceHealth();
    if (isHealthy) {
      console.log('✅ Servicio ML está funcionando');
      const info = await callMLService('/model-info');
      console.log(`📊 Modelos cargados: ${Object.values(info.models_loaded).filter(Boolean).length}/5`);
    } else {
      console.log('⚠️  Servicio ML no está disponible');
      console.log('💡 Asegúrate de ejecutar: python ml_service/app.py');
    }
  } catch (error) {
    console.log('❌ Error al conectar con el servicio ML:', error.message);
  }
  
  // Try to initialize serial connection with default port (Windows)
  console.log('🔍 Intentando conectar a Arduino en COM4...');
  initializeSerial('COM6', 9600);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  if (serialPort && serialPort.isOpen) {
    serialPort.close();
  }
  process.exit(0);
}); 