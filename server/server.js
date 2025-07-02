const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Food data mapping (matching your Arduino code)
const foodMapping = {
  "Salmon": { id: 'fish', name: 'Salmón', calories: 208, category: 'protein' },
  "Chicken": { id: 'chicken', name: 'Pollo a la Plancha', calories: 165, category: 'protein' },
  "Eggs": { id: 'eggs', name: 'Huevos', calories: 155, category: 'protein' },
  "Broccoli": { id: 'broccoli', name: 'Brócoli', calories: 34, category: 'vegetable' },
  "Carrot": { id: 'carrots', name: 'Zanahorias', calories: 41, category: 'vegetable' },
  "Banana": { id: 'banana', name: 'Plátano', calories: 89, category: 'fruit' },
  "Apple": { id: 'apple', name: 'Manzana', calories: 52, category: 'fruit' },
  "Rice": { id: 'brown-rice', name: 'Arroz Integral', calories: 111, category: 'grain' },
  "Bread": { id: 'white-bread', name: 'Pan Blanco', calories: 75, category: 'grain' },
  "Cheese": { id: 'cheese', name: 'Queso', calories: 113, category: 'dairy' },
  "Yogurt": { id: 'yogurt', name: 'Yogur Natural', calories: 59, category: 'dairy' },
  "Fried potatoes": { id: 'chips', name: 'Papas Fritas', calories: 152, category: 'snack' }
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
          
          currentDish.foods.push(foodItem);
          currentDish.totalCalories += calories;
          currentDish.timestamp = new Date();
          
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server running on ws://localhost:8080`);
  
  // Try to initialize serial connection with default port (macOS)
  console.log('🔍 Attempting to connect to Arduino on /dev/cu.usbmodem1201...');
  initializeSerial('/dev/cu.usbmodem1201', 9600);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  if (serialPort && serialPort.isOpen) {
    serialPort.close();
  }
  process.exit(0);
}); 