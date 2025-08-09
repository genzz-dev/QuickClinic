import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import { Mail } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { AuthButton } from '../../components/auth/AuthButton.jsx';
import { ErrorMessage } from '../../components/auth/ErrorMessage.jsx';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case 'doctor': navigate('/doctor-dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        default: navigate('/patient-dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setError('');
    
    const result = await login(formData);
    if (!result.success) {
      setError(result.error || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    } else {
      // Redirect based on user role
      switch (result.user.role) {
        case 'doctor':
          navigate('/doctor-dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/patient-dashboard');
      }
    }
    // Successful login is handled by the useEffect hook
  };

  return (
    <AuthLayout title="Welcome Back!" subtitle="Sign in to continue to Quick Clinic">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ErrorMessage error={error} />
        
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" required className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
        </div>

        <PasswordInput id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" showPassword={showPassword} setShowPassword={setShowPassword} required />

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Forgot password?
          </Link>
        </div>

        <div className="pt-2">
          <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>
            Sign In
          </AuthButton>
        </div>

        <p className="text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">Create one</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
