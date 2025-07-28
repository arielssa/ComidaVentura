import React, { useState, useEffect } from 'react';
import { useMLService } from '../hooks/useMLService';
import { Food } from '../types';

interface MLPredictionPanelProps {
  foods: Food[];
  className?: string;
}

const MLPredictionPanel: React.FC<MLPredictionPanelProps> = ({ foods, className = '' }) => {
  const {
    isLoading,
    error,
    lastPrediction,
    serviceStatus,
    trainingStatus,
    checkServiceStatus,
    trainModels,
    getTrainingStatus,
    predictDishHealth,
    getClassificationColor,
    getClassificationEmoji,
    clearError
  } = useMLService();

  const [selectedModel, setSelectedModel] = useState<'neural' | 'knn' | 'svm'>('neural');
  const [autoPredict, setAutoPredict] = useState(true);

  // Check service status on mount
  useEffect(() => {
    checkServiceStatus();
  }, [checkServiceStatus]);

  // Auto-predict when foods change
  useEffect(() => {
    if (autoPredict && foods.length > 0 && serviceStatus?.status === 'healthy') {
      const timer = setTimeout(() => {
        predictDishHealth(foods, selectedModel);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [foods, selectedModel, autoPredict, serviceStatus?.status, predictDishHealth]);

  // Poll training status when training
  useEffect(() => {
    if (trainingStatus?.status === 'training') {
      const interval = setInterval(() => {
        getTrainingStatus();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [trainingStatus?.status, getTrainingStatus]);

  const handlePredict = async () => {
    if (foods.length === 0) {
      alert('Agrega alimentos al plato para hacer una predicción');
      return;
    }
    await predictDishHealth(foods, selectedModel);
  };

  const handleTrain = async () => {
    if (confirm('¿Estás seguro de que quieres entrenar los modelos? Esto puede tomar varios minutos.')) {
      await trainModels();
    }
  };

  const getModelName = (model: string) => {
    switch (model) {
      case 'neural': return 'Red Neuronal';
      case 'knn': return 'K-Nearest Neighbors';
      case 'svm': return 'Support Vector Machine';
      default: return model;
    }
  };

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'unhealthy': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getServiceStatusEmoji = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'unhealthy': return '⚠️';
      case 'error': return '❌';
      default: return '🤔';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">🧠 Predicción de Salud con IA</h3>
        <button
          onClick={checkServiceStatus}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Service Status */}
      {serviceStatus && (
        <div className="mb-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getServiceStatusColor(serviceStatus.status)}`}>
            {getServiceStatusEmoji(serviceStatus.status)} Servicio: {serviceStatus.status}
          </div>
          
          {serviceStatus.ml_service && (
            <div className="mt-2 text-sm text-gray-600">
              <div>Modelos cargados: {Object.values(serviceStatus.ml_service.models_loaded).filter(Boolean).length}/5</div>
              {serviceStatus.ml_service.available_classes && (
                <div>Clases: {serviceStatus.ml_service.available_classes.join(', ')}</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Training Status */}
      {trainingStatus && trainingStatus.status !== 'not_started' && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Estado del Entrenamiento:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              trainingStatus.status === 'completed' ? 'bg-green-100 text-green-700' :
              trainingStatus.status === 'failed' ? 'bg-red-100 text-red-700' :
              trainingStatus.status === 'training' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {trainingStatus.status}
            </span>
          </div>
          
          {trainingStatus.status === 'training' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${trainingStatus.progress}%` }}
              />
            </div>
          )}
          
          <div className="text-sm text-gray-600">{trainingStatus.message}</div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-red-700">❌ {error}</span>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Model Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modelo de IA:
        </label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value as 'neural' | 'knn' | 'svm')}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="neural">Red Neuronal</option>
          <option value="knn">K-Nearest Neighbors</option>
          <option value="svm">Support Vector Machine</option>
        </select>
      </div>

      {/* Auto-predict Toggle */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={autoPredict}
            onChange={(e) => setAutoPredict(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Predicción automática</span>
        </label>
      </div>

      {/* Prediction Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handlePredict}
          disabled={isLoading || foods.length === 0 || serviceStatus?.status !== 'healthy'}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            isLoading || foods.length === 0 || serviceStatus?.status !== 'healthy'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? '🔄 Prediciendo...' : '🔮 Predecir Salud'}
        </button>
        
        <button
          onClick={handleTrain}
          disabled={isLoading || trainingStatus?.status === 'training'}
          className={`py-2 px-4 rounded-md font-medium transition-colors ${
            isLoading || trainingStatus?.status === 'training'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {trainingStatus?.status === 'training' ? '⏳ Entrenando...' : '🏋️ Entrenar'}
        </button>
      </div>

      {/* Prediction Results */}
      {lastPrediction && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-3">Resultado de la Predicción:</h4>
          
          <div className="space-y-3">
            <div className={`p-3 rounded-lg ${getClassificationColor(lastPrediction.classification)}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {getClassificationEmoji(lastPrediction.classification)} {lastPrediction.classification}
                </span>
                <span className="text-sm">
                  {Math.round(lastPrediction.confidence * 100)}% confianza
                </span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <div>Modelo usado: {getModelName(lastPrediction.model_used)}</div>
              <div>Alimentos analizados: {foods.length}</div>
            </div>
            
            {lastPrediction.error && (
              <div className="text-red-600 text-sm">
                Error: {lastPrediction.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No Foods Message */}
      {foods.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🍽️</div>
          <p>Agrega alimentos a tu plato para obtener una predicción de salud</p>
        </div>
      )}
    </div>
  );
};

export default MLPredictionPanel; 