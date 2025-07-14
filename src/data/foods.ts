import { Food } from '../types';

export const foods: Food[] = [
  // Proteins
  {
    id: 'chicken',
    name: 'Pollo a la Plancha',
    category: 'protein',
    nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 },
    healthScore: 5,
    image: '🍗',
    color: 'bg-orange-100'
  },
  {
    id: 'fish',
    name: 'Salmón',
    category: 'protein',
    nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0 },
    healthScore: 5,
    image: '🐟',
    color: 'bg-blue-100'
  },
  {
    id: 'eggs',
    name: 'Huevos',
    category: 'protein',
    nutrition: { calories: 155, protein: 13, carbs: 1, fat: 11, fiber: 0, sugar: 1 },
    healthScore: 4,
    image: '🥚',
    color: 'bg-yellow-100'
  },
  
  // Vegetables
  {
    id: 'broccoli',
    name: 'Brócoli',
    category: 'vegetable',
    nutrition: { calories: 34, protein: 3, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.5 },
    healthScore: 5,
    image: '🥦',
    color: 'bg-green-100'
  },
  {
    id: 'carrots',
    name: 'Zanahorias',
    category: 'vegetable',
    nutrition: { calories: 41, protein: 1, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7 },
    healthScore: 5,
    image: '🥕',
    color: 'bg-orange-100'
  },
    
  // Fruits
  {
    id: 'apple',
    name: 'Manzana',
    category: 'fruit',
    nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10 },
    healthScore: 5,
    image: '🍎',
    color: 'bg-red-100'
  },
  {
    id: 'banana',
    name: 'Plátano',
    category: 'fruit',
    nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12 },
    healthScore: 4,
    image: '🍌',
    color: 'bg-yellow-100'
  },
   // Grains
  {
    id: 'brown-rice',
    name: 'Arroz Integral',
    category: 'grain',
    nutrition: { calories: 111, protein: 3, carbs: 23, fat: 0.9, fiber: 1.8, sugar: 0.4 },
    healthScore: 4,
    image: '🍚',
    color: 'bg-amber-100'
  },
  {
    id: 'white-bread',
    name: 'Pan Blanco',
    category: 'grain',
    nutrition: { calories: 75, protein: 2.3, carbs: 14, fat: 1, fiber: 0.8, sugar: 1.2 },
    healthScore: 2,
    image: '🍞',
    color: 'bg-orange-100'
  },
  
  // Dairy
  {
    id: 'yogurt',
    name: 'Yogur Natural',
    category: 'dairy',
    nutrition: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.2 },
    healthScore: 4,
    image: '🥛',
    color: 'bg-blue-100'
  },
  {
    id: 'cheese',
    name: 'Queso',
    category: 'dairy',
    nutrition: { calories: 113, protein: 7, carbs: 1, fat: 9, fiber: 0, sugar: 0.5 },
    healthScore: 3,
    image: '🧀',
    color: 'bg-yellow-100'
  },
  
  // Snacks & Sweets
  {
    id: 'chips',
    name: 'Papas Fritas',
    category: 'snack',
    nutrition: { calories: 152, protein: 2, carbs: 15, fat: 10, fiber: 1.4, sugar: 0.1 },
    healthScore: 1,
    image: '🍟',
    color: 'bg-red-100'
  },
  
];