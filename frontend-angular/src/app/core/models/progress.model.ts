export interface ProgressLog {
  _id?: string;
  memberId?: string;
  date: string;
  weightKg: number;
  bodyFatPercentage?: number;
  muscleMassKg?: number;
  chestCm?: number;
  waistCm?: number;
  bicepsCm?: number;
  benchPressPR?: number;
  squatPR?: number;
  deadliftPR?: number;
  notes?: string;
}

export interface WorkoutPlan {
  _id?: string;
  memberId: string | any;
  trainerId: string | any;
  title: string;
  goals?: string;
  difficulty?: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    restSeconds?: number;
    videoUrl?: string;
    notes?: string;
  }[];
  nutritionPlan?: {
    dailyCalories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatsGrams: number;
    waterLiters?: number;
    mealPlanNotes?: string;
  };
  generalNotes?: string;
  createdAt?: string;
}
