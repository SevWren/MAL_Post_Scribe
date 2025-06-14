/**
 * @file Defines the EditorToolbar component.
 * This toolbar provides buttons for inserting common BBCode tags into the editor.
 */
import React from 'react';
import { AiInteractionModal } from './AiInteractionModal';

/**
 * @interface ButtonConfig
 * Configuration for an editor toolbar button.
 * @property {string} label - Text displayed on the button.
 * @property {string} aria - ARIA label for accessibility.
 * @property {'wrap' | 'wrap_prompt' | 'insert' | 'insert_structure' | 'custom_action'} type - The type of action the button performs.
 *   - `wrap`: Wraps selected text or inserts tags around the cursor.
 *   - `wrap_prompt`: Prompts user for input, then wraps selected text or inserts tags with the input.
 *   - `insert`: Inserts a predefined text string.
 *   - `insert_structure`: Inserts a predefined structure, potentially with a cursor placeholder.
 *   - `custom_action`: Performs a custom action defined by the `action` property.
 * @property {string} [openTag] - The opening BBCode tag (for 'wrap', 'wrap_prompt').
 * @property {string} [closeTag] - The closing BBCode tag (for 'wrap', 'wrap_prompt').
 * @property {string} [promptMessage] - Message for the prompt dialog (for 'wrap_prompt').
 * @property {string} [promptDefault] - Default value for the prompt dialog (for 'wrap_prompt').
 * @property {string} [tagPart1] - First part of the opening tag, before prompt value (for 'wrap_prompt').
 * @property {string} [tagPart2] - Second part of the opening tag, after prompt value (for 'wrap_prompt').
 * @property {string} [insertText] - Text to insert (for 'insert').
 * @property {string} [structure] - BBCode structure to insert, may include `%%CURSOR%%` placeholder (for 'insert_structure').
 * @property {boolean} [isBlock] - If true, adds newlines around the inserted/wrapped content if no text is selected.
 * @property {string} [id] - Unique ID for special buttons (e.g., table toggle, AI modal).
 * @property {() => void} [action] - Custom function to execute (for 'custom_action').
 */
interface ButtonConfig {
  label: string;
  aria: string;
  type: 'wrap' | 'wrap_prompt' | 'insert' | 'insert_structure' | 'custom_action';
  
  openTag?: string;
  closeTag?: string;
  
  promptMessage?: string;
  promptDefault?: string;
  tagPart1?: string; 
  tagPart2?: string;

  insertText?: string;
  
  structure?: string; 
  
  isBlock?: boolean; 
  id?: string; 
  action?: () => void;
}

/**
 * Generates the configuration for editor toolbar buttons.
 * @param {() => void} toggleAiModal - Function to toggle the AI Interaction Modal.
 * @returns {ButtonConfig[]} An array of button configurations.
 */
const editorButtonsConfig = (toggleAiModal: () => void): ButtonConfig[] => [
  { label: 'B', aria: 'Bold', type: 'wrap', openTag: '[b]', closeTag: '[/b]' },
  { label: 'I', aria: 'Italic', type: 'wrap', openTag: '[i]', closeTag: '[/i]' },
  { label: 'U', aria: 'Underline', type: 'wrap', openTag: '[u]', closeTag: '[/u]' },
  { label: 'S', aria: 'Strikethrough', type: 'wrap', openTag: '[s]', closeTag: '[/s]' },
  { label: 'Sub', aria: 'Subscript', type: 'wrap', openTag: '[sub]', closeTag: '[/sub]' },
  { label: 'Sup', aria: 'Superscript', type: 'wrap', openTag: '[sup]', closeTag: '[/sup]' },
  
  { label: 'Center', aria: 'Center Align', type: 'wrap', openTag: '[center]', closeTag: '[/center]', isBlock: true },
  { label: 'Right', aria: 'Right Align', type: 'wrap', openTag: '[right]', closeTag: '[/right]', isBlock: true },
  { label: 'Justify', aria: 'Justify Text', type: 'wrap', openTag: '[justify]', closeTag: '[/justify]', isBlock: true },

  { 
    label: 'URL', aria: 'Insert Link', type: 'wrap_prompt', 
    promptMessage: 'Enter URL:', promptDefault: 'https://',
    tagPart1: '[url=', tagPart2: ']', closeTag: '[/url]'
  },
  { 
    label: 'Color', aria: 'Text Color', type: 'wrap_prompt', 
    promptMessage: 'Enter color (e.g., red or #FF0000):', promptDefault: 'red',
    tagPart1: '[color=', tagPart2: ']', closeTag: '[/color]'
  },
  { 
    label: 'Size', aria: 'Text Size', type: 'wrap_prompt', 
    promptMessage: 'Enter size (e.g., 100 for normal, 150 for 150%):', promptDefault: '100',
    tagPart1: '[size=', tagPart2: ']', closeTag: '[/size]' 
  },
  { 
    label: 'Font', aria: 'Font Face', type: 'wrap_prompt', 
    promptMessage: 'Enter font name (e.g., Arial):', promptDefault: 'Arial',
    tagPart1: '[font=', tagPart2: ']', closeTag: '[/font]'
  },

  { label: 'Img', aria: 'Insert Image', type: 'wrap', openTag: '[img]', closeTag: '[/img]' },
  { label: 'YT', aria: 'Insert YouTube Video', type: 'wrap', openTag: '[yt]', closeTag: '[/yt]' },
  
  { label: 'Quote', aria: 'Insert Quote', type: 'wrap', openTag: '[quote]', closeTag: '[/quote]', isBlock: true },
  { label: 'Spoiler', aria: 'Insert Spoiler', type: 'wrap', openTag: '[spoiler]', closeTag: '[/spoiler]', isBlock: true },
  { label: 'Code', aria: 'Insert Code Block', type: 'wrap', openTag: '[code]\n', closeTag: '\n[/code]', isBlock: true },
  { label: 'Pre', aria: 'Insert Preformatted Text', type: 'wrap', openTag: '[pre]\n', closeTag: '\n[/pre]', isBlock: true },
  
  { label: 'HR', aria: 'Insert Horizontal Rule', type: 'insert', insertText: '[hr]', isBlock: true },
  
  { label: 'UL', aria: 'Unordered List', type: 'insert_structure', structure: '[list]\n  [*] %%CURSOR%%\n[/list]', isBlock: true },
  { label: 'OL', aria: 'Ordered List', type: 'insert_structure', structure: '[list=1]\n  [*] %%CURSOR%%\n[/list]', isBlock: true },
  { label: 'Item (*)', aria: 'List Item', type: 'insert', insertText: '[*] ', isBlock: true },
  
  { label: 'Table', aria: 'Insert Table Options', type: 'custom_action', id: 'table_toggle_button', action: () => {} }, // Action handled by specific logic
  { label: 'AI', aria: 'Generate BBCode with AI', type: 'custom_action', id: 'ai_modal_button', action: toggleAiModal },
];

/**
 * @interface EditorToolbarProps
 * Props for the EditorToolbar component.
 * @property {React.RefObject<HTMLTextAreaElement>} editorRef - Ref to the BBCode editor's textarea.
 * @property {React.Dispatch<React.SetStateAction<string>>} setRawBBCode - Function to update the raw BBCode content.
 */
interface EditorToolbarProps {
  editorRef: React.RefObject<HTMLTextAreaElement>;
  setRawBBCode: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * EditorToolbar component.
 * Provides a set of buttons to insert BBCode tags into the editor textarea.
 * @param {EditorToolbarProps} props - The props for the component.
 * @returns {JSX.Element} The rendered toolbar.
 */
export const EditorToolbar: React.FC<EditorToolbarProps> = ({ editorRef, setRawBBCode }) => {
  /**
   * State to control the visibility of table insertion options.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [showTableOptions, setShowTableOptions] = React.useState(false);
  /**
   * State to control the visibility of the AI Interaction Modal.
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isAiModalOpen, setIsAiModalOpen] = React.useState(false);

  /**
   * Toggles the visibility of the AI Interaction Modal.
   */
  const toggleAiModal = () => setIsAiModalOpen(prev => !prev);

  const editorButtons = editorButtonsConfig(toggleAiModal);
  
  /**
   * Handles the insertion of BBCode tags based on the button configuration.
   * Modifies the textarea content and updates the cursor position.
   * @param {ButtonConfig} config - The configuration of the clicked button.
   */
  const handleTagInsertion = (config: ButtonConfig) => {
    const textarea = editorRef.current;
    if (!textarea) return;    

    if (config.id === 'table_toggle_button') {
      setShowTableOptions(prev => !prev);
      return; 
    }
    if (config.type === 'custom_action' && config.action) {
      config.action();
      return;
    }
    
    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    const selectedText = currentValue.substring(start, end);

    let openTag = config.openTag || '';
    let currentCloseTag = config.closeTag || ''; 
    // let textToModify = selectedText; // This variable seems unused, can be removed
    let cursorOffsetWithinInsertion = -1; 

    let contentToInsert = ""; 
    let coreInsertionText = "";

    switch (config.type) {
      case 'wrap':
        coreInsertionText = openTag + selectedText + currentCloseTag;
        if (!selectedText) { // If no text selected, place cursor inside tags
          cursorOffsetWithinInsertion = openTag.length; 
        }
        break;
      case 'wrap_prompt':
        const value = prompt(config.promptMessage!, config.promptDefault || '');
        if (value === null) return; // User cancelled prompt
        openTag = (config.tagPart1 || '') + value + (config.tagPart2 || '');
        coreInsertionText = openTag + selectedText + currentCloseTag;
        if (!selectedText) {
          cursorOffsetWithinInsertion = openTag.length; 
        }
        break;
      case 'insert':
        coreInsertionText = config.insertText!;
        // textToModify = ''; // Not needed as selectedText is used for replacement logic
        cursorOffsetWithinInsertion = coreInsertionText.length; // Place cursor after inserted text
        break;
      case 'insert_structure':
        const structureWithCursor = config.structure!;
        const cursorMarker = '%%CURSOR%%';
        const cursorPosInStructure = structureWithCursor.indexOf(cursorMarker);
        coreInsertionText = structureWithCursor.replace(cursorMarker, '');
        // textToModify = ''; // Not needed
        if (cursorPosInStructure !== -1) {
          cursorOffsetWithinInsertion = cursorPosInStructure; // Place cursor at marker position
        } else {
          cursorOffsetWithinInsertion = coreInsertionText.length; // Fallback: end of structure
        }
        break;
      default:
        return; // Should not happen if types are exhaustive
    }
    
    let prefix = '';
    let suffix = '';

    // Add newlines for block elements if no text is selected
    if (config.isBlock && !selectedText) { 
        // Add newline before if not at start or already on a new line
        prefix = (start === 0 || currentValue[start - 1] === '\n') ? '' : '\n';
        // Add newline after if not at end or already followed by a new line
        suffix = (end === currentValue.length || currentValue[end] === '\n' || currentValue[end] === undefined) ? '' : '\n';
        // Avoid double newlines if the core insertion already ends with one
        if (coreInsertionText.endsWith('\n') && suffix === '\n') {
            suffix = '';
        }
    }
    
    contentToInsert = prefix + coreInsertionText + suffix;
    const replacementStart = start; // Where the new content will be inserted
    
    let finalCursorPosition = -1;

    // Determine cursor position after insertion
    if (selectedText && (config.type === 'wrap' || config.type === 'wrap_prompt')) {
      // For selected text, cursor logic is to select the entire inserted block
    } else if (cursorOffsetWithinInsertion !== -1) {
        // For non-selection insertions, place cursor specifically
        finalCursorPosition = replacementStart + prefix.length + cursorOffsetWithinInsertion;
    }

    // Construct the new text for the textarea
    const newText = 
      currentValue.substring(0, replacementStart) + 
      contentToInsert + 
      currentValue.substring(selectedText ? end : replacementStart); // If text was selected, replace it

    setRawBBCode(newText);

    // Update cursor/selection asynchronously after state update
    requestAnimationFrame(() => {
      if (editorRef.current) {
        if (selectedText && (config.type === 'wrap' || config.type === 'wrap_prompt')) {
           // Select the newly wrapped content
           editorRef.current.setSelectionRange(replacementStart, replacementStart + contentToInsert.length);
        } else if (finalCursorPosition !== -1) {
          // Set specific cursor position
          editorRef.current.setSelectionRange(finalCursorPosition, finalCursorPosition);
        }
        else {
            // Fallback cursor position to the end of the inserted content
            const fallbackCursorPos = replacementStart + contentToInsert.length;
            editorRef.current.setSelectionRange(fallbackCursorPos, fallbackCursorPos);
        }
      }
    });
  };

  /**
   * Generates BBCode for a table with specified rows and columns.
   * Places a `%%CURSOR%%` marker in the first cell for cursor positioning.
   * @param {number} rows - The number of rows for the table.
   * @param {number} cols - The number of columns for the table.
   * @returns {string} The generated BBCode string for the table.
   */
  const generateTableBBCode = (rows: number, cols: number): string => {
    let tableContent = '';
    for (let i = 0; i < rows; i++) {
      tableContent += '  [tr]\n';
      for (let j = 0; j < cols; j++) {
        tableContent += `    [td]${i === 0 && j === 0 ? '%%CURSOR%%' : ''}[/td]\n`;
      }
      tableContent += '  [/tr]\n';
    }
    return `[table]\n${tableContent}[/table]`;
  };

  /**
   * Handles clicks on table dimension options.
   * Generates table BBCode and inserts it using `handleTagInsertion`.
   * @param {number} rows - Selected number of rows.
   * @param {number} cols - Selected number of columns.
   */
  const handleTableOptionClick = (rows: number, cols: number) => {
    const bbcode = generateTableBBCode(rows, cols);
    handleTagInsertion({
      label: `${rows}x${cols} Table`,
      aria: `Insert ${rows}x${cols} Table`,
      type: 'insert_structure',
      structure: bbcode,
      isBlock: true,
    });
    setShowTableOptions(false); // Hide options popup after selection
  };

  return (
    <div className="relative flex items-center space-x-1 flex-wrap gap-y-1">
      {editorButtons.map(btn => (
        <button
          key={btn.label}
          type="button"
          onClick={() => handleTagInsertion(btn)}
          className="px-2.5 py-1 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 transition-colors"
          aria-label={btn.aria}
          title={btn.aria}
        >
          {btn.label}
        </button>
      ))}
      {showTableOptions && (
        <div className="absolute top-full left-0 mt-2 z-20 p-2 bg-white dark:bg-gray-700 shadow-xl rounded-md border border-gray-300 dark:border-gray-600 grid grid-cols-3 gap-1 w-max">
          {[1, 2, 3].map(rows =>
            [1, 2, 3].map(cols => (
              <button
                key={`${rows}x${cols}`}
                onClick={() => handleTableOptionClick(rows, cols)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 dark:text-gray-200 dark:bg-gray-500 dark:hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Insert ${rows} by ${cols} table`}
                title={`Insert ${rows} by ${cols} table`}
              >
                {rows}x{cols}
              </button>
            ))
          )}
        </div>
      )}
      <AiInteractionModal 
        isOpen={isAiModalOpen} 
        onClose={toggleAiModal} 
        // Pass setRawBBCode if AI modal needs to directly insert content.
        // For now, it copies to clipboard.
      />
    </div>
  );
};