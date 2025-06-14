/**
 * @file Defines the GeminiApiKeySection component.
 * This component provides UI for users to input and save their Gemini API key.
 */
import React from 'react';
import type { UseGeminiApiKeyReturn } from './hooks/useGeminiApiKey';

/**
 * @interface GeminiApiKeySectionProps
 * Props for the GeminiApiKeySection component.
 * @property {UseGeminiApiKeyReturn} apiKeyState - The state and functions returned by the `useGeminiApiKey` hook.
 * @property {() => void} [onApiKeySaved] - Optional callback function to execute after the API key is successfully saved.
 */
interface GeminiApiKeySectionProps {
  apiKeyState: UseGeminiApiKeyReturn;
  onApiKeySaved?: () => void;
}

/**
 * GeminiApiKeySection component.
 * Renders an input field and save button for the Gemini API key,
 * along with a link to get an API key. This section is hidden if
 * a global `process.env.API_KEY` is available.
 *
 * @param {GeminiApiKeySectionProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered API key input section, or null if a global key is set.
 */
export const GeminiApiKeySection: React.FC<GeminiApiKeySectionProps> = ({ apiKeyState, onApiKeySaved }) => {
  const {
    tempApiKey,
    setTempApiKey,
    showApiKeyInput,
    setShowApiKeyInput,
    apiKeyError,
    handleSaveApiKey, // Original save handler from the hook
  } = apiKeyState;

  /**
   * Handles the save action. It calls the hook's save function
   * and then the optional `onApiKeySaved` callback if provided and no errors occurred.
   */
  const handleSave = () => {
    handleSaveApiKey(); // Call the hook's save logic
    // Check apiKeyError from the hook's state *after* calling handleSaveApiKey.
    // The hook updates apiKeyError internally.
    // To ensure we use the latest state of apiKeyError, it might be better if
    // handleSaveApiKey returned a success/failure status or if onApiKeySaved
    // was integrated more directly into the hook's success path.
    // For now, assume that if handleSaveApiKey doesn't set an error, it was successful.
    // A slight delay or checking the error state *after* the call might be needed if timing issues arise.
    // However, `handleSaveApiKey` updates `apiKeyError` synchronously.
    if (onApiKeySaved && !apiKeyState.apiKeyError) { 
        onApiKeySaved();
    }
  }

  // If a global API key is set via environment variables, do not render this user input section.
  if (process.env.API_KEY) {
    return null;
  }

  return (
    <div className="mb-4 shrink-0">
      <button
        onClick={() => setShowApiKeyInput(prev => !prev)}
        className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-1"
        aria-expanded={showApiKeyInput}
        aria-controls="gemini-api-key-details"
      >
        {showApiKeyInput ? 'Hide Gemini API Key Input' : 'Set/Update Gemini API Key'}
      </button>
      {showApiKeyInput && (
        <div id="gemini-api-key-details" className="p-3 my-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
          <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gemini API Key:
          </label>
          <input
            id="api-key-input"
            type="password" // Use password type to obscure the key
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder="Enter your Gemini API Key"
            className="w-full p-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm dark:bg-gray-600 dark:text-gray-100 text-base"
            aria-describedby={apiKeyError ? "api-key-error-message" : undefined}
          />
          {apiKeyError && (
            <p id="api-key-error-message" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
              {apiKeyError}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 dark:focus:ring-offset-gray-700"
            >
              Save API Key
            </button>
            <a 
              href="https://aistudio.google.com/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Get your free Gemini API Key
            </a>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Your Gemini API Key is saved securely in your browser's local storage for this page.
          </p>
        </div>
      )}
    </div>
  );
};