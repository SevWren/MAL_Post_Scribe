/**
 * @file Defines the SpeechToTextControls component.
 * This component provides UI elements for controlling speech-to-text functionality,
 * including a record button and status/error messages.
 */
import React from 'react';
import type { UseDeepgramTranscriptionReturn } from './hooks/useDeepgramTranscription';

/**
 * @interface SpeechToTextControlsProps
 * Props for the SpeechToTextControls component.
 * @property {UseDeepgramTranscriptionReturn} transcriptionState - The state and functions returned by the `useDeepgramTranscription` hook.
 * @property {boolean} isGeminiLoading - Flag indicating if the main AI (Gemini) is currently processing a request,
 *                                       to potentially disable speech-to-text controls.
 */
interface SpeechToTextControlsProps {
  transcriptionState: UseDeepgramTranscriptionReturn;
  isGeminiLoading: boolean;
}

/**
 * SpeechToTextControls component.
 * Renders a record button, and displays status and error messages related to
 * the speech-to-text transcription process managed by `useDeepgramTranscription`.
 *
 * @param {SpeechToTextControlsProps} props - The props for the component.
 * @returns {JSX.Element} The rendered speech-to-text controls.
 */
export const SpeechToTextControls: React.FC<SpeechToTextControlsProps> = ({ transcriptionState, isGeminiLoading }) => {
  const {
    isRecording,
    isTranscribing,
    transcriptionStatus,
    deepgramError,
    toggleRecording,
    permissionStatus,
  } = transcriptionState;

  /**
   * Determines the label for the record button based on the current transcription state.
   * @returns {string} The text label for the record button.
   */
  const getRecordButtonLabel = () => {
    if (isRecording) return "Stop Recording";
    if (isTranscribing) return "Processing Audio...";
    if (permissionStatus === 'pending') return "Requesting Mic...";
    return "Record Audio";
  };

  /**
   * Determines if the record button should be disabled.
   * Disabled if Gemini AI is loading (and not actively recording/transcribing),
   * or if microphone permission is pending.
   * @type {boolean}
   */
  const isButtonDisabled = 
    (isGeminiLoading && !isRecording && !isTranscribing) ||
    permissionStatus === 'pending';

  return (
    <>
      <div className="flex items-center justify-between mb-1 shrink-0">
        <label htmlFor="ai-user-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Enter your prompt (or use microphone):
        </label>
        <button
          type="button"
          onClick={toggleRecording}
          disabled={isButtonDisabled}
          className={`px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors
            ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500' :
              (isTranscribing || permissionStatus === 'pending' ? 'bg-yellow-500 text-white focus:ring-yellow-500 cursor-wait' :
                'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500')}
            ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label={isRecording ? "Stop recording and process audio" : (isTranscribing ? "Audio transcription in progress" : (permissionStatus === 'pending' ? "Requesting microphone permission" : "Start recording audio prompt"))}
          aria-pressed={isRecording} // Indicates if the toggle button is currently pressed (i.e., recording)
        >
          {getRecordButtonLabel()}
        </button>
      </div>
      {/* Display transcription status or error messages */}
      {transcriptionStatus && !deepgramError && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 shrink-0" role="status">{transcriptionStatus}</p>}
      {deepgramError && <p className="text-xs text-red-600 dark:text-red-400 mb-1 shrink-0" role="alert">{deepgramError}</p>}
    </>
  );
};