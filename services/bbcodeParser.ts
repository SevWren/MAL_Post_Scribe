/**
 * @file BBCode parsing engine.
 * Converts BBCode strings to HTML, styled to mimic MyAnimeList.net forums.
 */

/**
 * Escapes HTML special characters in a string.
 * @param {string} unsafe - The string to escape.
 * @returns {string} The escaped string.
 */
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * @typedef {object} BBCodeRule
 * Defines a rule for parsing a specific BBCode tag.
 * @property {string} name - The name of the BBCode tag (for debugging/identification).
 * @property {RegExp} regex - The regular expression to match the BBCode tag.
 * @property {(match: RegExpExecArray) => string} replacement - A function that takes the regex match array
 *                                                            and returns the HTML replacement string.
 *                                                            This function may recursively call `parseBBCode` for nested content.
 */
type BBCodeRule = {
  name: string;
  regex: RegExp;
  replacement: (match: RegExpExecArray) => string;
};

/**
 * Parses a BBCode string and converts it to HTML.
 * It applies a set of rules iteratively to transform BBCode tags into corresponding HTML elements.
 * Handles nested BBCode, special tags like [code] and [pre], and final HTML cleanup (e.g., newline handling).
 * @param {string} bbcode - The raw BBCode string to parse.
 * @returns {string} The resulting HTML string.
 */
export const parseBBCode = (bbcode: string): string => {
  let html = bbcode;

  // 0. Normalize line breaks
  html = html.replace(/\r\n?/g, '\n');

  // 1. Tags whose content should NOT be parsed for BBCode (or parsed differently)
  // These are processed first to prevent their content from being altered by other rules.
  html = html.replace(/\[code\]([\s\S]*?)\[\/code\]/gi, (match, content) => {
    return `<pre class="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 my-2 rounded border border-gray-300 dark:border-gray-600 whitespace-pre-wrap font-mono text-base overflow-x-auto"><code class="language-none">${escapeHtml(content.trim())}</code></pre>`;
  });
  html = html.replace(/\[pre\]([\s\S]*?)\[\/pre\]/gi, (match, content) => {
    // MAL's [pre] actually parses BBCode within it. This demo escapes it for simplicity,
    // but if true MAL behavior is needed, the content shouldn't be escaped here but rather
    // recursively parsed, which adds complexity. For now, matching the *provided* request for escaping.
    return `<pre class="bg-gray-100 dark:bg-gray-700 p-3 my-2 rounded border border-gray-300 dark:border-gray-600 whitespace-pre-wrap font-mono text-base">${escapeHtml(content.trim())}</pre>`;
  });
  
  /**
   * Array of BBCode parsing rules.
   * Order can be important, especially for nested tags or tags that might interact.
   * @type {BBCodeRule[]}
   */
  const rules: BBCodeRule[] = [
    {
      name: 'spoiler',
      regex: /\[spoiler(?:=(.*?))?\]([\s\S]*?)\[\/spoiler\]/gi,
      replacement: (match) => {
        const titleText = match[1] ? escapeHtml(match[1].trim()) : '';
        const buttonValue = titleText ? `Show ${titleText}` : 'Show Spoiler';
        // Note: Inline JavaScript for simplicity in this context.
        // For more complex applications, consider event delegation.
        const onclickJs = "this.nextSibling.style.display='inline-block';this.style.display='none';";
        
        const spoilerDivStart = `<div class="spoiler my-2 p-1 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">`;
        const buttonHtml = `<input type="button" class="button show_button bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded cursor-pointer text-sm my-1 mx-1" value="${buttonValue}" onclick="${onclickJs}">`;
        const contentSpan = `<span class="spoiler_content block p-2 my-1 mx-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded" style="display:none;">${parseBBCode(match[2])}</span>`;
        const spoilerDivEnd = `</div>`;
        
        return spoilerDivStart + buttonHtml + contentSpan + spoilerDivEnd;
      }
    },
    {
      name: 'img',
      regex: /\[img(?: width=(\d+))?(?: height=(\d+))?(?:=(\d+)x(\d+))?(?: align=(left|right))?(?: alt="(.*?)")?(?: title="(.*?)")?\](.*?)\[\/img\]/gi,
      replacement: (match) => {
          const src = match[8] ? match[8].trim() : '';
          // Basic validation for image source
          if (!src || src.toLowerCase() === 'http://' || src.toLowerCase() === 'https://') return '[Invalid Image]';

          let styles: string[] = [];
          const width1 = match[1];
          const height1 = match[2];
          const width2 = match[3]; // For [img=WxH]
          const height2 = match[4]; // For [img=WxH]
          const align = match[5];
          const alt = match[6] || '';
          const title = match[7] || '';

          const finalWidth = width1 || width2;
          const finalHeight = height1 || height2;

          if (finalWidth) styles.push(`width: ${finalWidth}px`);
          if (finalHeight) styles.push(`height: ${finalHeight}px`);
          
          let alignClasses = "inline-block"; // Default behavior
          if (align === 'left') {
            styles.push('float: left;'); // Style for float
            alignClasses = "mr-2 mb-1 "; // Margin utility classes
          } else if (align === 'right') {
            styles.push('float: right;');
            alignClasses = "ml-2 mb-1 ";
          }
          
          return `<img src="${escapeHtml(src)}" class="userimg max-w-full h-auto my-1 border border-gray-300 dark:border-gray-600 shadow-sm ${alignClasses}" style="${styles.join('; ')}" alt="${escapeHtml(alt)}" title="${escapeHtml(title)}" />`;
      }
    },
    {
      name: 'url',
      regex: /\[url(?:=(.*?))?\]([\s\S]*?)\[\/url\]/gi,
      replacement: (match) => {
        let href = match[1] ? match[1].trim() : match[2].trim(); // URL can be in param or content
        let textContent = match[1] ? match[2] : href; // If URL is param, content is text; else, content is URL and text

        // Add protocol if missing for external links
        if (!href.match(/^(?:[a-z]+:)?\/\//i) && !href.startsWith('/') && !href.startsWith('#') && !href.startsWith('mailto:')) {
            href = 'http://' + href;
        }
        
        return `<a href="${escapeHtml(href)}" target="_blank" rel="nofollow noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">${parseBBCode(textContent)}</a>`;
      }
    },
    {
      name: 'yt', // YouTube embed
      regex: /\[yt\]([a-zA-Z0-9_-]{11})\[\/yt\]/gi, // Matches typical YouTube video ID
      replacement: (match) => {
        return `<div class="my-2 aspect-video max-w-xl mx-auto shadow-lg rounded overflow-hidden"><iframe class="w-full h-full" src="https://www.youtube.com/embed/${match[1]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
      }
    },
    // Internal placeholder for list items, used by [list] and [list=1] rules.
    // This allows list items to be parsed for BBCode *after* the list structure is set up.
    { 
        name: 'list_item_placeholder_internal',
        regex: /%%LIST_ITEM_PLACEHOLDER%%([\s\S]*?)(?=%%LIST_ITEM_PLACEHOLDER%%|<\/(?:ul|ol)>|$)/gi, // Matches content until next item or end of list
        replacement: (match) => {
            return `<li class="py-0.5">${parseBBCode(match[1].trim())}</li>`;
        }
    },
    {
        name: 'ulist', // Unordered list
        regex: /\[list\]([\s\S]*?)\[\/list\]/gi,
        replacement: (match) => {
            // Replace [*] with a placeholder, then parse. Placeholder helps manage nested parsing.
            let content = match[1].replace(/\[\*\]/gi, '%%LIST_ITEM_PLACEHOLDER%%');
            // Remove leading/trailing placeholders that might result from empty lines or initial/final [*]
            content = content.replace(/^(?:%%LIST_ITEM_PLACEHOLDER%%)+|(?:%%LIST_ITEM_PLACEHOLDER%%)+$/g, '');
            return `<ul class="list-disc list-inside my-2 p-2 pl-6 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">${parseBBCode(content)}</ul>`;
        }
    },
    {
        name: 'olist', // Ordered list
        regex: /\[list=1\]([\s\S]*?)\[\/list\]/gi,
        replacement: (match) => {
            let content = match[1].replace(/\[\*\]/gi, '%%LIST_ITEM_PLACEHOLDER%%');
            content = content.replace(/^(?:%%LIST_ITEM_PLACEHOLDER%%)+|(?:%%LIST_ITEM_PLACEHOLDER%%)+$/g, '');
            return `<ol class="list-decimal list-inside my-2 p-2 pl-6 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">${parseBBCode(content)}</ol>`;
        }
    },
    {
      name: 'quote',
      regex: /\[quote(?:=(?:"([^"]+)"|([^\s\]]+)))?(?:\s+message=(\d+))?\]([\s\S]*?)\[\/quote\]/gi,
      replacement: (match) => {
        const authorQuoted = match[1]; // Author in double quotes
        const authorUnquoted = match[2]; // Author without quotes
        const author = authorQuoted || authorUnquoted;
        // const messageId = match[3]; // Message ID, currently unused in output
        const header = author ? `<div class="font-semibold text-base text-gray-700 dark:text-gray-300 mb-1">${escapeHtml(author.trim())} wrote:</div>` : '';
        return `<blockquote class="border-l-4 border-gray-400 dark:border-gray-500 pl-4 pr-2 py-2 my-2 bg-gray-100 dark:bg-gray-800 rounded-r shadow-sm">${header}<div class="italic text-gray-800 dark:text-gray-200">${parseBBCode(match[4])}</div></blockquote>`;
      }
    },
    // Table tags
    {
        name: 'table',
        regex: /\[table\]([\s\S]*?)\[\/table\]/gi,
        replacement: (match) => `<table class="border-collapse border border-gray-300 dark:border-gray-600 my-2 w-full bg-white dark:bg-gray-800 shadow text-base">${parseBBCode(match[1])}</table>`
    },
    {
        name: 'tr', // Table row
        regex: /\[tr\]([\s\S]*?)\[\/tr\]/gi,
        replacement: (match) => `<tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">${parseBBCode(match[1])}</tr>`
    },
    { 
        name: 'td', // Table cell
        regex: /\[td\]([\s\S]*?)\[\/td\]/gi,
        replacement: (match) => `<td class="border border-gray-200 dark:border-gray-600 p-2">${parseBBCode(match[1])}</td>`
    },
    // Simple formatting tags
    { name: 'b', regex: /\[b\]([\s\S]*?)\[\/b\]/gi, replacement: (match) => `<strong class="font-bold">${parseBBCode(match[1])}</strong>` },
    { name: 'u', regex: /\[u\]([\s\S]*?)\[\/u\]/gi, replacement: (match) => `<span class="underline">${parseBBCode(match[1])}</span>` },
    { name: 'i', regex: /\[i\]([\s\S]*?)\[\/i\]/gi, replacement: (match) => `<em class="italic">${parseBBCode(match[1])}</em>` },
    { name: 's', regex: /\[s\]([\s\S]*?)\[\/s\]/gi, replacement: (match) => `<span class="line-through">${parseBBCode(match[1])}</span>` },
    { name: 'size', regex: /\[size=(\d{1,3})\]([\s\S]*?)\[\/size\]/gi, replacement: (match) => `<span style="font-size: ${Math.min(Math.max(parseInt(match[1]), 50), 300)}%;">${parseBBCode(match[2])}</span>` }, // MAL size is %
    { name: 'color', regex: /\[color=([a-zA-Z0-9#_()-]+)\]([\s\S]*?)\[\/color\]/gi, replacement: (match) => `<span style="color: ${escapeHtml(match[1])};">${parseBBCode(match[2])}</span>` },
    { name: 'font', regex: /\[font=([ \w\s,-]+)\]([\s\S]*?)\[\/font\]/gi, replacement: (match) => `<span style="font-family: ${escapeHtml(match[1].replace(/'/g, "\\'"))};">${parseBBCode(match[2])}</span>` }, // Escape single quotes in font names
    // Alignment tags
    { name: 'center', regex: /\[center\]([\s\S]*?)\[\/center\]/gi, replacement: (match) => `<div class="text-center">${parseBBCode(match[1])}</div>` },
    { name: 'right', regex: /\[right\]([\s\S]*?)\[\/right\]/gi, replacement: (match) => `<div class="text-right">${parseBBCode(match[1])}</div>` },
    { name: 'justify', regex: /\[justify\]([\s\S]*?)\[\/justify\]/gi, replacement: (match) => `<div class="text-justify">${parseBBCode(match[1])}</div>` },
    // Subscript and Superscript
    { name: 'sub', regex: /\[sub\]([\s\S]*?)\[\/sub\]/gi, replacement: (match) => `<sub>${parseBBCode(match[1])}</sub>` },
    { name: 'sup', regex: /\[sup\]([\s\S]*?)\[\/sup\]/gi, replacement: (match) => `<sup>${parseBBCode(match[1])}</sup>` },
    // Horizontal rule
    { name: 'hr', regex: /\[hr\]/gi, replacement: () => `<hr class="my-4 border-gray-300 dark:border-gray-600">` },
  ];

  // Iterative parsing: Apply rules repeatedly until no more changes occur or max passes reached.
  // This helps handle nested BBCode correctly.
  const MAX_PASSES = 15; // Safeguard against infinite loops with complex/bad BBCode
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let changedInPass = false;
    const currentHtml = html; // Store HTML state before this pass's rule applications
    for (const rule of rules) {
      if (rule.regex.test(html)) { // Optimization: only replace if regex matches
        html = html.replace(rule.regex, (...args) => {
          // Reconstruct a RegExpExecArray-like object for the replacement function.
          // The 'args' array from replace includes: fullMatch, capGroup1, ..., capGroupN, offset, string
          const execArrayLike = args.slice(0, -2); // Matches and capturing groups
          (execArrayLike as any).index = args[args.length - 2]; // offset
          (execArrayLike as any).input = args[args.length - 1]; // original string
          
          const replacementResult = rule.replacement(execArrayLike as unknown as RegExpExecArray);
          return replacementResult;
        });
      }
    }
    // Check if any changes were made in this pass
    if (html === currentHtml && pass > 0) { // If no changes and not the first pass
        changedInPass = false; // Ensure it's marked as false
        break; // Exit loop if HTML is stable
    } else if (html !== currentHtml) {
        changedInPass = true;
    }
    if (!changedInPass && pass > 0) break; // If no changes were made in this pass (and not first pass), exit
  }
  
  // Clean up any remaining list item placeholders (e.g., if list was empty or malformed)
  html = html.replace(/%%LIST_ITEM_PLACEHOLDER%%/g, ''); 

  // User mentions (simple version, does not link to profiles)
  // Matches @username not inside an HTML tag or already part of a link.
  html = html.replace(/(^|[\s>([])@([a-zA-Z0-9_]{2,30})(?![^<]*>|[^<>]*<\/a>)/g, (match, prefix, username) => {
    return `${prefix}<span class="text-blue-500 dark:text-blue-400 font-semibold hover:underline cursor-pointer">@${username}</span>`;
  });

  // Final newline and <br /> processing.
  // This aims to replicate typical forum behavior where newlines are meaningful,
  // but not excessively so around block elements.
  // Define block-level tags that our parser generates or commonly appear.
  const blockTagNames = 'pre|div|ul|ol|li|blockquote|table|tr|td|hr';
  const openingBlockTagPattern = `(<(?:${blockTagNames})(?:\\s[^>]*?)?>)`; // Matches <tag> or <tag attrs>
  const closingBlockTagPattern = `(<\/(?:${blockTagNames})>)`; // Matches </tag>

  // 1. Convert all raw newlines (that survived BBCode parsing) to <br />
  html = html.replace(/\n/g, '<br />');

  // 2. Remove <br /> if it's immediately before an opening block tag.
  //    Example: ...text<br /><div>...  => ...text<div>...
  html = html.replace(new RegExp(`<br \\/>(?=${openingBlockTagPattern})`, 'gi'), '');

  // 3. Remove <br /> if it's immediately after a closing block tag.
  //    Example: ...</div><br />text... => ...</div>text...
  html = html.replace(new RegExp(`${closingBlockTagPattern}<br \\/>`, 'gi'), '$1');
  
  // 4. Remove <br /> if it's the only content of a block tag we generate
  //    (often from a newline inside an otherwise empty BBCode block, e.g., [center]\n[/center]).
  //    Example: <div class="text-center"><br /></div> -> <div class="text-center"></div>
  html = html.replace(new RegExp(`(${openingBlockTagPattern})<br \\/>(${closingBlockTagPattern})`, 'gi'), '$1$2');
  
  return html;
};