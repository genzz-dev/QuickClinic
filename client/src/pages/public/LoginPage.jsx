import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import { Heart, Stethoscope, Activity, Eye, EyeOff } from 'lucide-react';
// import { AuthLayout, AuthFormContainer, PasswordInput, AuthButton, ErrorMessage } from '../../components/auth'
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { AuthFormContainer } from '../../components/auth/AuthFormContainer.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { AuthButton } from '../../components/auth/AuthButton.jsx';
import { ErrorMessage } from '../../components/auth/ErrorMessage.jsx';
const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData);
    if (!result.success) {
      setError(result.error || 'Login failed');
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
  };

  const floatingIcons = [
    { Icon: Heart, className: "top-20 left-20 animation-delay-0", color: "blue" },
    { Icon: Stethoscope, className: "top-40 right-32 animation-delay-1000", color: "blue" },
    { Icon: Activity, className: "bottom-32 left-16 animation-delay-2000", color: "blue" },
    { Icon: Heart, className: "bottom-20 right-20 animation-delay-3000", color: "blue" }
  ];

  return (
    <AuthLayout 
      title="Quick Clinic"
      subtitle="Your Health, Our Priority"
      bgFrom="blue"
      bgTo="cyan"
      logoColorFrom="blue"
      logoColorTo="cyan"
      floatingIcons={floatingIcons}
    >
      <AuthFormContainer title="Welcome Back" description="Sign in to access your account">
        <ErrorMessage error={error} />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
              />
            </div>
          </div>

          <AuthButton
            isLoading={isLoading}
            text="Sign In"
            loadingText="Signing In..."
            colorFrom="blue"
            colorTo="cyan"
          />
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Role Indicators */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center mb-3">Quick access for:</p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Patients</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Doctors</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Admins</span>
            </div>
          </div>
        </div>
      </AuthFormContainer>
    </AuthLayout>
  );
};

export default LoginPage;