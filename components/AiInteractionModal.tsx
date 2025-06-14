/**
 * @file Defines the AiInteractionModal component.
 * This modal allows users to interact with AI (Gemini for BBCode generation)
 * and use speech-to-text (Deepgram) for inputting prompts.
 */
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { useGeminiApiKey } from './hooks/useGeminiApiKey';
import { GeminiApiKeySection } from './GeminiApiKeySection';
import { useDeepgramTranscription } from './hooks/useDeepgramTranscription';
import { SpeechToTextControls } from './SpeechToTextControls';

/**
 * @interface AiInteractionModalProps
 * Props for the AiInteractionModal component.
 * @property {boolean} isOpen - Whether the modal is currently open.
 * @property {() => void} onClose - Function to call to close the modal.
 */
interface AiInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * System instruction provided to the Gemini AI model.
 * Guides the AI to generate content formatted strictly using MyAnimeList forum BBCode.
 * @type {string}
 */
const AI_SYSTEM_INSTRUCTION = `You are an assistant that generates content formatted using MyAnimeList forum BBCode. Ensure your output strictly adheres to this BBCode format. Supported tags are:
[b]text[/b] (bold)
[i]text[/i] (italic)
[u]text[/u] (underline)
[s]text[/s] (strikethrough)
[sub]text[/sub] (subscript)
[sup]text[/sup] (superscript)
[center]text[/center] (center align)
[right]text[/right] (right align)
[justify]text[/justify] (justify align)
[url=https://example.com]link text[/url] or [url]https://example.com[/url]
[color=red]text[/color] or [color=#FF0000]text[/color]
[size=100]text[/size] (percentage, e.g., 50 to 300)
[font=Arial]text[/font]
[img width=W height=H align=X alt=Y title=Z]image_url[/img] (width, height, align, alt, title are optional; format can also be [img=WxH]url[/img])
[yt]YouTubeVideoID[/yt]
[quote=Username message=123]text[/quote] or [quote]text[/quote]
[spoiler=Title]content[/spoiler] or [spoiler]content[/spoiler]
[code]
raw code
[/code]
[pre]
preformatted text
[/pre]
[hr] (horizontal rule)
[list]
[*] item1
[*] item2
[/list] (unordered list)
[list=1]
[*] item1
[*] item2
[/list] (ordered list)
[table]
  [tr]
    [td]cell1[/td]
    [td]cell2[/td]
  [/tr]
  [tr]
    [td]cell3[/td]
    [td]cell4[/td]
  [/tr]
[/table]
Do not use any other HTML or markdown. Only use the BBCode tags listed above. Your response should be directly usable as BBCode.`;

/**
 * AiInteractionModal component.
 * Provides a UI for generating BBCode using Gemini AI and inputting prompts via text or speech-to-text.
 * Manages API key input for Gemini, interaction with Deepgram for transcription, and displays AI responses.
 * @param {AiInteractionModalProps} props - The props for the component.
 * @returns {JSX.Element | null} The rendered modal or null if not open.
 */
export const AiInteractionModal: React.FC<AiInteractionModalProps> = ({ isOpen, onClose }) => {
  /**
   * State for the user's prompt to the AI.
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [userPrompt, setUserPrompt] = useState('');
  /**
   * State for the AI's generated BBCode response.
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [aiResponse, setAiResponse] = useState('');
  /**
   * State indicating if the Gemini AI is currently processing a request.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isLoading, setIsLoading] = useState(false);
  /**
   * State for storing error messages from the Gemini AI API.
   * @type {[string | null, React.Dispatch<React.SetStateAction<string | null>>]}
   */
  const [geminiError, setGeminiError] = useState<string | null>(null);

  /**
   * Hook for managing Gemini API key state and interactions.
   */
  const apiKeyState = useGeminiApiKey();
  const { userApiKey, isApiKeySet, setShowApiKeyInput } = apiKeyState;

  /**
   * Callback to handle received transcripts from Deepgram.
   * Appends the transcript to the existing user prompt.
   * @param {string} transcript - The transcribed text from speech.
   */
  const handleTranscriptReceived = (transcript: string) => {
    setUserPrompt(prev => (prev.trim() ? prev.trim() + " " : "") + transcript + " ");
  };

  /**
   * Hook for managing Deepgram speech-to-text transcription state and interactions.
   */
  const transcriptionState = useDeepgramTranscription({
    isOpen,
    onTranscriptReceived: handleTranscriptReceived,
  });
  const { isRecording, isTranscribing } = transcriptionState;

  /**
   * Effect to reset modal-specific states when the modal is closed.
   */
  useEffect(() => {
    if (!isOpen) {
      setUserPrompt('');
      setAiResponse('');
      setIsLoading(false);
      setGeminiError(null);
      // Deepgram states are reset internally by its hook based on `isOpen`
    }
  }, [isOpen]);

  /**
   * Handles the submission of the user's prompt to the Gemini AI.
   * Validates the prompt and API key, then makes an API call.
   * Updates state with the AI response or an error message.
   * @async
   */
  const handleSubmitPrompt = async () => {
    if (!userPrompt.trim()) {
      setGeminiError("Prompt cannot be empty.");
      return;
    }
    
    const effectiveApiKey = process.env.API_KEY || userApiKey;
    if (!effectiveApiKey) {
      setGeminiError("Gemini API Key is not set. Please set your API key.");
      setShowApiKeyInput(true);
      return;
    }

    setIsLoading(true);
    setGeminiError(null);
    setAiResponse('');

    try {
      const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: userPrompt,
        config: {
          systemInstruction: AI_SYSTEM_INSTRUCTION,
        }
      });
      setAiResponse(response.text);
    } catch (e: any) {
      console.error("Gemini API Error:", e);
      setGeminiError(e.message || "An error occurred while fetching the AI response. Check your API key and network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles copying the AI's response to the clipboard and closing the modal.
   * @async
   */
  const handleCopyAndClose = async () => {
    if (!aiResponse) return;
    try {
      await navigator.clipboard.writeText(aiResponse);
      onClose();
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setGeminiError("Failed to copy text to clipboard.");
    }
  };
  
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 id="ai-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100">AI BBCode Generator</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
            aria-label="Close AI modal"
          >
            &times;
          </button>
        </div>

        <GeminiApiKeySection apiKeyState={apiKeyState} onApiKeySaved={() => alert("Gemini API Key saved successfully!")} />
        
        <div className="mb-4 flex-grow flex flex-col min-h-0"> {/* User Prompt Area */}
          <SpeechToTextControls transcriptionState={transcriptionState} isGeminiLoading={isLoading} />
          
          <textarea
            id="ai-user-prompt"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="e.g., Write a short review for an anime, include a spoiler section..."
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-base min-h-[80px] md:min-h-[100px] resize-y flex-grow"
            rows={3} // Initial rows, textarea is resizable
            disabled={isLoading || isRecording || isTranscribing}
            aria-label="User prompt for AI BBCode generation"
          />
          <button
            onClick={handleSubmitPrompt}
            disabled={isLoading || !userPrompt.trim() || isRecording || isTranscribing || !isApiKeySet}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors shrink-0"
          >
            {isLoading ? 'Generating BBCode...' : 'Submit Prompt to AI'}
          </button>
        </div>

        {geminiError && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-100 rounded-md text-sm shrink-0">
            <p role="alert">Gemini AI Error: {geminiError}</p>
          </div>
        )}

        <div className="mb-4 flex-grow flex flex-col min-h-0 overflow-auto"> {/* AI Response Area */}
          <label htmlFor="ai-response-area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 shrink-0">
            AI Generated BBCode:
          </label>
          <textarea
            id="ai-response-area"
            value={aiResponse}
            readOnly
            placeholder="AI response will appear here..."
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:text-gray-100 text-base min-h-[120px] md:min-h-[150px] resize-y flex-grow"
            aria-live="polite"
            aria-label="AI generated BBCode response"
          />
        </div>

        <button
          onClick={handleCopyAndClose}
          disabled={!aiResponse || isLoading}
          className="mt-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors shrink-0"
        >
          Copy AI Text & Close
        </button>
      </div>
    </div>
  );
};