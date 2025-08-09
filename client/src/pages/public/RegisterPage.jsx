import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import { User, Stethoscope, Shield, Mail, Check } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { AuthButton } from '../../components/auth/AuthButton.jsx';
import { ErrorMessage } from '../../components/auth/ErrorMessage.jsx';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', role: 'patient' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'doctor':
          navigate('/doctor-dashboard');
          break;
        case 'admin':
          navigate('/admin-dashboard');
          break;
        default:
          navigate('/patient-dashboard');
      }
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    const result = await register({ email: formData.email, password: formData.password, role: formData.role });
    if (!result.success) {
      setError(result.error || 'Registration failed. Please try again.');
    }
    // Note: successful navigation is handled by the useEffect hook
    setIsLoading(false);
  };

  const roleOptions = [
    { value: 'patient', label: 'Patient', icon: User, color: 'blue' },
    { value: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'green' },
    { value: 'admin', label: 'Admin', icon: Shield, color: 'purple' }
  ];

  return (
    <AuthLayout title="Create Your Account" subtitle="Join Quick Clinic to manage your health with ease.">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ErrorMessage error={error} />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">I am a:</label>
          <div className="grid grid-cols-3 gap-3">
            {roleOptions.map((option) => (
              <label key={option.value} htmlFor={option.value} className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${ formData.role === option.value ? `border-${option.color}-500 bg-${option.color}-50` : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" id={option.value} name="role" value={option.value} checked={formData.role === option.value} onChange={handleInputChange} className="sr-only" />
                <option.icon className={`w-6 h-6 mb-1 ${formData.role === option.value ? `text-${option.color}-600` : 'text-gray-500'}`} />
                <span className="text-sm font-medium text-gray-800">{option.label}</span>
                {formData.role === option.value && <Check className={`w-5 h-5 text-white bg-${option.color}-500 rounded-full p-1 absolute top-1 right-1`} />}
              </label>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email Address" required className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all ${fieldErrors.email ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} />
        </div>
        {fieldErrors.email && <p className="text-sm text-red-600 -mt-4 ml-2">{fieldErrors.email}</p>}

        <PasswordInput id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Create Password" showPassword={showPassword} setShowPassword={setShowPassword} error={fieldErrors.password} required />
        
        <PasswordInput id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm Password" showPassword={showConfirmPassword} setShowPassword={setShowConfirmPassword} error={fieldErrors.confirmPassword} required />

        <div className="pt-2">
          <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>Create Account</AuthButton>
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">Sign In</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
