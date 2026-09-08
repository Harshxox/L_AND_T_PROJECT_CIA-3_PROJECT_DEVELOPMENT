const Equipment = require('../models/Equipment');

const getAllEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.find().sort({ name: 1 });
    res.status(200).json({ success: true, data: { equipment } });
  } catch (err) {
    next(err);
  }
};

const createEquipment = async (req, res, next) => {
  try {
    const { name, serialNumber, category, locationRoom, status, nextMaintenanceDate, notes } = req.body;
    if (!name || !serialNumber) {
      return res.status(400).json({ success: false, message: 'Equipment name and serial number are required', errorCode: 'VALIDATION_ERROR' });
    }
    const item = await Equipment.create({
      name,
      serialNumber,
      category,
      locationRoom,
      status,
      nextMaintenanceDate,
      notes
    });
    res.status(201).json({ success: true, message: 'Equipment added', data: { equipment: item } });
  } catch (err) {
    next(err);
  }
};

const updateEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    res.status(200).json({ success: true, message: 'Equipment updated', data: { equipment: item } });
  } catch (err) {
    next(err);
  }
};

const deleteEquipment = async (req, res, next) => {
  try {
    const item = await Equipment.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    res.status(200).json({ success: true, message: 'Equipment deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment
};
