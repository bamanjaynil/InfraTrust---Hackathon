import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Navigation, CheckCircle2 } from 'lucide-react';
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
    longitude: null,
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleDetectLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setLocating(false);
        },
        (error) => {
          console.error('Error detecting location', error);
          setLocating(false);
          setErrors((prev) => ({ ...prev, location: 'Failed to detect location. Please enter manually.' }));
        }
      );
    } else {
      setLocating(false);
      setErrors((prev) => ({ ...prev, location: 'Geolocation is not supported by your browser.' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email address';
    if (!isValidPhone(formData.phone)) newErrors.phone = 'Invalid phone number';
    if (!isStrongPassword(formData.password)) newErrors.password = 'Password must be at least 6 characters';
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
        longitude: formData.longitude,
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
        <div className="space-y-4 py-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-400/12 text-emerald-200">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-slate-50">Registration Successful</h3>
          <p className="text-sm text-slate-400">Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <ErrorMessage message={apiError} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] px-4 py-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Location Details</h4>
                <p className="mt-1 text-xs text-slate-400">Add your area so the app can surface relevant projects faster.</p>
              </div>
              <Button
                type="button"
                onClick={handleDetectLocation}
                disabled={locating}
                variant="outline"
                size="sm"
                fullWidth={false}
              >
                <Navigation className="h-4 w-4" />
                {locating ? 'Detecting...' : 'Auto-detect GPS'}
              </Button>
            </div>

            {errors.location && <p className="mb-3 text-xs text-rose-300">{errors.location}</p>}
            {formData.latitude && formData.longitude && (
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                GPS coordinates saved
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          <div className="grid grid-cols-1 gap-4 border-t border-white/8 pt-4 md:grid-cols-2">
            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="........"
              error={errors.password}
            />

            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="........"
              error={errors.confirmPassword}
            />
          </div>

          <Button type="submit" isLoading={loading} className="mt-6">
            Create Account
          </Button>

          <div className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-teal-200 transition-colors hover:text-white">
              Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
