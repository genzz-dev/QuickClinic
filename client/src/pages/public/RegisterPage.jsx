import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import { Heart, Stethoscope, Activity, User, UserPlus, Shield } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { AuthFormContainer } from '../../components/auth/AuthFormContainer.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { AuthButton } from '../../components/auth/AuthButton.jsx';
import { ErrorMessage } from '../../components/auth/ErrorMessage.jsx';
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if already authenticated
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
  }, [isAuthenticated, user, navigate]);

  // Password strength checker
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (!result.success) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'patient', label: 'Patient', icon: User, color: 'blue' },
    { value: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'green' },
    { value: 'admin', label: 'Admin', icon: Shield, color: 'purple' }
  ];

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-400';
    if (passwordStrength <= 3) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const floatingIcons = [
    { Icon: Heart, className: "top-20 left-20 animation-delay-0", color: "green" },
    { Icon: Stethoscope, className: "top-40 right-32 animation-delay-1000", color: "green" },
    { Icon: Activity, className: "bottom-32 left-16 animation-delay-2000", color: "green" },
    { Icon: UserPlus, className: "bottom-20 right-20 animation-delay-3000", color: "green" }
  ];

  return (
    <AuthLayout 
      title="Quick Clinic"
      subtitle="Join Our Healthcare Community"
      bgFrom="green"
      bgTo="emerald"
      logoColorFrom="green"
      logoColorTo="emerald"
      floatingIcons={floatingIcons}
    >
      <AuthFormContainer title="Create Account" description="Sign up to get started with Quick Clinic">
        <ErrorMessage error={error} />
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({...formData, role: option.value})}
                    className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                      formData.role === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option.icon className={`w-5 h-5 mx-auto mb-1 ${
                      formData.role === option.value ? `text-${option.color}-600` : 'text-gray-400'
                    }`} />
                    <p className={`text-xs font-medium ${
                      formData.role === option.value ? `text-${option.color}-600` : 'text-gray-600'
                    }`}>
                      {option.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
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
                placeholder="Create a strong password"
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                className="focus:ring-green-500"
              />
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                showPassword={showConfirmPassword}
                setShowPassword={setShowConfirmPassword}
                className="focus:ring-green-500"
              />
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )}
            </div>
          </div>

          <AuthButton
            isLoading={isLoading}
            text="Create Account"
            loadingText="Creating Account..."
            colorFrom="green"
            colorTo="emerald"
          />
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login"
              className="text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Terms and Privacy */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By creating an account, you agree to our{' '}
            <button className="text-green-600 hover:underline bg-none border-none cursor-pointer">
              Terms of Service
            </button>{' '}
            and{' '}
            <button className="text-green-600 hover:underline bg-none border-none cursor-pointer">
              Privacy Policy
            </button>
          </p>
        </div>
      </AuthFormContainer>
    </AuthLayout>
  );
};

export default RegisterPage;