# Pre-Implementation Test Findings for Issue #3

## Date: 2025-10-13

## Issue Summary
First line of YAML content in front matter is incorrectly included in `yaml_front_matter_start` node instead of being parsed as `yaml_front_matter_content` node, breaking syntax highlighting.

## Test Methodology

Created 5 test files in `test-validation/`:
1. `yaml-multiline.md` - Multiple YAML lines
2. `yaml-single.md` - Single YAML line
3. `yaml-empty.md` - Empty front matter
4. `yaml-ellipsis.md` - Using `...` delimiter
5. `yaml-special.md` - Special characters in first line

Parsed each with `tree-sitter parse` and used query extraction to examine node boundaries and content.

## Findings

### Test 1: Multi-line YAML (`yaml-multiline.md`)

**Input:**
```yaml
---
title: "Test Document"
format: html
execute:
  echo: false
---
```

**AST Structure:**
```
yaml_front_matter_start: [0, 0] - [1, 22]  ← Spans TWO lines!
yaml_front_matter_content: [2, 0] - [2, 12], text: `format: html`
yaml_front_matter_content: [3, 0] - [3, 8], text: `execute:`
yaml_front_matter_content: [4, 0] - [4, 13], text: `  echo: false`
yaml_front_matter_delimiter: [5, 0] - [5, 3], text: `---`
```

**Problem:** First YAML line (`title: "Test Document"`) is missing from content nodes!

### Test 2: Single-line YAML (`yaml-single.md`)

**Input:**
```yaml
---
title: "Single Line"
---
```

**AST Structure:**
```
yaml_front_matter_start: [0, 0] - [1, 20]
yaml_front_matter_delimiter: [2, 0] - [2, 3], text: `---`
```

**Problem:** **ZERO content nodes!** The only YAML line is entirely captured in the start node, leaving nothing for YAML syntax highlighting to attach to.

**Impact:** This is the worst case - single-line YAML front matter gets NO syntax highlighting at all.

### Test 5: Special Characters (`yaml-special.md`)

**Input:**
```yaml
---
title: "Test: A Study of \"Quotes\" & Symbols"
author: "Jane"
date: 2025-01-15
---
```

**AST Structure:**
```
yaml_front_matter_start: [0, 0] - [1, 46]  ← 46 characters!
yaml_front_matter_content: [2, 0] - [2, 14], text: `author: "Jane"`
yaml_front_matter_content: [3, 0] - [3, 16], text: `date: 2025-01-15`
yaml_front_matter_delimiter: [4, 0] - [4, 3], text: `---`
```

**Problem:** Long first line with special characters is missing from content nodes.

## Root Cause (Confirmed)

In `tree-sitter-pandoc-markdown/grammar.js:104`, the token definition is:

```javascript
field('start', alias(token(seq('---', /\r?\n/, /[^\r\n]+/)), $.yaml_front_matter_start))
                                                ^^^^^^^^^^^ This captures first content line
```

The regex pattern `/[^\r\n]+/` **requires and captures one line of content** as part of the start token.

## Impact on Syntax Highlighting

- Injection queries typically target `(yaml_front_matter_content)` nodes to apply YAML highlighting
- First line of YAML never gets highlighted because it's not a content node
- For single-line YAML front matter, **no highlighting happens at all**
- Users see inconsistent highlighting where first line looks like plain text

## Proposed Fix

Change line 104 from:
```javascript
field('start', alias(token(seq('---', /\r?\n/, /[^\r\n]+/)), $.yaml_front_matter_start))
```

To:
```javascript
field('start', alias(token(seq('---', /\r?\n/)), $.yaml_front_matter_start))
```

This makes the start token only capture `---\n`, allowing the first line to be matched by the `repeat(choice(...))` pattern as a proper `yaml_front_matter_content` node.

## Expected Results After Fix

### Test 1 (Multi-line) - Should have:
```
yaml_front_matter_start: [0, 0] - [1, 0]  ← Only the delimiter!
yaml_front_matter_content: [1, 0] - [1, 22], text: `title: "Test Document"`  ← NEW!
yaml_front_matter_content: [2, 0] - [2, 12], text: `format: html`
yaml_front_matter_content: [3, 0] - [3, 8], text: `execute:`
yaml_front_matter_content: [4, 0] - [4, 13], text: `  echo: false`
yaml_front_matter_delimiter: [5, 0] - [5, 3], text: `---`
```

### Test 2 (Single-line) - Should have:
```
yaml_front_matter_start: [0, 0] - [1, 0]  ← Only the delimiter!
yaml_front_matter_content: [1, 0] - [1, 20], text: `title: "Single Line"`  ← NEW!
yaml_front_matter_delimiter: [2, 0] - [2, 3], text: `---`
```

## Test Files to Update

The following existing tests need their expected output updated:
- `tree-sitter-pandoc-markdown/test/corpus/foundation.txt`:
  - "YAML front matter" test
  - "YAML front matter delimiters" test

## Confidence Level

**Very High** - The bug is clearly demonstrated and the fix is straightforward.

## Next Steps

1. Implement the grammar fix (single line change)
2. Rebuild parser: `npm run build`
3. Update test expectations in `foundation.txt`
4. Add new comprehensive test cases for edge cases
5. Run full test suite: `npm test`
6. Verify syntax highlighting works correctly
