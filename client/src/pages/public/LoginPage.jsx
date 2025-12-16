import { Mail, ArrowRight, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthButton } from '../../components/auth/AuthButton.jsx';
import { ErrorMessage } from '../../components/auth/ErrorMessage.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { useAuth } from '../../context/authContext.jsx';

const LoginPage = ({ error, setError }) => {
  const navigate = useNavigate();
  const { user, login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
        case 'lab_admin':
          navigate('/lab-admin/dashboard');
          break;
        case 'lab_staff':
          navigate('/lab-staff/dashboard');
          break;
        default:
          navigate('/patient-dashboard');
      }
    }
  }, [isAuthenticated, navigate, user]);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email address';

    if (!formData.password) errors.password = 'Password is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (!result.success) {
      setError(result.error || 'Invalid credentials. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Sign in to Quick Clinic
            </h1>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
              Access your healthcare dashboard
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <ErrorMessage error={error} />

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`
                    block w-full px-4 py-3 border rounded-lg
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    transition-colors
                    ${
                      fieldErrors.email
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
                    }
                    text-gray-900 dark:text-white placeholder:text-gray-400
                  `}
                  placeholder="name@company.com"
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  required
                  error={fieldErrors.password}
                  placeholder="Enter your password"
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  Remember me for 30 days
                </label>
              </div>

              {/* Submit */}
              <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>
                Sign in
              </AuthButton>
            </form>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
        <div className="max-w-md text-white space-y-6">
          <h2 className="text-4xl font-bold">Welcome back to Quick Clinic</h2>
          <p className="text-lg text-blue-100">
            Manage appointments, access medical reports, and connect with your healthcare team—all
            in one secure platform.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="text-blue-50">Secure & encrypted</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="text-blue-50">24/7 access to your health data</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <span className="text-blue-50">HIPAA compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
