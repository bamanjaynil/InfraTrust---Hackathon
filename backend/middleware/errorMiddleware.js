const AppError = require('../utils/AppError');

const handleDbDuplicateFields = (err) => {
  const message = `Duplicate field value entered. Please use another value.`;
  return new AppError(message, 400);
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err, message: err.message, name: err.name, code: err.code };

  // PostgreSQL unique constraint violation
  if (error.code === '23505') error = handleDbDuplicateFields(error);
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') error = new AppError('Invalid token. Please log in again.', 401);
  if (error.name === 'TokenExpiredError') error = new AppError('Your token has expired! Please log in again.', 401);

  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode).json({
      status: error.status,
      error: error,
      message: error.message,
      stack: err.stack
    });
  } else {
    // Production: send generic message for programming errors
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: error.status,
        message: error.message
      });
    } else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!'
      });
    }
  }
};

module.exports = errorHandler;
