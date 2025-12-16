import { Eye, EyeOff } from 'lucide-react';

export const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  placeholder = 'Enter password',
  showPassword,
  setShowPassword,
  label,
  required = false,
  error = null,
}) => {
  return (
    <div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          autoComplete={name === 'password' ? 'current-password' : 'new-password'}
          required={required}
          value={value}
          onChange={onChange}
          className={`
            block w-full px-4 py-3 pr-11 border rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-colors
            ${
              error
                ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
            }
            text-gray-900 dark:text-white placeholder:text-gray-400
          `}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export default PasswordInput;
