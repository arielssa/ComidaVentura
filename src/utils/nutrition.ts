import { Food, Plate } from '../types';

export const calculatePlateNutrition = (foods: Food[]): Plate['totalNutrition'] => {
  return foods.reduce(
    (total, food) => ({
      calories: total.calories + food.nutrition.calories,
      protein: total.protein + food.nutrition.protein,
      carbs: total.carbs + food.nutrition.carbs,
      fat: total.fat + food.nutrition.fat,
      fiber: total.fiber + food.nutrition.fiber,
      sugar: total.sugar + food.nutrition.sugar,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
  );
};

export const calculateHealthScore = (foods: Food[]): number => {
  if (foods.length === 0) return 0;
  const totalScore = foods.reduce((sum, food) => sum + food.healthScore, 0);
  return Math.round(totalScore / foods.length);
};

export const calculateBalance = (foods: Food[]): Plate['balance'] => {
  const categories = foods.reduce(
    (count, food) => {
      count[food.category] = (count[food.category] || 0) + 1;
      return count;
    },
    {} as Record<string, number>
  );

  return {
    protein: categories.protein || 0,
    vegetables: categories.vegetable || 0,
    fruits: categories.fruit || 0,
    grains: categories.grain || 0,
    dairy: categories.dairy || 0,
  };
};

export const getHealthScoreColor = (score: number): string => {
  if (score >= 4) return 'text-green-600';
  if (score >= 3) return 'text-yellow-600';
  return 'text-red-600';
};

export const getHealthScoreBackground = (score: number): string => {
  if (score >= 4) return 'bg-green-100';
  if (score >= 3) return 'bg-yellow-100';
  return 'bg-red-100';
};

export const generateRecommendations = (foods: Food[]): string[] => {
  const balance = calculateBalance(foods);
  const recommendations: string[] = [];
  const totalFoods = foods.length;

  if (balance.vegetables === 0) {
    recommendations.push('¡Agrega más vegetales! 🥦 Los vegetales te dan energía y vitaminas.');
  } else if (balance.vegetables < totalFoods * 0.3) {
    recommendations.push('¡Excelente! Pero podrías agregar más vegetales para un plato súper saludable.');
  }

  if (balance.fruits === 0) {
    recommendations.push('¿Qué tal una fruta? 🍎 Las frutas son dulces naturales llenas de vitaminas.');
  }

  if (balance.protein === 0) {
    recommendations.push('Tu cuerpo necesita proteínas para crecer fuerte. ¡Prueba pollo o pescado! 💪');
  }

  if (foods.some(food => food.healthScore <= 2)) {
    recommendations.push('¡Recuerda! Los dulces y snacks están bien de vez en cuando, pero mejor con moderación.');
  }

  if (balance.vegetables >= 2 && balance.fruits >= 1 && balance.protein >= 1) {
    recommendations.push('¡Increíble! Tu plato tiene un balance perfecto. ¡Eres un súper nutricionista! 🌟');
  }

  return recommendations.length > 0 ? recommendations : ['¡Buen trabajo! Sigue construyendo tu plato saludable.'];
};