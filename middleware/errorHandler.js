const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  // Log for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { message, statusCode: 400, errorCode: 'INVALID_ID' };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 409, errorCode: 'DUPLICATE_KEY' };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400, errorCode: 'VALIDATION_ERROR' };
  }

  const statusCode = error.statusCode || err.status || 500;
  const message = error.message || 'Internal Server Error';
  const errorCode = error.errorCode || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    message: message,
    errorCode: errorCode
  });
};

module.exports = errorHandler;
