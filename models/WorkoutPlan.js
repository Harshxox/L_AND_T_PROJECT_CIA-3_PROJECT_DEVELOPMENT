const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  title: { type: String, required: true },
  goals: { type: String },
  difficulty: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
    default: 'INTERMEDIATE'
  },
  exercises: [{
    name: { type: String, required: true },
    sets: { type: Number, default: 3 },
    reps: { type: String, default: '10-12' },
    restSeconds: { type: Number, default: 60 },
    videoUrl: { type: String, default: '' },
    notes: { type: String, default: '' }
  }],
  nutritionPlan: {
    dailyCalories: { type: Number, default: 2200 },
    proteinGrams: { type: Number, default: 150 },
    carbsGrams: { type: Number, default: 200 },
    fatsGrams: { type: Number, default: 65 },
    waterLiters: { type: Number, default: 3.5 },
    mealPlanNotes: { type: String, default: 'Eat balanced whole foods, hydrate regularly.' }
  },
  generalNotes: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);

