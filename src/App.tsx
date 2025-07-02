import React from 'react';
import NutritiousPlateGame from './components/NutritiousPlateGame';
import { useArduino } from './hooks/useArduino';
import { foods } from './data/foods';
import { Food } from './types';

// Receta establecida (puedes cambiar los ids por los de la receta que quieras)
const recetaEstablecida = [
  'chicken', // Pollo a la Plancha
  'carrots', // Zanahorias
  'apple',   // Manzana
  'brown-rice' // Arroz Integral
];

function App() {
  const { dish } = useArduino();

  // Ingredientes leídos por NFC (del plato actual)
  const ingredientesActuales = dish.foods;

  // Alimentos de la receta (objetos Food)
  const recetaFoods = recetaEstablecida.map(id => foods.find(f => f.id === id)).filter(Boolean) as Food[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-indigo-400 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-green-300 rounded-full opacity-25 animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-300 rounded-full opacity-15 animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-12 h-12 bg-pink-300 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-1/2 left-5 w-8 h-8 bg-orange-300 rounded-full opacity-25 animate-bounce"></div>
        <div className="absolute top-20 left-1/2 w-14 h-14 bg-purple-300 rounded-full opacity-20 animate-ping"></div>
      </div>
      
      {/* Game content */}
      <div className="relative z-10">
        <NutritiousPlateGame
          receta={recetaFoods}
          ingredientes={ingredientesActuales}
        />
      </div>
    </div>
  );
}

export default App;