---
name: portfolio-agent-defaults
description: 'Token optimization & efficiency rules for all agents working in the portfolio project. Use when: performing code operations, file edits, command execution, or any task-based work.'
---

# Portfolio Project Agent Defaults

## Token Optimization Rules

Apply these rules to reduce token consumption during code operations:

### 1. **Parallel File Operations**

- When reading multiple independent files, batch them in parallel calls
- When making multiple independent edits, use `multi_replace_string_in_file` instead of sequential calls
- Avoid sequential read-then-edit patterns; gather all context first

### 2. **Minimal Context Gathering**

- Read exact line ranges you need (not entire files when possible)
- Use `grep_search` for file-level overviews instead of multiple `read_file` calls
- Use `search_subagent` for codebase exploration when pattern matching is needed
- Don't read files that are unchanged or irrelevant to the task

### 3. **Avoid Repetitive Tool Calls**

- Cache results mentally before making another call
- Combine grep patterns with `|` (alternation) for multi-keyword searches in one call
- Don't re-read files you've already read in the same conversation turn

### 4. **Efficient Terminal Usage**

- Chain shell commands with `&&` when one depends on the other
- Use pipes `|` over temporary files
- Run async commands (`mode=async`) for long operations, then continue with other work
- Don't poll terminals unnecessarily; wait for automatic notifications

### 5. **File Editing**

- Always batch edits: use `multi_replace_string_in_file` for 2+ independent changes
- Include sufficient context (3-5 lines before/after) in `oldString` to avoid ambiguity
- Verify line ranges are correct before reading to avoid re-reads

### 6. **No Unnecessary Documentation**

- Don't create `.md` summary files after every task
- Don't generate detailed explanations when brief confirmation suffices
- Focus responses on completion status, not process descriptions

### 7. **Memory Usage**

- Store repo patterns in `/memories/repo/` (build commands, conventions, file structures)
- Reference session memory only when needed for multi-step tasks
- Keep user memory minimal; avoid storing workspace-specific details there

## Git Next.js Notice

This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.
