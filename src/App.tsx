import React from 'react';
import NutritiousPlateGame from './components/NutritiousPlateGame';
import { useArduino } from './hooks/useArduino';
import { foods } from './data/foods';

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
  const recetaFoods = recetaEstablecida.map(id => foods.find(f => f.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f8ff]">
      <NutritiousPlateGame
        receta={recetaFoods}
        ingredientes={ingredientesActuales}
      />
    </div>
  );
}

export default App;