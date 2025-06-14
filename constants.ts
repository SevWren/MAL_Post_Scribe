/**
 * @file Defines constants used throughout the application.
 */

/**
 * Initial BBCode content for the editor when the application loads.
 * This provides a sample to demonstrate various BBCode features.
 * @type {string}
 */
export const initialBBCode = `[b]Edit your BBCode forum post here[/b]

This editor mimics some of the functionality of [url=https://myanimelist.net/forum/]MyAnimeList.net's forum[/url].
Try out various tags:
[list]
[*] [i]Italics[/i] and [u]underlines[/u], [s]Strikethrough[/s] text. Colors: [color=blue]Blue text[/color] or [color=#FF00FF]magenta text[/color]
[*] List Item 2
[center]This text is centered.[/center]
[right]This text is right-aligned.[/right]
[/list]

[quote=SomeUser message=12345]Quote from SomeUser.
Hey (you) [b]nest[/b] what did you mean by that?
[img]https://picsum.photos/seed/quoteimg/150/50[/img]
[/quote]

[spoiler=Secret Content]
This is hidden content inside a spoiler.
Images too:
[img width=200 height=100]https://picsum.photos/seed/spoilerimg/200/100[/img]
And even [url=https://example.com]links[/url]!
[/spoiler]

[b]Image embedding:[/b]
Image: [img]https://picsum.photos/seed/simpleimg/300/150[/img]
Image with specified dimensions (100x100) (Both width & heigh are not required)
[img=100x100]https://picsum.photos/seed/dimsimg/100/100[/img]
Aligned image:
[img align=left width=120 height=80]https://picsum.photos/seed/alignimg/120/80[/img] This text should wrap around the floated image. Clear floats are not automatically handled by this parser, but the image will float. This text will continue after the image if it's long enough. This demonstrates how floated elements interact with surrounding text content.
And some more text to show the wrapping behavior. If this text is short, it might not fully wrap.

[b]YouTube Video:[/b]
[yt]dQw4w9WgXcQ[/yt]

[b]Code and Preformatted Text:[/b]
[code]
function helloWorld() {
  console.log("Hello, BBCode!");
}
// This content is NOT parsed for BBCode.
// For example, [b]this[/b] is not bold.
[/code]
[pre]
This is preformatted text.
  Indentation and    spaces are
preserved. MAL parses BBCode here, but this demo escapes it.
</pre>
[b]Horizontal Rule:[/b]
[hr]
[b]Tables:[/b]
[table]
[tr][td]Header 1[/td][td]Header 2[/td][/tr]
[tr][td]Cell A1[/td][td]Cell A2 with [b]bold[/b] text[/td][/tr]
[tr][td]Cell B1 with a [url=https://example.com]link[/url][/td][td]Cell B2[/td][/tr]
[/table]
Don't forget to mention @CoolUser_123 or @another_user!
This is some text with [sub]subscript[/sub] and [sup]superscript[/sup].
[justify]Block of justified text. Filled 100% width of its container, creating a clean, block-like appearance on both the left and right edges.[/justify]
`;