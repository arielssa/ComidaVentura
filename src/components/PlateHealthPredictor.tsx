import React, { useState, useEffect } from 'react';
import { useMLService } from '../hooks/useMLService';
import { Food } from '../types';

interface PlateHealthPredictorProps {
  foods: Food[];
  className?: string;
}

const PlateHealthPredictor: React.FC<PlateHealthPredictorProps> = ({ foods, className = '' }) => {
  const {
    isLoading,
    error,
    lastPrediction,
    serviceStatus,
    checkServiceStatus,
    predictDishHealth,
    getClassificationColor,
    getClassificationEmoji,
    clearError
  } = useMLService();

  const [showDetails, setShowDetails] = useState(false);

  // Check service status on mount
  useEffect(() => {
    checkServiceStatus();
  }, [checkServiceStatus]);

  const handlePredict = async () => {
    if (foods.length === 0) {
      alert('🍽️ Agrega alimentos a tu plato primero para obtener una predicción');
      return;
    }
    
    // Validar que al menos algunos alimentos tengan datos nutricionales
    const hasNutritionData = foods.some(food => 
      food.nutrition || (food as any).actualCalories
    );
    
    if (!hasNutritionData) {
      console.warn('Advertencia: Los alimentos no tienen información nutricional completa');
    }
    
    await predictDishHealth(foods, 'neural');
    setShowDetails(true);
  };

  const canPredict = foods.length > 0 && serviceStatus?.status === 'healthy' && !isLoading;

  return (
    <div className={`plate-health-predictor ${className}`}>
      {/* Botón Principal de Predicción */}
      <div className="prediction-button-container">
        <button
          onClick={handlePredict}
          disabled={!canPredict}
          className={`predict-button ${canPredict ? 'active' : 'disabled'}`}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner">🔄</span>
              Analizando tu plato...
            </>
          ) : (
            <>
              <span className="button-icon">🧠</span>
              ¿Qué tan saludable es mi plato?
            </>
          )}
        </button>
      </div>

      {/* Estado del Servicio */}
      {serviceStatus?.status !== 'healthy' && (
        <div className="service-warning">
          <span className="warning-icon">⚠️</span>
          <span>El servicio de IA no está disponible</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{error}</span>
          <button onClick={clearError} className="close-error">✕</button>
        </div>
      )}

      {/* Resultado de la Predicción */}
      {lastPrediction && showDetails && (
        <div className="prediction-result">
          <div className="result-header">
            <h4>🔮 Resultado del Análisis</h4>
            <button 
              onClick={() => setShowDetails(false)} 
              className="close-result"
            >
              ✕
            </button>
          </div>
          
          <div className={`result-card ${getClassificationColor(lastPrediction.classification)}`}>
            <div className="result-main">
              <span className="result-emoji">
                {getClassificationEmoji(lastPrediction.classification)}
              </span>
              <div className="result-text">
                <div className="classification">
                  {lastPrediction.classification}
                </div>
                <div className="confidence">
                  {Math.round(lastPrediction.confidence * 100)}% de confianza
                </div>
              </div>
            </div>
            
            <div className="result-details">
              <div className="detail-item">
                <span className="detail-icon">🍽️</span>
                <span>{foods.length} alimentos analizados</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🧠</span>
                <span>Red Neuronal</span>
              </div>
            </div>
          </div>

          {/* Recomendaciones basadas en la clasificación */}
          <div className="recommendations">
            {getRecommendations(lastPrediction.classification, foods.length)}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay alimentos */}
      {foods.length === 0 && (
        <div className="empty-plate-message">
          <span className="empty-icon">🍽️</span>
          <p>Agrega alimentos a tu plato para obtener una predicción de salud</p>
        </div>
      )}
    </div>
  );
};

// Función para obtener recomendaciones basadas en la clasificación
const getRecommendations = (classification: string, foodCount: number) => {
  const recommendations = {
    'Muy Saludable': [
      '🌟 ¡Excelente elección! Tu plato está perfectamente balanceado.',
      '💪 Estos alimentos te darán mucha energía y nutrientes.',
      '🎯 ¡Sigue así! Eres un experto en nutrición.'
    ],
    'Saludable': [
      '✅ ¡Muy buen trabajo! Tu plato es nutritivo.',
      '🥗 Podrías agregar más vegetales para hacerlo aún mejor.',
      '👍 Estás en el camino correcto hacia una alimentación saludable.'
    ],
    'Moderadamente Saludable': [
      '⚠️ Tu plato está bien, pero puede mejorar.',
      '🥦 Intenta agregar más vegetales y frutas.',
      '💡 Reduce los alimentos procesados para mayor beneficio.'
    ],
    'Poco Saludable': [
      '❌ Tu plato necesita más alimentos nutritivos.',
      '🍎 Agrega frutas y vegetales frescos.',
      '🔄 Intenta reemplazar algunos alimentos por opciones más saludables.'
    ]
  };

  const messages = recommendations[classification as keyof typeof recommendations] || recommendations['Moderadamente Saludable'];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="recommendation-card">
      <h5>💡 Recomendación</h5>
      <p>{randomMessage}</p>
    </div>
  );
};

export default PlateHealthPredictor; 