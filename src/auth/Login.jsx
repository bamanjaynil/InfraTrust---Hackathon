import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Truck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import InputField from '../components/InputField';
import PasswordField from '../components/PasswordField';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { login } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { getRoleRedirectPath } from '../utils/roleRedirect';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    role: 'CITIZEN',
    identifier: '',
    password: '',
    truckPlate: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { role, identifier, password, truckPlate } = formData;

    if (!identifier || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (role === 'DRIVER' && !truckPlate) {
      setError('Truck number plate is required for drivers.');
      return;
    }

    setLoading(true);
    try {
      const credentials = {
        role,
        identifier,
        password,
        ...(role === 'DRIVER' && { truckPlate }),
      };

      const response = await login(credentials);
      setAuth(response.user, response.token);
      navigate(getRoleRedirectPath(response.user.role));
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In" subtitle="Command Center Access">
      <form onSubmit={handleSubmit} className="space-y-5">
        <ErrorMessage message={error} />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-300">Select Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="block min-h-12 w-full rounded-xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-slate-100 outline-none transition duration-200 focus:border-teal-300/45 focus:bg-slate-950/72 focus:ring-4 focus:ring-teal-400/10"
          >
            <option value="CITIZEN">Citizen</option>
            <option value="DRIVER">Driver</option>
            <option value="CONTRACTOR">Contractor</option>
            <option value="ADMIN">Admin / PWD</option>
          </select>
        </div>

        <InputField
          label={formData.role === 'DRIVER' ? 'Phone Number' : 'Email or Phone Number'}
          name="identifier"
          type="text"
          value={formData.identifier}
          onChange={handleChange}
          icon={User}
          placeholder={formData.role === 'DRIVER' ? '+1234567890' : 'Enter email or phone'}
          required
        />

        <PasswordField
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="........"
          required
        />

        {formData.role === 'DRIVER' && (
          <InputField
            label="Truck Number Plate"
            name="truckPlate"
            type="text"
            value={formData.truckPlate}
            onChange={handleChange}
            icon={Truck}
            placeholder="e.g. AB-123-CD"
            required
          />
        )}

        <Button type="submit" isLoading={loading}>
          Sign In
        </Button>

        <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-xs text-slate-400">
          Demo accounts: `admin@infratrust.com`, `contractor@infratrust.com`, `driver@infratrust.com`, `citizen@infratrust.com`
          <br />
          Password for all roles: `demo123`
        </div>

        <div className="mt-4 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-teal-200 transition-colors hover:text-white">
            Register as Citizen
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
