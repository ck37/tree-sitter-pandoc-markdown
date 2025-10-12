# Fenced Div Parser Bug Fix

**Date**: 2025-10-12
**Issue**: Content after fenced divs caused ERROR nodes
**Status**: ✅ FIXED

## Problem Description

Fenced divs would parse correctly in isolation, but any content after the closing `:::` delimiter would be wrapped in ERROR nodes, making fenced divs unusable in real documents.

### Example That Failed

```markdown
:::{.callout-note}
Important information here!
:::

### Next Section
Text after the div.
```

**Parse result**: The fenced div closed correctly, but the heading and paragraph after it were wrapped in ERROR nodes.

## Root Cause

The grammar rule for `fenced_div` was:

```javascript
fenced_div: $ => prec.right(seq(
  field('open', alias(token(/:::+/), $.fenced_div_delimiter)),
  optional(field('attributes', $.attribute_list)),
  /\r?\n/,
  repeat($._block),                    // ← Problem here
  field('close', alias(token(/:::+/), $.fenced_div_delimiter)),
  /\r?\n/
)),
```

The issue was that `repeat($._block)` greedily consumed ALL blocks until EOF, not stopping at the closing `:::` delimiter. Tree-sitter's LR parser continued trying to parse more blocks as part of the fenced div content, rather than recognizing the `:::` as the closing delimiter.

### Why This Happened

- Tree-sitter's `repeat()` will keep consuming matches until it can't parse any more
- The closing `:::` token wasn't prioritized over continuing the repeat
- The parser would try to consume all remaining document content as part of the fenced div
- When it reached EOF without finding what it expected, it did error recovery and wrapped everything in ERROR nodes

### Why Fenced Code Blocks Don't Have This Issue

Fenced code blocks work correctly because they don't use `repeat($._block)`:

```javascript
fenced_code_block: $ => seq(
  field('delimiter', alias(token(/```+/), $.fenced_code_block_delimiter)),
  optional(field('info', $.info_string)),
  /\r?\n/,
  optional(field('content', alias(repeat1(choice(
    seq($.chunk_option, /\r?\n/),
    seq($.code_fence_line_text, /\r?\n/)  // ← Line-based, not block-based
  )), $.code_fence_content))),
  field('delimiter', alias(token(/```+/), $.fenced_code_block_delimiter)),
  /\r?\n/
),
```

Code blocks use line-based tokens (`code_fence_line_text`) rather than parsing full blocks, which naturally stops at the closing delimiter.

## Solution

Add `prec(10)` to the closing delimiter token to give it higher priority:

```javascript
fenced_div: $ => seq(
  field('open', alias(token(/:::+/), $.fenced_div_delimiter)),
  optional(field('attributes', $.attribute_list)),
  /\r?\n/,
  repeat($._block),
  field('close', alias(token(prec(10, /:::+/)), $.fenced_div_delimiter)),  // ← Fix
  /\r?\n/
),
```

The `prec(10)` tells tree-sitter: "When you see `:::`, prioritize recognizing it as the closing delimiter rather than continuing to parse more blocks."

## Testing

### Debug Process

1. Created minimal test case: `examples/test-fenced-div.md`
2. Ran `tree-sitter parse --debug` to understand parser behavior
3. Compared with working `fenced_code_block` grammar
4. Identified that `repeat($._block)` was too greedy
5. Tried several approaches:
   - ❌ Removing `prec.right` - no effect
   - ❌ Adding `prec(10)` to opening delimiter - no effect
   - ✅ Adding `prec(10)` to closing delimiter - **FIXED**

### Test Results

Before fix:
```
(fenced_div [0, 0] - [4, 0]
  ...
  close: (fenced_div_delimiter [2, 0] - [2, 3]))
(ERROR [4, 0] - [7, 0]          ← Everything after div was ERROR
  (atx_heading ...)
  (paragraph ...))
```

After fix:
```
(fenced_div [0, 0] - [4, 0]
  ...
  close: (fenced_div_delimiter [2, 0] - [2, 3]))
(atx_heading [4, 0] - [6, 0])   ← Clean parse!
  ...)
(paragraph [6, 0] - [7, 0])     ← Clean parse!
  ...)
```

### Corpus Test Added

Added new test case to `test/corpus/foundation.txt`:

```
================================================================================
Fenced div with content after
================================================================================
:::{.note}
Content inside div
:::

# Heading After Div

Paragraph after div.

--------------------------------------------------------------------------------

(document
  (fenced_div
    (fenced_div_delimiter)
    (attribute_list)
    (paragraph
      (inline
        (text)))
    (fenced_div_delimiter))
  (atx_heading
    (atx_heading_marker)
    (inline
      (text)))
  (paragraph
    (inline
      (text))))
```

### Final Test Coverage

- **Total tests**: 73/73 passing (100%)
  - Block grammar: 44/44 (added 1 new test)
  - Inline grammar: 29/29
- **Example files**: All parse with zero errors
  - `examples/simple-test.md` ✅
  - `examples/feature-showcase.md` ✅ (now uses real fenced divs)

## Impact

### Before Fix
- Fenced divs were unusable in real documents
- Had to show them only as code examples
- Listed as "High severity" bug in known-issues.md

### After Fix
- ✅ Fenced divs work correctly with content after them
- ✅ Can nest blocks inside divs
- ✅ Can use multiple divs in same document
- ✅ Proper integration with rest of Pandoc Markdown features

## Lessons Learned

### Tree-sitter Grammar Patterns

1. **`repeat()` is greedy** - It will consume as many matches as possible
2. **Use `prec()` to control parsing decisions** - Higher precedence wins
3. **Delimiters need priority** - Closing delimiters should have high precedence to stop repeats
4. **Test with content after** - Always test containers with subsequent content, not just in isolation

### Debugging Strategies

1. **Create minimal test cases** - Isolate the exact problematic pattern
2. **Use `--debug` flag** - See parser state transitions
3. **Compare with working patterns** - Learn from similar working constructs
4. **Understand the parse tree structure** - Look at character ranges to see what's being consumed

## Related Files Changed

- `tree-sitter-pandoc-markdown/grammar.js` - Added `prec(10)` to closing delimiter
- `tree-sitter-pandoc-markdown/test/corpus/foundation.txt` - Added test case
- `examples/feature-showcase.md` - Now uses real fenced divs instead of code examples
- `docs/known-issues.md` - Removed fenced div from bugs section
- `docs/fenced-div-fix.md` - This document

## Commit

```
commit 53285b1
fix: resolve fenced div parser bug causing errors after closing delimiter
```

Total time to identify and fix: ~2 hours (including investigation and testing)
