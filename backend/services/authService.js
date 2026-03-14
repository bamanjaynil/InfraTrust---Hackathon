const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const config = require('../config/config');
const AppError = require('../utils/AppError');

class AuthService {
  static async registerCitizen({ name, email, phone, password, state, district, city, pincode, latitude, longitude }) {
    // Sanitize email
    const sanitizedEmail = email ? email.toLowerCase().trim() : null;
    const sanitizedPhone = phone ? phone.trim() : null;

    // Check if user already exists
    const existingUser = await UserModel.findByIdentifier(sanitizedEmail || sanitizedPhone);
    if (existingUser) {
      throw new AppError('User with this email or phone already exists', 409);
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = await UserModel.createUser({
      name: name.trim(),
      email: sanitizedEmail,
      phone: sanitizedPhone,
      password_hash,
      role: 'CITIZEN',
      truck_plate: null,
      state,
      district,
      city,
      pincode,
      latitude,
      longitude
    });

    return newUser;
  }

  static async login({ identifier, password, truck_plate, role }) {
    const sanitizedIdentifier = identifier.toLowerCase().trim();

    const user = await UserModel.findByIdentifier(sanitizedIdentifier);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    // If role is provided in request, validate it matches the user's role
    if (role && user.role !== role) {
      throw new AppError('Invalid role for this user', 403);
    }

    if (user.role === 'DRIVER') {
      if (!truck_plate) {
        throw new AppError('Truck plate is required for drivers', 400);
      }
      if (user.truck_plate !== truck_plate.trim()) {
        throw new AppError('Invalid truck plate', 401);
      }
    }

    const token = jwt.sign(
      { user_id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return {
      token,
      role: user.role,
      user_id: user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        truck_plate: user.truck_plate,
        state: user.state,
        district: user.district,
        city: user.city,
        pincode: user.pincode,
        latitude: user.latitude,
        longitude: user.longitude
      }
    };
  }

  static async getMe(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }
}

module.exports = AuthService;
