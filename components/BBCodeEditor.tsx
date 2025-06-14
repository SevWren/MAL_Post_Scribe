/**
 * @file Defines the BBCodeEditor component.
 */
import React from 'react';

/**
 * @interface BBCodeEditorProps
 * Props for the BBCodeEditor component.
 * @property {string} rawBBCode - The current raw BBCode string.
 * @property {(code: string) => void} setRawBBCode - Function to update the raw BBCode string.
 * @property {React.RefObject<HTMLTextAreaElement>} editorRef - Ref to the textarea element for direct manipulation (e.g., by toolbar).
 */
interface BBCodeEditorProps {
  rawBBCode: string;
  setRawBBCode: (code: string) => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
}

/**
 * BBCodeEditor component.
 * Renders a textarea for inputting and editing BBCode.
 * @param {BBCodeEditorProps} props - The props for the component.
 * @returns {JSX.Element} The rendered textarea element.
 */
export const BBCodeEditor: React.FC<BBCodeEditorProps> = ({ rawBBCode, setRawBBCode, editorRef }) => {
  /**
   * Handles changes to the textarea content.
   * @param {React.ChangeEvent<HTMLTextAreaElement>} event - The change event from the textarea.
   */
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawBBCode(event.target.value);
  };

  return (
    <textarea
      ref={editorRef} // Assign the ref here
      value={rawBBCode}
      onChange={handleChange}
      placeholder="Enter BBCode here..."
      className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 resize-none font-mono text-base"
      spellCheck="false"
      aria-label="BBCode Editor Textarea"
    />
  );
};