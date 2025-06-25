import React from 'react';
import { generateRecommendations } from '../utils/nutrition';
import { Food } from '../types';
import { Lightbulb, Star, Target } from 'lucide-react';

interface RecommendationPanelProps {
  foods: Food[];
  points: number;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ foods, points }) => {
  const recommendations = generateRecommendations(foods);
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-center mb-4">
        <Lightbulb className="w-6 h-6 text-purple-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Recomendaciones</h2>
      </div>
      
      {/* Points Display */}
      <div className="bg-white rounded-xl p-4 mb-4 text-center">
        <div className="flex items-center justify-center mb-2">
          <Star className="w-5 h-5 text-yellow-500 mr-1" />
          <span className="text-2xl font-bold text-purple-600">{points}</span>
          <span className="text-sm text-gray-600 ml-1">puntos</span>
        </div>
        <div className="text-xs text-gray-500">¡Sigue así para ganar más puntos!</div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-purple-400"
          >
            <div className="flex items-start">
              <Target className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 leading-relaxed">{recommendation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Motivational Message */}
      <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg text-center">
        <p className="text-sm font-medium text-gray-700">
          {foods.length === 0 
            ? "¡Comienza escaneando tu primer alimento!" 
            : foods.length < 3 
            ? "¡Vas muy bien! Sigue agregando alimentos."
            : "¡Excelente trabajo construyendo tu plato saludable! 🎉"
          }
        </p>
      </div>
    </div>
  );
};