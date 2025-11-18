import useDarkMode from '../../hooks/useDarkMode';

export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative w-14 h-8 rounded-full bg-med-border dark:bg-med-green-700 transition-colors duration-300 cursor-pointer"
      aria-label="Toggle dark mode"
    >
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
          isDarkMode ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {isDarkMode ? '🌙' : '☀️'}
      </div>
    </button>
  );
}
