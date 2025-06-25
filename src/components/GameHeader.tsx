import React from 'react';
import { Heart, Trophy, Utensils } from 'lucide-react';

interface GameHeaderProps {
  points: number;
  streak: number;
  platesCreated: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ points, streak, platesCreated }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">NutriChef Kids</h1>
          <p className="text-blue-100 text-sm">¡Aprende comiendo saludable!</p>
        </div>
        
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mb-1">
              <Trophy className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="text-lg font-bold">{points}</div>
            <div className="text-xs text-blue-100">Puntos</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mb-1">
              <Heart className="w-5 h-5 text-red-300" />
            </div>
            <div className="text-lg font-bold">{streak}</div>
            <div className="text-xs text-blue-100">Días</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full mb-1">
              <Utensils className="w-5 h-5 text-green-300" />
            </div>
            <div className="text-lg font-bold">{platesCreated}</div>
            <div className="text-xs text-blue-100">Platos</div>
          </div>
        </div>
      </div>
    </div>
  );
};