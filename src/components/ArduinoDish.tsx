import React from 'react';
import { Trash2, Clock, Zap } from 'lucide-react';
import { Food } from '../types';

interface ArduinoDishProps {
  dish: {
    foods: (Food & { addedAt: string; actualCalories: number })[];
    totalCalories: number;
    timestamp: string;
  };
  onReset: () => Promise<void>;
}

export const ArduinoDish: React.FC<ArduinoDishProps> = ({ dish, onReset }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 5) return 'text-green-600 bg-green-100';
    if (score >= 4) return 'text-yellow-600 bg-yellow-100';
    if (score >= 3) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      protein: 'bg-red-100 text-red-800',
      vegetable: 'bg-green-100 text-green-800',
      fruit: 'bg-purple-100 text-purple-800',
      grain: 'bg-yellow-100 text-yellow-800',
      dairy: 'bg-blue-100 text-blue-800',
      snack: 'bg-orange-100 text-orange-800',
      sweet: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Plato Actual</h2>
          <p className="text-gray-600 flex items-center mt-1">
            <Clock className="w-4 h-4 mr-1" />
            Última actualización: {formatTime(dish.timestamp)}
          </p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center justify-end space-x-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span className="text-3xl font-bold text-gray-800">
              {dish.totalCalories}
            </span>
            <span className="text-lg text-gray-600">cal</span>
          </div>
          
          <button
            onClick={onReset}
            className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>

      {dish.foods.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            Plato vacío
          </h3>
          <p className="text-gray-500">
            Escanea una tarjeta RFID con tu Arduino para agregar alimentos
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dish.foods.map((food, index) => (
            <div
              key={`${food.id}-${index}`}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{food.image}</div>
                
                <div>
                  <h3 className="font-medium text-gray-800">{food.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(food.category)}`}>
                      {food.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthScoreColor(food.healthScore)}`}>
                      ❤️ {food.healthScore}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-gray-800">
                  {food.actualCalories} cal
                </div>
                <div className="text-sm text-gray-500">
                  {formatTime(food.addedAt)}
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-800">
                Total de alimentos: {dish.foods.length}
              </span>
              <span className="font-bold text-blue-800 text-lg">
                {dish.totalCalories} calorías
              </span>
            </div>
            
            {dish.totalCalories > 0 && (
              <div className="mt-2 text-sm text-blue-700">
                Promedio por alimento: {Math.round(dish.totalCalories / dish.foods.length)} cal
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 