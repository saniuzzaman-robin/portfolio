/** Starting document: shows off the syntax the preview supports. */
export const SAMPLE = `# Project name

A short description of what this does and **why** it exists. Everything here renders
live, and the preview scrolls along with the editor.

## Features

- CommonMark with *emphasis*, **strong**, ~~strikethrough~~ and \`inline code\`
- GitHub-style tables and task lists
- Raw <kbd>HTML</kbd>, sanitized before it is shown
- Links like https://example.com turn into links automatically

## Getting started

\`\`\`bash
npm install
npm run dev
\`\`\`

1. Clone the repository
2. Install the dependencies
3. Start the dev server

## Roadmap

- [x] Parser
- [x] Preview
- [ ] Plugins

| Option  | Default | Description            |
| :------ | :-----: | ---------------------: |
| \`html\`  | \`true\`  | Allow raw HTML         |
| \`breaks\`| \`false\` | Newlines become \`<br>\` |

> **Note**
> Remote images such as ![badge](https://img.shields.io/badge/build-passing-green) are not
> loaded in this preview, but they are kept in the exported HTML.

---

Made with Markdown.
`;
