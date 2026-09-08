const classService = require('../services/classService');
const { createClassSchema, updateClassSchema } = require('../validators/classValidator');

const createClass = async (req, res, next) => {
  try {
    const { error } = createClassSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message, errorCode: 'VALIDATION_ERROR' });
    }
    const classItem = await classService.createClass(req.body);
    res.status(201).json({ success: true, message: 'Class created', data: { class: classItem } });
  } catch (err) { next(err); }
};

const getClasses = async (req, res, next) => {
  try {
    const classes = await classService.getAllClasses();
    res.status(200).json({ success: true, message: 'Classes retrieved', data: { classes } });
  } catch (err) { next(err); }
};

const getClass = async (req, res, next) => {
  try {
    const classItem = await classService.getClassById(req.params.id);
    res.status(200).json({ success: true, message: 'Class retrieved', data: { class: classItem } });
  } catch (err) { next(err); }
};

const updateClass = async (req, res, next) => {
  try {
    const { error } = updateClassSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message, errorCode: 'VALIDATION_ERROR' });
    }
    const classItem = await classService.updateClass(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Class updated', data: { class: classItem } });
  } catch (err) { next(err); }
};

const deleteClass = async (req, res, next) => {
  try {
    await classService.deleteClass(req.params.id);
    res.status(200).json({ success: true, message: 'Class deleted', data: {} });
  } catch (err) { next(err); }
};

module.exports = { createClass, getClasses, getClass, updateClass, deleteClass };
