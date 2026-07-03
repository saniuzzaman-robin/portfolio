'use client';

import { useState } from 'react';
import { ToolShell, ToolPanel, ToolTextarea, ToolInfo } from '@/components/tools/tool-shell';
import { FileText } from 'lucide-react';

const parseMarkdown = (markdown: string): string => {
  let html = markdown.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  html = html.replace(
    /^### (.*?)$/gm,
    '<h3 class="text-lg font-bold mt-6 mb-3 text-gray-700 dark:text-gray-200">$1</h3>'
  );
  html = html.replace(
    /^## (.*?)$/gm,
    '<h2 class="text-xl font-bold mt-8 mb-4 text-gray-800 dark:text-gray-100">$1</h2>'
  );
  html = html.replace(
    /^# (.*?)$/gm,
    '<h1 class="text-2xl font-bold mt-10 mb-5 text-gray-900 dark:text-white">$1</h1>'
  );

  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-bold text-cyan-600 dark:text-cyan-400">$1</strong>'
  );
  html = html.replace(
    /__([^_]+)__/g,
    '<strong class="font-bold text-cyan-600 dark:text-cyan-400">$1</strong>'
  );

  html = html.replace(
    /\*(.*?)\*/g,
    '<em class="italic text-purple-600 dark:text-purple-300">$1</em>'
  );
  html = html.replace(
    /_([^_]+)_/g,
    '<em class="italic text-purple-600 dark:text-purple-300">$1</em>'
  );

  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-gray-100 dark:bg-gray-800 text-green-700 dark:text-green-400 p-4 rounded overflow-x-auto font-mono my-4 text-sm leading-relaxed border-l-4 border-green-500"><code>$1</code></pre>'
  );

  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-200 dark:bg-gray-700 text-green-700 dark:text-green-400 px-2 py-1 rounded font-mono text-sm">$1</code>'
  );

  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" class="text-blue-500 dark:text-cyan-400 underline cursor-pointer hover:opacity-80 transition-opacity">$1</a>'
  );

  html = html.replace(/^\* (.*?)$/gm, '<li class="ml-6 mb-2">$1</li>');
  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>)/, '<ul class="list-disc my-3 mb-3">$1</ul>');

  html = html.replace(/^\d+\. (.*?)$/gm, '<li class="ml-6 mb-2">$1</li>');
  html = html.replace(/(<li[^>]*>[\s\S]*?<\/li>)/, '<ol class="list-decimal my-3 mb-3">$1</ol>');

  html = html.replace(
    /^&gt; (.*?)$/gm,
    '<blockquote class="border-l-4 border-blue-500 dark:border-blue-400 pl-4 text-gray-600 dark:text-gray-300 my-3 italic bg-blue-50 dark:bg-blue-950/30 p-3">$1</blockquote>'
  );

  html = html.replace(
    /^---$/gm,
    '<hr class="border-none border-t-2 border-gray-300 dark:border-gray-600 my-8" />'
  );

  html = html.replace(/\n\n+/g, '</p><p>');
  html = '<p class="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">' + html + '</p>';
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
              <div
                className="max-w-none space-y-2 text-sm leading-relaxed"
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
