---
name: config-files
description: 'Use when: editing configuration files (tsconfig, eslint, prettier, next.config, etc.). Optimizes for minimal re-reads of config files.'
applyTo: '*.config.* | tsconfig.json | .eslintrc* | .prettierrc* | tailwind.config.*'
---

# Configuration Files - Token Efficient Guidelines

## Before Editing Config

1. **Batch All Changes**
   - Read the entire config file once
   - Plan all changes before making edits
   - Use `multi_replace_string_in_file` for multiple changes

2. **Validate After Edits Only**
   - Don't read the file immediately after editing to verify
   - Trust the tool output; it confirms success
   - Only re-read if the next change depends on previous change results

## Config-Specific Rules

### For `package.json`

- Read entire file once (it's small)
- Don't read again unless a previous edit requires confirmation of side effects
- Batch all script/dependency updates together

### For TypeScript/Eslint/Prettier Configs

- Small files: read entire file
- Don't verify after minor edits
- Batch related config changes in one operation

### For Next.js/Tailwind Configs

- These can be large; read only necessary sections with line ranges
- Use `grep_search` to find specific config sections before reading
