/**
 * @file Defines the ThemeToggle component.
 */
import React from 'react';

/**
 * @interface ThemeToggleProps
 * Props for the ThemeToggle component.
 * @property {boolean} isDarkMode - Current state of dark mode.
 * @property {() => void} onToggle - Function to call when the toggle button is clicked.
 */
interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

/**
 * ThemeToggle component.
 * Renders a button to switch between light and dark themes.
 * @param {ThemeToggleProps} props - The props for the component.
 * @returns {JSX.Element} The rendered button element for theme toggling.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onToggle }) => {
  /**
   * Handles the click event on the toggle button.
   * Calls the `onToggle` prop function.
   */
  const handleClick = () => {
    // console.log(`[ThemeToggle.tsx] Button clicked. Current isDarkMode prop: ${isDarkMode}. Calling onToggle...`);
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors duration-200"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};