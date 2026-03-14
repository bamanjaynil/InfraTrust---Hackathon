import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Navigation } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { register } from '../services/authService';
import { isValidEmail, isValidPhone, isStrongPassword } from '../utils/validators';

export default function Register() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    latitude: null,
    longitude: null
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear specific error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleDetectLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setLocating(false);
        },
        (error) => {
          console.error("Error detecting location", error);
          setLocating(false);
          setErrors(prev => ({ ...prev, location: 'Failed to detect location. Please enter manually.' }));
        }
      );
    } else {
      setLocating(false);
      setErrors(prev => ({ ...prev, location: 'Geolocation is not supported by your browser.' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email address';
    if (!isValidPhone(formData.phone)) newErrors.phone = 'Invalid phone number';
    if (!isStrongPassword(formData.password)) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'CITIZEN',
        state: formData.state,
        district: formData.district,
        city: formData.city,
        pincode: formData.pincode,
        latitude: formData.latitude,
        longitude: formData.longitude
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Citizen Registration" subtitle="Join the Transparency Network">
      {success ? (
        <div className="text-center space-y-4 py-8">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-zinc-100">Registration Successful!</h3>
          <p className="text-zinc-400 text-sm">Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorMessage message={apiError} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              placeholder="Jane Doe"
              error={errors.name}
            />

            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              placeholder="jane@example.com"
              error={errors.email}
            />
          </div>

          <InputField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            icon={Phone}
            placeholder="+1234567890"
            error={errors.phone}
          />

          <div className="pt-4 pb-2 border-t border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-zinc-300">Location Details</h4>
              <button 
                type="button" 
                onClick={handleDetectLocation}
                disabled={locating}
                className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
              >
                <Navigation className="w-3 h-3" />
                {locating ? 'Detecting...' : 'Auto-detect GPS'}
              </button>
            </div>
            {errors.location && <p className="text-red-400 text-xs mb-2">{errors.location}</p>}
            {formData.latitude && formData.longitude && (
              <p className="text-emerald-400 text-xs mb-4">✓ GPS Coordinates saved</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                icon={MapPin}
                placeholder="Maharashtra"
                error={errors.state}
              />
              <InputField
                label="District"
                name="district"
                value={formData.district}
                onChange={handleChange}
                icon={MapPin}
                placeholder="Pune"
                error={errors.district}
              />
              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                icon={MapPin}
                placeholder="Pune"
                error={errors.city}
              />
              <InputField
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                icon={MapPin}
                placeholder="411001"
                error={errors.pincode}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
            />

            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
            />
          </div>

          <Button type="submit" isLoading={loading} className="mt-6 w-full">
            Create Account
          </Button>
          
          <div className="text-center text-sm text-zinc-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
