/**
 * @file Main application component.
 * Sets up the layout, state for BBCode and theme, and renders editor and preview panes.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BBCodeEditor } from './components/BBCodeEditor';
import { BBCodePreview } from './components/BBCodePreview';
import { ThemeToggle } from './components/ThemeToggle';
import { EditorToolbar } from './components/EditorToolbar'; // Import EditorToolbar
import { initialBBCode } from './constants';

/**
 * Main application component.
 * It manages the raw BBCode content, the current theme (dark/light),
 * and orchestrates the rendering of the editor, preview, and toolbar.
 * @returns {JSX.Element} The rendered App component.
 */
const App: React.FC = () => {
  /**
   * State for the raw BBCode string input by the user.
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [rawBBCode, setRawBBCode] = useState<string>(initialBBCode);

  /**
   * State for the dark mode preference.
   * Initialized from localStorage or system preference.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const initialValue = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
      // console.log('[App.tsx] Initial isDarkMode state:', initialValue);
      return initialValue;
    }
    // console.log('[App.tsx] Initial isDarkMode state (window undefined): false');
    return false;
  });

  /**
   * Ref for the BBCode editor's textarea element.
   * @type {React.RefObject<HTMLTextAreaElement>}
   */
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Effect to apply the theme class to the document's root element
   * and store the theme preference in localStorage when `isDarkMode` changes.
   */
  useEffect(() => {
    // console.log(`[App.tsx] useEffect for isDarkMode triggered. Current isDarkMode: ${isDarkMode}`);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      // console.log('[App.tsx] Applied dark theme to documentElement and localStorage.');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      // console.log('[App.tsx] Applied light theme to documentElement and localStorage.');
    }
  }, [isDarkMode]);

  /**
   * Toggles the dark mode state.
   * Wrapped in useCallback for performance, as it's passed to ThemeToggle.
   */
  const handleThemeToggle = useCallback(() => {
    // console.log('[App.tsx] handleThemeToggle ENTER');
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      // console.log(`[App.tsx] setIsDarkMode updater: prevMode=${prevMode}, newMode=${newMode}`);
      return newMode;
    });
    // console.log('[App.tsx] handleThemeToggle EXIT');
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
          MAL Post Scribe
          <span className="text-xl text-blue-600 dark:text-blue-400"> (MyAnimeList Rules)</span>
        </h1>
        <ThemeToggle isDarkMode={isDarkMode} onToggle={handleThemeToggle} />
      </header>
      
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="flex flex-col h-[calc(100vh-150px)] md:h-auto md:min-h-[600px]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Editor</h2>
            <EditorToolbar editorRef={textareaRef} setRawBBCode={setRawBBCode} />
          </div>
          <BBCodeEditor 
            rawBBCode={rawBBCode} 
            setRawBBCode={setRawBBCode} 
            editorRef={textareaRef} 
          />
        </div>
        <div className="flex flex-col h-[calc(100vh-150px)] md:h-auto md:min-h-[600px]">
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Preview</h2>
          <BBCodePreview rawBBCode={rawBBCode} />
        </div>
      </div>
      <footer className="text-center mt-6 text-base text-gray-500 dark:text-gray-400">
        <p>The Full Source code for the app is available at <a href="https://github.com/sevwren" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">github.com/sevwren</a>.</p>
      </footer>
    </div>
  );
};

export default App;