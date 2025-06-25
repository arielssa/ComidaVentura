import React from 'react';
import { Food } from '../types';
import { Trash2, Utensils } from 'lucide-react';

interface VirtualPlateProps {
  foods: Food[];
  onRemoveFood: (index: number) => void;
}

export const VirtualPlate: React.FC<VirtualPlateProps> = ({ foods, onRemoveFood }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-center mb-4">
        <Utensils className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-800">Mi Plato Virtual</h2>
      </div>
      
      <div className="relative">
        {/* Plate Visual */}
        <div className="w-64 h-64 mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-full border-8 border-gray-200 shadow-inner relative overflow-hidden">
          {foods.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Utensils className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Escanea alimentos para llenar tu plato</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-4 flex flex-wrap items-center justify-center gap-2">
              {foods.map((food, index) => (
                <div
                  key={`${food.id}-${index}`}
                  className="relative group"
                >
                  <div className="text-2xl bg-white rounded-full p-2 shadow-md border-2 border-gray-100 hover:border-red-300 transition-colors">
                    {food.image}
                  </div>
                  <button
                    onClick={() => onRemoveFood(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Food List */}
        {foods.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Alimentos en tu plato:</h3>
            <div className="max-h-32 overflow-y-auto">
              {foods.map((food, index) => (
                <div key={`${food.id}-${index}`} className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">{food.image} {food.name}</span>
                  <button
                    onClick={() => onRemoveFood(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};