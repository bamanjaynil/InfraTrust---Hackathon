const UserModel = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getUsersByRole = catchAsync(async (req, res, next) => {
  const { role } = req.query;

  if (!role) {
    return next(new AppError('Role parameter is required', 400));
  }

  const validRoles = ['ADMIN', 'CONTRACTOR', 'DRIVER', 'CITIZEN'];
  if (!validRoles.includes(role)) {
    return next(new AppError('Invalid role parameter', 400));
  }

  const users = await UserModel.findByRole(role);

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});
