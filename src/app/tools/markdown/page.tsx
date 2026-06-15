'use client';

import { useState } from 'react';
import { Navigation } from '@/components/sections/navigation';
import { ToolShell, ToolPanel, ToolTextarea } from '@/components/tools/tool-shell';
import { FileText } from 'lucide-react';

// Simple markdown parser
const parseMarkdown = (markdown: string): string => {
  let html = markdown
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(
    /^### (.*?)$/gm,
    '<h3 style="font-size: 1.25rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #e5e7eb;">$1</h3>'
  );
  html = html.replace(
    /^## (.*?)$/gm,
    '<h2 style="font-size: 1.5rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; color: #f3f4f6;">$1</h2>'
  );
  html = html.replace(
    /^# (.*?)$/gm,
    '<h1 style="font-size: 2rem; font-weight: bold; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #ffffff;">$1</h1>'
  );

  // Bold
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong style="font-weight: bold; color: #f0f9ff;">$1</strong>'
  );
  html = html.replace(
    /__([^_]+)__/g,
    '<strong style="font-weight: bold; color: #f0f9ff;">$1</strong>'
  );

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #e0e7ff;">$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em style="font-style: italic; color: #e0e7ff;">$1</em>');

  // Code blocks
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre style="background: #1f2937; color: #10b981; padding: 1rem; border-radius: 0.375rem; overflow-x: auto; font-family: monospace; margin-top: 1rem; margin-bottom: 1rem; font-size: 0.875rem; line-height: 1.5; border-left: 3px solid #10b981;"><code>$1</code></pre>'
  );

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code style="background: #2d3748; color: #10b981; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em;">$1</code>'
  );

  // Links
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" style="color: #06b6d4; text-decoration: underline; cursor: pointer; transition: color 0.2s;">$1</a>'
  );

  // Unordered lists
  html = html.replace(
    /^\* (.*?)$/gm,
    '<li style="margin-left: 1.5rem; margin-bottom: 0.5rem;">$1</li>'
  );
  html = html.replace(
    /(<li[^>]*>[\s\S]*?<\/li>)/,
    '<ul style="list-style: disc; margin-top: 0.75rem; margin-bottom: 0.75rem;">$1</ul>'
  );

  // Ordered lists
  html = html.replace(
    /^\d+\. (.*?)$/gm,
    '<li style="margin-left: 1.5rem; margin-bottom: 0.5rem;">$1</li>'
  );
  html = html.replace(
    /(<li[^>]*>[\s\S]*?<\/li>)/,
    '<ol style="list-style: decimal; margin-top: 0.75rem; margin-bottom: 0.75rem;">$1</ol>'
  );

  // Blockquotes
  html = html.replace(
    /^&gt; (.*?)$/gm,
    '<blockquote style="border-left: 4px solid #0891b2; padding-left: 1rem; color: #cbd5e1; margin-top: 0.75rem; margin-bottom: 0.75rem; font-style: italic; background: rgba(6, 182, 212, 0.05); padding: 0.75rem 1rem;">$1</blockquote>'
  );

  // Horizontal rule
  html = html.replace(
    /^---$/gm,
    '<hr style="border: none; border-top: 2px solid #374151; margin-top: 2rem; margin-bottom: 2rem;" />'
  );

  // Paragraphs with proper spacing
  html = html.replace(/\n\n+/g, '</p><p>');
  html = '<p style="margin-bottom: 1rem; line-height: 1.6;">' + html + '</p>';
  html = html.replace(/<p><\/p>/g, ''); // Remove empty paragraphs

  return html;
};

export default function MarkdownPage() {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Preview

## Features

- **Live preview** as you type
- Support for *italic*, **bold**, and \`inline code\`
- [Links](https://example.com)

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

> This is a blockquote

---

### More Info

Just start typing in the editor to see the preview update instantly.
`);

  const html = parseMarkdown(markdown);

  return (
    <>
      <Navigation />
      <ToolShell
        title="Markdown Preview"
        subtitle="Live Editor & Renderer"
        description="Write Markdown and see a live HTML preview. Perfect for documentation, README files, and blog posts."
        icon={FileText}
        accent="tertiary"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ToolPanel label="Markdown Editor" accent="tertiary">
            <ToolTextarea
              value={markdown}
              onChange={setMarkdown}
              placeholder="Enter markdown here…"
              rows={20}
              accent="tertiary"
            />
          </ToolPanel>

          <ToolPanel label="Live Preview" accent="tertiary">
            <div className="p-4">
              <div
                className="prose prose-invert text-neutral-80 max-w-none space-y-2 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: html }}
                style={{ wordBreak: 'break-word' }}
              />
            </div>
          </ToolPanel>
        </div>

        <div className="bg-neutral-10 text-neutral-70 mt-6 rounded-sm p-4 text-xs">
          <p className="mb-2 font-semibold">Supported Markdown:</p>
          <ul className="list-inside list-disc space-y-1">
            <li># Headings (h1-h3)</li>
            <li>**bold** and *italic* text</li>
            <li>`inline code` and code blocks</li>
            <li>[Links](url)</li>
            <li>- Lists and 1. Numbered lists</li>
            <li>&gt; Blockquotes</li>
            <li>--- Horizontal rules</li>
          </ul>
        </div>
      </ToolShell>
    </>
  );
}
