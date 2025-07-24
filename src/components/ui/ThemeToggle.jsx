import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 ease-in-out transform ${
        isDark
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
      }`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative w-5 h-5">
        {isDark ? (
          <Sun className="absolute inset-0 transition-transform duration-200 ease-in-out" />
        ) : (
          <Moon className="absolute inset-0 transition-transform duration-200 ease-in-out" />
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
