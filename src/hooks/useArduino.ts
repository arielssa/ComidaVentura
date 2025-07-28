import { useState, useEffect, useCallback } from 'react';
import { Food } from '../types';

interface ArduinoDish {
  foods: (Food & { addedAt: string; actualCalories: number })[];
  totalCalories: number;
  timestamp: string;
}

interface ArduinoHookReturn {
  dish: ArduinoDish;
  isConnected: boolean;
  serialStatus: { connected: boolean; port: string | null };
  availablePorts: any[];
  connectToPort: (port: string, baudRate?: number) => Promise<void>;
  resetDish: () => Promise<void>;
  refreshPorts: () => Promise<void>;
}

const API_BASE = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:8080';

export const useArduino = (): ArduinoHookReturn => {
  const [dish, setDish] = useState<ArduinoDish>({
    foods: [],
    totalCalories: 0,
    timestamp: new Date().toISOString()
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const [serialStatus, setSerialStatus] = useState({ connected: false, port: null });
  const [availablePorts, setAvailablePorts] = useState([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const websocket = new WebSocket(WS_URL);
        
        websocket.onopen = () => {
          console.log('🔌 Connected to Arduino WebSocket');
          setIsConnected(true);
        };
        
        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📡 WebSocket message:', data);
            
            // Log específico para alimentos agregados
            if (data.type === 'FOOD_ADDED') {
              console.log('🔍 Food added - server data:', {
                foodInMessage: data.food,
                dishFoods: data.dish.foods,
                lastFood: data.dish.foods[data.dish.foods.length - 1]
              });
            }
            
            switch (data.type) {
              case 'INITIAL_STATE':
              case 'DISH_RESET':
              case 'TOTAL_UPDATE':
                setDish(data.dish);
                break;
              case 'FOOD_ADDED':
                setDish(data.dish);
                console.log('🔍 Dish updated in frontend:', data.dish.foods.map((f: any) => ({
                  name: f.name,
                  id: f.id,
                  calories: f.calories,
                  actualCalories: f.actualCalories,
                  hasNutrition: !!f.nutrition
                })));
                break;
            }
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };
        
        websocket.onclose = () => {
          console.log('🔌 WebSocket connection closed');
          setIsConnected(false);
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
        };
        
        websocket.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          setIsConnected(false);
        };
        
        setWs(websocket);
      } catch (error) {
        console.error('❌ Failed to connect WebSocket:', error);
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Fetch initial data and serial status
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get current dish
        const dishResponse = await fetch(`${API_BASE}/dish`);
        if (dishResponse.ok) {
          const dishData = await dishResponse.json();
          setDish(dishData);
        }

        // Get serial status
        const statusResponse = await fetch(`${API_BASE}/serial/status`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setSerialStatus(statusData);
        }

        // Get available ports
        refreshPorts();
      } catch (error) {
        console.error('❌ Error fetching initial data:', error);
      }
    };

    fetchInitialData();
  }, []);

  const connectToPort = useCallback(async (port: string, baudRate: number = 9600) => {
    try {
      const response = await fetch(`${API_BASE}/serial/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ port, baudRate }),
      });

      if (response.ok) {
        // Update serial status after a short delay
        setTimeout(async () => {
          const statusResponse = await fetch(`${API_BASE}/serial/status`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            setSerialStatus(statusData);
          }
        }, 1000);
      } else {
        throw new Error('Failed to connect to serial port');
      }
    } catch (error) {
      console.error('❌ Error connecting to serial port:', error);
      throw error;
    }
  }, []);

  const resetDish = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/dish/reset`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset dish');
      }
    } catch (error) {
      console.error('❌ Error resetting dish:', error);
      throw error;
    }
  }, []);

  const refreshPorts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/serial/ports`);
      if (response.ok) {
        const ports = await response.json();
        setAvailablePorts(ports);
      }
    } catch (error) {
      console.error('❌ Error fetching serial ports:', error);
    }
  }, []);

  return {
    dish,
    isConnected,
    serialStatus,
    availablePorts,
    connectToPort,
    resetDish,
    refreshPorts,
  };
}; 