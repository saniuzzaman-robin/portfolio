---
name: code-operations
description: 'Use when: editing source files, refactoring components, implementing features, or performing code maintenance. Minimizes token usage through batching and parallel operations.'
applyTo: 'src/**/*.{ts,tsx,js,jsx}'
---

# Code Operations - Token Efficient Guidelines

## When Editing Files

1. **Read Once, Edit Once**
   - Don't re-read a file after editing unless the previous edit creates dependencies for the next edit
   - If making 3+ edits, gather all context in one read operation

2. **Batch All Edits Together**
   - Use `multi_replace_string_in_file` for multiple independent changes (2+ edits)
   - Never make sequential individual edits when batch operations work

3. **Read Only What You Need**
   - Don't read the entire file if you only need to check a specific section
   - Use line ranges: `startLine` and `endLine` parameters precisely
   - Search for specific patterns first with `grep_search` to locate sections

## When Searching

1. **Combine Search Patterns**
   - Use regex alternation: `pattern1|pattern2|pattern3` instead of multiple searches
   - Use character classes: `className|classname|ClassName` for case variants

2. **Use Right Tool for Job**
   - `grep_search` for keyword/identifier searches within files
   - `search_subagent` for complex codebase navigation patterns
   - `semantic_search` only if grep patterns don't work

3. **Search Smart, Not Hard**
   - Target specific file patterns with `includePattern`
   - Avoid broad searches (`**/*`) unless absolutely necessary

## When Testing Changes

- Run tests only after all edits are complete, not between each edit
- Chain test commands: `npm run lint && npm run type-check && npm run format:check`
- Use parallel test runners if available (vitest supports this)

## Code Review Efficiency

- Don't explain what you edited; confirm completion with exit code or test results
- Reference changes by file/line only when necessary
- Use linked file references sparingly in responses
