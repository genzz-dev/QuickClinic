import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import { Heart, Stethoscope, Activity, User, UserPlus, Eye, EyeOff, Loader2, Shield } from 'lucide-react';

const RegisterPage = () => {
  const navigate=useNavigate();
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

  // Redirect simulation
  useEffect(() => {
    // This would normally handle redirection after registration
  }, []);

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

    // Validation
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

    const result = await mockRegister(formData);
    
    if (!result.success) {
      setError(result.error);
    } else {
      // In real app: navigate based on user role
      alert(`Registration successful! Redirecting to ${result.user.role} dashboard...`);
    }
    
    setIsLoading(false);
  };

  const FloatingIcon = ({ Icon, className }) => (
    <div className={`absolute opacity-10 animate-pulse ${className}`}>
      <Icon size={24} className="text-green-300" />
    </div>
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Medical Icons Background */}
      <FloatingIcon Icon={Heart} className="top-20 left-20 animation-delay-0" />
      <FloatingIcon Icon={Stethoscope} className="top-40 right-32 animation-delay-1000" />
      <FloatingIcon Icon={Activity} className="bottom-32 left-16 animation-delay-2000" />
      <FloatingIcon Icon={UserPlus} className="bottom-20 right-20 animation-delay-3000" />
      
      {/* Animated Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-100 rounded-full opacity-20 animate-pulse animation-delay-1000"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <div className="relative">
              <Heart className="w-8 h-8 text-white" fill="currentColor" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Quick Clinic
          </h1>
          <p className="text-gray-600 mt-2">Join Our Healthcare Community</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Create Account</h2>
            <p className="text-gray-600">Sign up to get started with Quick Clinic</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div onSubmit={handleSubmit} className="space-y-6">
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
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
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-green-600 hover:text-green-700 font-semibold transition-colors bg-none border-none cursor-pointer"
              >
                Sign In
              </button>
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
        </div>
      </div>

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;