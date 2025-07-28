import { useState, useCallback } from 'react';
import { Food } from '../types';

interface MLPrediction {
  classification: string;
  confidence: number;
  model_used: string;
  error?: string;
}

interface MLServiceStatus {
  status: 'healthy' | 'unhealthy' | 'error';
  ml_service?: {
    models_loaded: Record<string, boolean>;
    available_classes: string[];
    training_status: {
      status: string;
      progress: number;
      message: string;
    };
  };
  message?: string;
  error?: string;
}

interface TrainingStatus {
  status: 'not_started' | 'training' | 'completed' | 'failed';
  progress: number;
  message: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

export const useMLService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrediction, setLastPrediction] = useState<MLPrediction | null>(null);
  const [serviceStatus, setServiceStatus] = useState<MLServiceStatus | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);

  const handleError = useCallback((error: any) => {
    const errorMessage = error.response?.data?.error || error.message || 'Error desconocido';
    setError(errorMessage);
    console.error('ML Service Error:', error);
  }, []);

  const checkServiceStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/ml/status`);
      const data: MLServiceStatus = await response.json();
      
      setServiceStatus(data);
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const trainModels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/ml/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar entrenamiento');
      }
      
      setTrainingStatus(data.status);
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getTrainingStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ml/training-status`);
      const data: TrainingStatus = await response.json();
      
      setTrainingStatus(data);
      return data;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [handleError]);

  const predictDishHealth = useCallback(async (
    foods: Food[], 
    modelType: 'neural' | 'knn' | 'svm' = 'neural'
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Función para obtener datos nutricionales con valores por defecto
      const getNutritionData = (food: any) => {
        // Si el alimento tiene nutrition, úsala
        if (food.nutrition) {
          return {
            calories: food.nutrition.calories || 0,
            protein: food.nutrition.protein || 0,
            carbs: food.nutrition.carbs || 0,
            fat: food.nutrition.fat || 0,
            fiber: food.nutrition.fiber || 0,
            sugar: food.nutrition.sugar || 0
          };
        }
        
        // Si no tiene nutrition pero tiene actualCalories (Arduino), usar datos básicos
        if (food.actualCalories) {
          return {
            calories: food.actualCalories,
            protein: 0, // Valores por defecto
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0
          };
        }
        
        // Valores completamente por defecto
        return {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0
        };
      };
      
      const response = await fetch(`${API_BASE_URL}/ml/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          foods: foods.map(food => getNutritionData(food)),
          model_type: modelType
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al predecir salud del plato');
      }
      
      setLastPrediction(data.prediction);
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const predictCurrentDish = useCallback(async (
    modelType: 'neural' | 'knn' | 'svm' = 'neural'
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/ml/predict-current`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model_type: modelType
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al predecir plato actual');
      }
      
      setLastPrediction(data.prediction);
      return data;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const getClassificationColor = useCallback((classification: string) => {
    switch (classification.toLowerCase()) {
      case 'muy saludable':
        return 'text-green-600 bg-green-100';
      case 'saludable':
        return 'text-green-500 bg-green-50';
      case 'moderadamente saludable':
        return 'text-yellow-600 bg-yellow-100';
      case 'poco saludable':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getClassificationEmoji = useCallback((classification: string) => {
    switch (classification.toLowerCase()) {
      case 'muy saludable':
        return '🌟';
      case 'saludable':
        return '✅';
      case 'moderadamente saludable':
        return '⚠️';
      case 'poco saludable':
        return '❌';
      default:
        return '🤔';
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    lastPrediction,
    serviceStatus,
    trainingStatus,
    
    // Actions
    checkServiceStatus,
    trainModels,
    getTrainingStatus,
    predictDishHealth,
    predictCurrentDish,
    
    // Helpers
    getClassificationColor,
    getClassificationEmoji,
    
    // Clear functions
    clearError: () => setError(null),
    clearPrediction: () => setLastPrediction(null)
  };
}; 