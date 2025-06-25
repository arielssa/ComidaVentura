export interface Food {
  id: string;
  name: string;
  category: 'protein' | 'vegetable' | 'fruit' | 'grain' | 'dairy' | 'sweet' | 'snack';
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  healthScore: number; // 1-5, 5 being healthiest
  image: string;
  color: string;
}

export interface Plate {
  foods: Food[];
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  healthScore: number;
  balance: {
    protein: number;
    vegetables: number;
    fruits: number;
    grains: number;
    dairy: number;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requirement: string;
}

export interface PlayerStats {
  totalPoints: number;
  platesCreated: number;
  healthyChoices: number;
  achievements: Achievement[];
  streakDays: number;
}