import { Check, Mail, Shield, Stethoscope, User, Microscope, FlaskConical } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthButton } from '../../components/auth/AuthButton.jsx';
import { ErrorMessage } from '../../components/auth/ErrorMessage.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { useAuth } from '../../context/authContext.jsx';

const RegisterPage = ({ error, setError }) => {
  const navigate = useNavigate();
  const { user, register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'doctor':
          navigate('/doctor-dashboard');
          break;
        case 'admin':
          navigate('/admin/complete-profile');
          break;
        case 'lab_admin':
          navigate('/quick-lab/lab-admin/dashboard');
          break;
        case 'lab_staff':
          navigate('/quick-lab/lab-staff/dashboard');
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
    else if (formData.password.length < 8) errors.password = 'Must be at least 8 characters';

    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';

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

    const result = await register({
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });

    if (!result.success) {
      setError(result.error || 'Registration failed. Please try again.');
    }
    setIsLoading(false);
  };

  const roleOptions = [
    {
      value: 'patient',
      label: 'Patient',
      icon: User,
      description: 'Book appointments & manage health records',
    },
    {
      value: 'doctor',
      label: 'Doctor',
      icon: Stethoscope,
      description: 'Manage consultations & patient care',
    },
    {
      value: 'admin',
      label: 'Administrator',
      icon: Shield,
      description: 'Oversee clinic operations',
    },
    {
      value: 'lab_admin',
      label: 'Lab Administrator',
      icon: Microscope,
      description: 'Manage laboratory operations',
    },
    {
      value: 'lab_staff',
      label: 'Lab Staff',
      icon: FlaskConical,
      description: 'Process tests & upload results',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-8">
        <div className="max-w-md text-white space-y-4">
          <h2 className="text-3xl font-bold">Join Quick Clinic</h2>
          <p className="text-base text-blue-100">
            One unified platform for patients, doctors, administrators, and laboratory staff.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <span className="text-sm text-blue-50">Role-based access control</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <span className="text-sm text-blue-50">Enterprise-grade security</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <span className="text-sm text-blue-50">Seamless healthcare management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full max-w-2xl">
          {/* Header - Compact */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Get started with Quick Clinic today
            </p>
          </div>

          {/* Form - Compact */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <ErrorMessage error={error} />

              {/* Role Selection - Compact Grid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select your role
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {roleOptions.map((role) => {
                    const Icon = role.icon;
                    const isSelected = formData.role === role.value;

                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, role: role.value }))}
                        className={`
                          relative p-3 rounded-lg border-2 text-center transition-all group
                          ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }
                        `}
                        title={role.description}
                      >
                        {isSelected && (
                          <div className="absolute -top-1 -right-1">
                            <Check className="w-4 h-4 text-white bg-blue-600 rounded-full p-0.5" />
                          </div>
                        )}
                        <Icon
                          className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`}
                        />
                        <div className="text-xs font-medium text-gray-900 dark:text-white">
                          {role.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email & Passwords in 2 Columns */}
              <div className="grid grid-cols-2 gap-4">
                {/* Email */}
                <div className="col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
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
                      block w-full px-3 py-2.5 border rounded-lg text-sm
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
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Password
                  </label>
                  <PasswordInput
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    required
                    error={fieldErrors.password}
                    placeholder="Min. 8 characters"
                    compact
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Confirm password
                  </label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    showPassword={showConfirmPassword}
                    setShowPassword={setShowConfirmPassword}
                    required
                    error={fieldErrors.confirmPassword}
                    placeholder="Re-enter password"
                    compact
                  />
                </div>
              </div>

              {/* Terms - Compact */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Submit - Compact */}
              <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>
                Create account
              </AuthButton>
            </form>
          </div>

          {/* Sign In Link - Compact */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-500 dark:hover:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
