'use client';

import { useState } from 'react';
import { ToolShell, ToolPanel, ToolTextarea, ToolInfo } from '@/components/tools/tool-shell';
import { FileText } from 'lucide-react';

const parseMarkdown = (markdown: string): string => {
  let html = markdown.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  html = html.replace(
    /^### (.*?)$/gm,
    '<h3 style="font-size: 1.25rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 0.75rem; color: var(--md-heading-3);">$1</h3>'
  );
  html = html.replace(
    /^## (.*?)$/gm,
    '<h2 style="font-size: 1.5rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem; color: var(--md-heading-2);">$1</h2>'
  );
  html = html.replace(
    /^# (.*?)$/gm,
    '<h1 style="font-size: 2rem; font-weight: bold; margin-top: 2.5rem; margin-bottom: 1.25rem; color: var(--md-heading-1);">$1</h1>'
  );

  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong style="font-weight: bold; color: var(--md-strong);">$1</strong>'
  );
  html = html.replace(
    /__([^_]+)__/g,
    '<strong style="font-weight: bold; color: var(--md-strong);">$1</strong>'
  );

  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: var(--md-em);">$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em style="font-style: italic; color: var(--md-em);">$1</em>');

  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre style="background: var(--md-code-bg); color: var(--md-code-color); padding: 1rem; border-radius: 0.375rem; overflow-x: auto; font-family: monospace; margin-top: 1rem; margin-bottom: 1rem; font-size: 0.875rem; line-height: 1.5; border-left: 3px solid var(--md-code-border);"><code>$1</code></pre>'
  );

  html = html.replace(
    /`([^`]+)`/g,
    '<code style="background: var(--md-inline-code-bg); color: var(--md-code-color); padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875em;">$1</code>'
  );

  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" style="color: var(--md-link); text-decoration: underline; cursor: pointer; transition: color 0.2s;">$1</a>'
  );

  html = html.replace(
    /^\* (.*?)$/gm,
    '<li style="margin-left: 1.5rem; margin-bottom: 0.5rem;">$1</li>'
  );
  html = html.replace(
    /(<li[^>]*>[\s\S]*?<\/li>)/,
    '<ul style="list-style: disc; margin-top: 0.75rem; margin-bottom: 0.75rem;">$1</ul>'
  );

  html = html.replace(
    /^\d+\. (.*?)$/gm,
    '<li style="margin-left: 1.5rem; margin-bottom: 0.5rem;">$1</li>'
  );
  html = html.replace(
    /(<li[^>]*>[\s\S]*?<\/li>)/,
    '<ol style="list-style: decimal; margin-top: 0.75rem; margin-bottom: 0.75rem;">$1</ol>'
  );

  html = html.replace(
    /^&gt; (.*?)$/gm,
    '<blockquote style="border-left: 4px solid var(--md-blockquote-border); padding-left: 1rem; color: var(--md-blockquote-text); margin-top: 0.75rem; margin-bottom: 0.75rem; font-style: italic; background: var(--md-blockquote-bg); padding: 0.75rem 1rem;">$1</blockquote>'
  );

  html = html.replace(
    /^---$/gm,
    '<hr style="border: none; border-top: 2px solid var(--md-hr); margin-top: 2rem; margin-bottom: 2rem;" />'
  );

  html = html.replace(/\n\n+/g, '</p><p>');
  html =
    '<p style="margin-bottom: 1rem; line-height: 1.6; color: var(--md-text);">' + html + '</p>';
  html = html.replace(/<p><\/p>/g, '');

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
      <ToolShell
        title="Markdown Preview"
        subtitle="Live Editor & Renderer"
        description="Write Markdown and see a live HTML preview. Perfect for documentation, README files, and blog posts."
        icon={FileText}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ToolPanel label="Markdown Editor">
            <ToolTextarea
              value={markdown}
              onChange={setMarkdown}
              placeholder="Enter markdown here…"
              rows={20}
            />
          </ToolPanel>

          <ToolPanel label="Live Preview">
            <div className="p-4">
              <style>{`
                .markdown-preview {
                  --md-text: #374151;
                  --md-heading-1: #111827;
                  --md-heading-2: #1f2937;
                  --md-heading-3: #374151;
                  --md-strong: #0891b2;
                  --md-em: #7c3aed;
                  --md-code-bg: #f3f4f6;
                  --md-code-color: #065f46;
                  --md-code-border: #10b981;
                  --md-inline-code-bg: #e5e7eb;
                  --md-link: #0ea5e9;
                  --md-blockquote-text: #4b5563;
                  --md-blockquote-bg: rgba(14, 165, 233, 0.05);
                  --md-blockquote-border: #0ea5e9;
                  --md-hr: #d1d5db;
                }
                .dark .markdown-preview {
                  --md-text: #d1d5db;
                  --md-heading-1: #ffffff;
                  --md-heading-2: #f3f4f6;
                  --md-heading-3: #e5e7eb;
                  --md-strong: #06b6d4;
                  --md-em: #c084fc;
                  --md-code-bg: #1f2937;
                  --md-code-color: #10b981;
                  --md-code-border: #10b981;
                  --md-inline-code-bg: #2d3748;
                  --md-link: #06b6d4;
                  --md-blockquote-text: #cbd5e1;
                  --md-blockquote-bg: rgba(6, 182, 212, 0.05);
                  --md-blockquote-border: #0891b2;
                  --md-hr: #374151;
                }
              `}</style>
              <div
                className="markdown-preview prose prose-invert text-midnight-950 dark:prose-invert max-w-none space-y-2 text-sm leading-relaxed wrap-break-word"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </ToolPanel>
        </div>

        <ToolInfo title="Supported Markdown">
          <ul className="text-midnight-950 list-inside list-disc space-y-1">
            <li># Headings (h1-h3)</li>
            <li>**bold** and *italic* text</li>
            <li>`inline code` and code blocks</li>
            <li>[Links](url)</li>
            <li>- Lists and 1. Numbered lists</li>
            <li>&gt; Blockquotes</li>
            <li>--- Horizontal rules</li>
          </ul>
        </ToolInfo>
      </ToolShell>
    </>
  );
}
