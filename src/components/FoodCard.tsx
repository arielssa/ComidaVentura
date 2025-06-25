import React from 'react';
import { Food } from '../types';
import { getHealthScoreColor, getHealthScoreBackground } from '../utils/nutrition';

interface FoodCardProps {
  food: Food;
  onScan: (food: Food) => void;
  isScanning?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onScan, isScanning }) => {
  return (
    <div
      className={`
        ${food.color} rounded-xl p-4 cursor-pointer transition-all duration-300 
        hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-blue-300
        ${isScanning ? 'animate-pulse ring-4 ring-blue-300' : ''}
      `}
      onClick={() => onScan(food)}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">{food.image}</div>
        <h3 className="font-semibold text-sm text-gray-700 mb-2">{food.name}</h3>
        
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthScoreBackground(food.healthScore)}`}>
          <div className={`w-2 h-2 rounded-full mr-1 ${food.healthScore >= 4 ? 'bg-green-500' : food.healthScore >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          <span className={getHealthScoreColor(food.healthScore)}>
            {food.healthScore === 5 ? '¡Súper!' : food.healthScore >= 4 ? 'Saludable' : food.healthScore >= 3 ? 'Moderado' : 'Ocasional'}
          </span>
        </div>
        
        <div className="mt-2 text-xs text-gray-600">
          <div>{food.nutrition.calories} cal</div>
        </div>
      </div>
    </div>
  );
};