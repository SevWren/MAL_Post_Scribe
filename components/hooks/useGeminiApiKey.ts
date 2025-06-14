/**
 * @file Custom React hook for managing the Gemini API key.
 * Handles loading the key from localStorage, temporary state for input,
 * saving the key, and error handling related to the API key.
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * @interface UseGeminiApiKeyReturn
 * Defines the return type of the `useGeminiApiKey` hook.
 * @property {string} userApiKey - The currently active Gemini API key (from localStorage or environment variable if that was primary).
 * @property {string} tempApiKey - Temporary state for the API key input field.
 * @property {React.Dispatch<React.SetStateAction<string>>} setTempApiKey - Setter for `tempApiKey`.
 * @property {boolean} showApiKeyInput - Flag to control visibility of the API key input section.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setShowApiKeyInput - Setter for `showApiKeyInput`.
 * @property {string | null} apiKeyError - Error message related to API key validation or saving.
 * @property {() => void} handleSaveApiKey - Function to save the `tempApiKey` to localStorage.
 * @property {boolean} isApiKeySet - Boolean indicating if an API key (either from env or user) is available.
 */
export interface UseGeminiApiKeyReturn {
  userApiKey: string;
  tempApiKey: string;
  setTempApiKey: React.Dispatch<React.SetStateAction<string>>;
  showApiKeyInput: boolean;
  setShowApiKeyInput: React.Dispatch<React.SetStateAction<boolean>>;
  apiKeyError: string | null;
  handleSaveApiKey: () => void;
  isApiKeySet: boolean;
}

/**
 * Custom hook to manage the Gemini API key.
 * It abstracts the logic for storing, retrieving, and updating the API key
 * used for interacting with the Gemini AI service.
 * If `process.env.API_KEY` is set, it will be prioritized and user input will be hidden.
 * Otherwise, it allows users to set their key via an input, storing it in localStorage.
 *
 * @returns {UseGeminiApiKeyReturn} An object containing API key state and management functions.
 */
export const useGeminiApiKey = (): UseGeminiApiKeyReturn => {
  /**
   * State for the API key retrieved from localStorage.
   */
  const [userApiKey, setUserApiKey] = useState<string>('');
  /**
   * State for the temporary API key being entered by the user.
   */
  const [tempApiKey, setTempApiKey] = useState<string>('');
  /**
   * State to control the visibility of the API key input field.
   */
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  /**
   * State for displaying errors related to API key input/saving.
   */
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  /**
   * Effect to load the API key from localStorage on initial mount.
   * If no key is stored and no environment key is present, it shows the input field.
   */
  useEffect(() => {
    const storedApiKey = localStorage.getItem('geminiUserApiKey');
    if (storedApiKey) {
      setUserApiKey(storedApiKey);
      setTempApiKey(storedApiKey); // Initialize temp key with stored key for editing
    } else if (!process.env.API_KEY) {
      // Only show input if no env key and no stored key
      setShowApiKeyInput(true);
    }
  }, []);

  /**
   * Saves the `tempApiKey` to localStorage and updates the active `userApiKey`.
   * Performs basic validation to ensure the key is not empty.
   * Wrapped in `useCallback` for stable reference.
   */
  const handleSaveApiKey = useCallback(() => {
    if (!tempApiKey.trim()) {
      setApiKeyError("Gemini API Key cannot be empty.");
      return;
    }
    localStorage.setItem('geminiUserApiKey', tempApiKey);
    setUserApiKey(tempApiKey);
    setApiKeyError(null);
    setShowApiKeyInput(false); // Hide input after successful save
    // User feedback (e.g., alert) is handled by the calling component.
  }, [tempApiKey]);

  /**
   * Derived state indicating whether an API key is effectively set (either from environment or user storage).
   */
  const isApiKeySet = !!(process.env.API_KEY || userApiKey);

  return {
    userApiKey,
    tempApiKey,
    setTempApiKey,
    showApiKeyInput,
    setShowApiKeyInput,
    apiKeyError,
    handleSaveApiKey,
    isApiKeySet,
  };
};