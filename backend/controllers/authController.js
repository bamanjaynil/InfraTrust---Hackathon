const AuthService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

class AuthController {
  static register = catchAsync(async (req, res, next) => {
    const { name, email, phone, password, role, state, district, city, pincode, latitude, longitude } = req.body;
    
    // Only CITIZENS can register through this endpoint
    if (role && role !== 'CITIZEN') {
      return next(new AppError('Only citizens can register through this endpoint', 403));
    }
    
    const user = await AuthService.registerCitizen({ 
      name, email, phone, password, 
      state, district, city, pincode, latitude, longitude 
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      user_id: user.id,
      role: user.role
    });
  });

  static login = catchAsync(async (req, res, next) => {
    // The frontend sends role, identifier, password, truckPlate
    const { identifier, password, truckPlate, role } = req.body;
    
    const result = await AuthService.login({ 
      identifier, 
      password, 
      truck_plate: truckPlate,
      role 
    });
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  });

  static getMe = catchAsync(async (req, res, next) => {
    const userId = req.user.user_id;
    const user = await AuthService.getMe(userId);
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });
}

module.exports = AuthController;
