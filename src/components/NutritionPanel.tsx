import React from 'react';
import { Plate } from '../types';
import { getHealthScoreColor, getHealthScoreBackground } from '../utils/nutrition';
import { Activity, Heart, Zap, Shield } from 'lucide-react';

interface NutritionPanelProps {
  plate: Plate;
}

export const NutritionPanel: React.FC<NutritionPanelProps> = ({ plate }) => {
  const { totalNutrition, healthScore, balance } = plate;
  
  const nutritionItems = [
    { label: 'Calorías', value: Math.round(totalNutrition.calories), unit: 'cal', icon: Zap, color: 'text-orange-600' },
    { label: 'Proteínas', value: Math.round(totalNutrition.protein), unit: 'g', icon: Activity, color: 'text-red-600' },
    { label: 'Carbohidratos', value: Math.round(totalNutrition.carbs), unit: 'g', icon: Shield, color: 'text-blue-600' },
    { label: 'Fibra', value: Math.round(totalNutrition.fiber), unit: 'g', icon: Heart, color: 'text-green-600' },
  ];

  const balanceItems = [
    { label: 'Proteínas', value: balance.protein, color: 'bg-red-200 text-red-800', icon: '🥩' },
    { label: 'Vegetales', value: balance.vegetables, color: 'bg-green-200 text-green-800', icon: '🥦' },
    { label: 'Frutas', value: balance.fruits, color: 'bg-purple-200 text-purple-800', icon: '🍎' },
    { label: 'Cereales', value: balance.grains, color: 'bg-yellow-200 text-yellow-800', icon: '🌾' },
    { label: 'Lácteos', value: balance.dairy, color: 'bg-blue-200 text-blue-800', icon: '🥛' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Análisis Nutricional</h2>
      
      {/* Health Score */}
      <div className={`${getHealthScoreBackground(healthScore)} rounded-xl p-4 mb-4 text-center`}>
        <div className={`text-3xl font-bold ${getHealthScoreColor(healthScore)} mb-1`}>
          {healthScore}/5
        </div>
        <div className="text-sm font-medium text-gray-600">Puntuación de Salud</div>
        <div className="flex justify-center mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <div
              key={star}
              className={`w-4 h-4 rounded-full mx-1 ${
                star <= healthScore ? 'bg-yellow-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Nutrition Facts */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {nutritionItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <Icon className={`w-4 h-4 ${item.color} mr-1`} />
                <span className="text-xs font-medium text-gray-600">{item.label}</span>
              </div>
              <div className="text-lg font-bold text-gray-800">
                {item.value} <span className="text-sm font-normal text-gray-500">{item.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Food Balance */}
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Balance Alimentario</h3>
        <div className="space-y-2">
          {balanceItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-lg mr-2">{item.icon}</span>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${item.color}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};