const Trainer = require('../models/Trainer');
const User = require('../models/User');

const createTrainer = async (trainerData) => {
  // First, verify the user exists
  const user = await User.findById(trainerData.userId);
  if (!user) {
    const error = new Error('User not found to associate with trainer');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  const trainer = await Trainer.create(trainerData);

  // Update user's role to TRAINER
  user.role = 'TRAINER';
  await user.save();

  return trainer;
};

const getAllTrainers = async () => {
  return await Trainer.find({});
};

const getTrainerById = async (id) => {
  const trainer = await Trainer.findById(id);
  if (!trainer) {
    const error = new Error('Trainer not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }
  return trainer;
};

const updateTrainer = async (id, trainerData) => {
  const trainer = await Trainer.findByIdAndUpdate(id, trainerData, { new: true, runValidators: true });
  if (!trainer) {
    const error = new Error('Trainer not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }
  return trainer;
};

const changeStatus = async (id, status) => {
  return await updateTrainer(id, { status });
};

module.exports = {
  createTrainer,
  getAllTrainers,
  getTrainerById,
  updateTrainer,
  changeStatus
};
