const ProgressLog = require('../models/ProgressLog');

const logProgress = async (req, res, next) => {
  try {
    const memberId = req.user.id;
    const {
      weightKg,
      bodyFatPercentage,
      muscleMassKg,
      chestCm,
      waistCm,
      bicepsCm,
      benchPressPR,
      squatPR,
      deadliftPR,
      notes,
      date
    } = req.body;

    if (!weightKg) {
      return res.status(400).json({ success: false, message: 'Weight (kg) is required', errorCode: 'VALIDATION_ERROR' });
    }

    const log = await ProgressLog.create({
      memberId,
      weightKg,
      bodyFatPercentage,
      muscleMassKg,
      chestCm,
      waistCm,
      bicepsCm,
      benchPressPR,
      squatPR,
      deadliftPR,
      notes,
      date: date || new Date()
    });

    res.status(201).json({ success: true, message: 'Progress logged successfully', data: { log } });
  } catch (err) {
    next(err);
  }
};

const getMyProgress = async (req, res, next) => {
  try {
    const logs = await ProgressLog.find({ memberId: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: { logs } });
  } catch (err) {
    next(err);
  }
};

const getMemberProgress = async (req, res, next) => {
  try {
    const logs = await ProgressLog.find({ memberId: req.params.memberId }).sort({ date: -1 });
    res.status(200).json({ success: true, data: { logs } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  logProgress,
  getMyProgress,
  getMemberProgress
};
