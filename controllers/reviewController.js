const Review = require('../models/Review');
const Trainer = require('../models/Trainer');

const createReview = async (req, res, next) => {
  try {
    const memberId = req.user.id;
    const { targetType, trainerId, classId, rating, comment } = req.body;

    if (!rating || !comment || !targetType) {
      return res.status(400).json({ success: false, message: 'Rating, comment, and targetType are required', errorCode: 'VALIDATION_ERROR' });
    }

    const review = await Review.create({
      memberId,
      targetType,
      trainerId: targetType === 'TRAINER' ? trainerId : undefined,
      classId: targetType === 'CLASS' ? classId : undefined,
      rating: Number(rating),
      comment
    });

    // Update trainer rating average if reviewing a trainer
    if (targetType === 'TRAINER' && trainerId) {
      const allTrainerReviews = await Review.find({ targetType: 'TRAINER', trainerId });
      const avg = allTrainerReviews.reduce((sum, r) => sum + r.rating, 0) / allTrainerReviews.length;
      await Trainer.findByIdAndUpdate(trainerId, {
        rating: Math.round(avg * 10) / 10,
        ratingCount: allTrainerReviews.length
      });
    }

    res.status(201).json({ success: true, message: 'Review submitted', data: { review } });
  } catch (err) {
    next(err);
  }
};

const getTrainerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ targetType: 'TRAINER', trainerId: req.params.trainerId })
      .populate('memberId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { reviews } });
  } catch (err) {
    next(err);
  }
};

const getClassReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ targetType: 'CLASS', classId: req.params.classId })
      .populate('memberId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { reviews } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReview,
  getTrainerReviews,
  getClassReviews
};
