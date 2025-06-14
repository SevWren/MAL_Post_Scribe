/**
 * @file Defines the BBCodePreview component.
 */
import React, { useState, useEffect } from 'react';
import { parseBBCode } from '../services/bbcodeParser';

/**
 * @interface BBCodePreviewProps
 * Props for the BBCodePreview component.
 * @property {string} rawBBCode - The raw BBCode string to be parsed and previewed.
 */
interface BBCodePreviewProps {
  rawBBCode: string;
}

/**
 * BBCodePreview component.
 * Displays a live HTML preview of the parsed BBCode.
 * @param {BBCodePreviewProps} props - The props for the component.
 * @returns {JSX.Element} The rendered div element containing the HTML preview.
 */
export const BBCodePreview: React.FC<BBCodePreviewProps> = ({ rawBBCode }) => {
  /**
   * State for the HTML content generated from the BBCode.
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [htmlContent, setHtmlContent] = useState<string>('');

  /**
   * Effect to parse the BBCode and update the HTML content
   * whenever the `rawBBCode` prop changes.
   */
  useEffect(() => {
    setHtmlContent(parseBBCode(rawBBCode));
  }, [rawBBCode]);

  return (
    <div
      className="flex-grow p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm overflow-y-auto text-base"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      aria-live="polite" // Announces changes to screen readers
    />
  );
};