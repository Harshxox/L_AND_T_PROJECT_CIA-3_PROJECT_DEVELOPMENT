const Class = require('../models/Class');
const Trainer = require('../models/Trainer');

const createClass = async (classData) => {
  // Validate Trainer
  const trainer = await Trainer.findById(classData.trainerId);
  if (!trainer) {
    const error = new Error('Trainer not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }
  
  if (trainer.status !== 'ACTIVE') {
    const error = new Error('Cannot assign an inactive trainer to a class');
    error.statusCode = 400;
    error.errorCode = 'INACTIVE_TRAINER';
    throw error;
  }

  return await Class.create(classData);
};

const getAllClasses = async (filters = {}) => {
  return await Class.find(filters).populate('trainerId');
};

const getClassById = async (id) => {
  const classItem = await Class.findById(id).populate('trainerId');
  if (!classItem) {
    const error = new Error('Class not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }
  return classItem;
};

const updateClass = async (id, updateData) => {
  const classItem = await Class.findById(id);
  if (!classItem) {
    const error = new Error('Class not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }

  // Validate Trainer if updating trainer
  if (updateData.trainerId && updateData.trainerId !== classItem.trainerId.toString()) {
    const trainer = await Trainer.findById(updateData.trainerId);
    if (!trainer) {
      const error = new Error('Trainer not found');
      error.statusCode = 404;
      error.errorCode = 'NOT_FOUND';
      throw error;
    }
    if (trainer.status !== 'ACTIVE') {
      const error = new Error('Cannot assign an inactive trainer to a class');
      error.statusCode = 400;
      error.errorCode = 'INACTIVE_TRAINER';
      throw error;
    }
  }

  // Combine old and new for time validation if only one time is provided
  const startTime = updateData.startTime || classItem.startTime;
  const endTime = updateData.endTime || classItem.endTime;
  if (startTime >= endTime) {
    const error = new Error('endTime must be after startTime');
    error.statusCode = 400;
    error.errorCode = 'VALIDATION_ERROR';
    throw error;
  }

  const updatedClass = await Class.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  return updatedClass;
};

const deleteClass = async (id) => {
  const classItem = await Class.findByIdAndDelete(id);
  if (!classItem) {
    const error = new Error('Class not found');
    error.statusCode = 404;
    error.errorCode = 'NOT_FOUND';
    throw error;
  }
  return classItem;
};

module.exports = {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass
};
