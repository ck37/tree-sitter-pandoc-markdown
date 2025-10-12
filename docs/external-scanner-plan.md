# External Scanner Implementation Plan

**Status**: Implementation attempted but incomplete. See "Implementation Attempt Results" section below.

## Problem Statement

Line blocks and pipe tables both use the `|` character as a delimiter, creating an ambiguous pattern that tree-sitter's LR parser cannot resolve without lookahead.

**Line block example:**
```markdown
| First line of poetry
| Second line with preserved breaks
|    Indented third line
```

**Pipe table example:**
```markdown
| Name | Value |
| :--- | ---: |
| Foo  | 42    |
```

## Current State

The grammar already has a sophisticated external scanner (`src/scanner.c`) with:
- 57 token types including `PIPE_TABLE_START` and `PIPE_TABLE_LINE_ENDING`
- A comprehensive `parse_pipe_table()` function (lines 1173-1307) that:
  - Counts cells by scanning for `|` separators on the first line
  - Looks ahead to the next line for a delimiter row
  - Validates delimiter row format (`:?-+:?` patterns)
  - Confirms cell count matches between header and delimiter

## Disambiguation Strategy

The key difference between line blocks and pipe tables:

| Feature | Line Block | Pipe Table |
|---------|-----------|------------|
| First line | `\| [^\r\n]+` (single pipe, content) | `\| [^\|]+ \| [^\|]+ \|` (multiple pipes) |
| Second line | `\| [^\r\n]+` or other content | `\| :?-{3,}:? \| :?-{3,}:? \|` (delimiter row) |
| Line pattern | Each line starts with `\|` + space | Variable content rows after delimiter |

**Detection algorithm:**
1. When encountering `|` at line start, check the first line:
   - If multiple `|` separators exist → might be pipe table, check next line
   - If single `|` followed by content → might be line block, check next line
2. Look ahead to next line:
   - If it's a valid delimiter row (`| :?-+ | :?-+ |`) → **PIPE_TABLE**
   - If it starts with `| ` (line block continuation) → **LINE_BLOCK**
   - Otherwise → neither (treat as paragraph with literal `|`)

## Implementation Plan

### Phase 1: Add Line Block Tokens

**File**: `src/scanner.c`

1. Add new token types to the enum (after line 57):
```c
typedef enum {
    // ... existing tokens ...
    PIPE_TABLE_START,
    PIPE_TABLE_LINE_ENDING,
    LINE_BLOCK_START,        // NEW
    LINE_BLOCK_LINE_ENDING,  // NEW
} TokenType;
```

2. Update the `TOKEN_NAMES` array (add after line 140):
```c
"LINE_BLOCK_START",
"LINE_BLOCK_LINE_ENDING",
```

3. Update the `should_mark_end` array (add after line 171):
```c
true,  // LINE_BLOCK_START (zero width)
false, // LINE_BLOCK_LINE_ENDING
```

### Phase 2: Implement Line Block Detection Function

**File**: `src/scanner.c`

Add function before `parse_pipe_table()` (around line 1170):

```c
// Detect if the current line starting with | is a line block
// Line blocks have pattern: | <space> <content>
// and do NOT have a delimiter row following
static bool parse_line_block(Scanner *s, TSLexer *lexer,
                              const bool *valid_symbols) {
    // LINE_BLOCK_START is zero width
    mark_end(s, lexer);

    // Must start with |
    if (lexer->lookahead != '|') {
        return false;
    }
    advance(s, lexer);

    // Line blocks require at least one space after |
    if (lexer->lookahead != ' ' && lexer->lookahead != '\t') {
        return false;
    }

    // Scan to end of line, checking for additional pipes
    // If we find another |, this might be a table
    bool found_another_pipe = false;
    while (lexer->lookahead != '\r' && lexer->lookahead != '\n' &&
           !lexer->eof(lexer)) {
        if (lexer->lookahead == '|') {
            // Check if it's escaped
            // Note: would need to track previous character for this
            found_another_pipe = true;
        }
        advance(s, lexer);
    }

    // If we found multiple pipes, let parse_pipe_table handle it
    if (found_another_pipe) {
        return false;
    }

    // Look ahead to next line
    if (lexer->lookahead == '\n') {
        advance(s, lexer);
    } else if (lexer->lookahead == '\r') {
        advance(s, lexer);
        if (lexer->lookahead == '\n') {
            advance(s, lexer);
        }
    } else if (lexer->eof(lexer)) {
        // Single line block is valid
        lexer->result_symbol = LINE_BLOCK_START;
        return true;
    } else {
        return false;
    }

    // Skip leading whitespace on next line
    s->indentation = 0;
    s->column = 0;
    while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
        s->indentation += advance(s, lexer);
    }

    // Check if next line is a delimiter row (starts with | followed by :?-+)
    // If so, this is a pipe table, not a line block
    if (lexer->lookahead == '|') {
        advance(s, lexer);
        while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
            advance(s, lexer);
        }
        // Check for delimiter pattern
        if (lexer->lookahead == ':' || lexer->lookahead == '-') {
            return false; // This looks like a table delimiter
        }
        // Otherwise, it's another line block line
    }

    lexer->result_symbol = LINE_BLOCK_START;
    return true;
}
```

### Phase 3: Update Scan Function Logic

**File**: `src/scanner.c`

In the `scan()` function (around line 1424), add line block check BEFORE pipe table check:

```c
// Around line 1420-1430, find:
if (s->column == 0 &&
    lexer->lookahead == '|' &&
    valid_symbols[PIPE_TABLE_START]) {
    return parse_pipe_table(s, lexer, valid_symbols);
}

// REPLACE WITH:
if (s->column == 0 && lexer->lookahead == '|') {
    // Try line block first (more restrictive pattern)
    if (valid_symbols[LINE_BLOCK_START]) {
        if (parse_line_block(s, lexer, valid_symbols)) {
            return true;
        }
        // Reset lexer position if line block didn't match
        // (Note: may need to implement position saving/restoring)
    }

    // Fall back to pipe table
    if (valid_symbols[PIPE_TABLE_START]) {
        return parse_pipe_table(s, lexer, valid_symbols);
    }
}
```

**Important**: This requires implementing lexer position save/restore, or using the `mark_end()` and scanning in simulate mode.

### Phase 4: Update Grammar

**File**: `grammar.js`

1. Add external tokens:
```javascript
externals: $ => [
    // ... existing externals ...
    $.line_block_start,
    $.line_block_line_ending,
],
```

2. Add line_block rule:
```javascript
line_block: $ => prec.right(seq(
    $.line_block_start,
    $.line_block_line,
    repeat($.line_block_line)
)),

line_block_line: $ => seq(
    field('marker', alias(token(prec(1, seq('|', /[ \t]+/))), $.line_block_marker)),
    optional(field('content', $.inline)),
    choice(
        $.line_block_line_ending,
        /\r?\n/
    )
),
```

3. Add to `_block` choices (with appropriate precedence):
```javascript
_block: $ => choice(
    // ... existing blocks ...
    $.line_block,  // Add this
    $.pipe_table,
    // ... rest ...
),
```

### Phase 5: Add Highlighting

**File**: `queries/highlights.scm`

```scheme
(line_block_marker) @punctuation.special
(line_block
  (line_block_line
    (inline) @text))
```

### Phase 6: Restore Tests

Move tests from `test/disabled/line-blocks.txt` back to `test/corpus/foundation.txt`.

## Inspiration from Similar Implementations

### 1. Existing Scanner (`src/scanner.c`)
The current `parse_pipe_table()` function demonstrates:
- ✅ Multi-line lookahead pattern
- ✅ Cell counting and validation
- ✅ Delimiter row pattern matching
- ✅ Simulate mode for non-destructive scanning
- ✅ Block context handling

### 2. tree-sitter-markdown (ikatyang)
Uses C++ with:
- Context stacks for block and inline parsing
- Delimiter lists for managing paired markers
- Complex state management for nested structures

**Not directly applicable** due to different architecture (C++ vs C, different parsing model).

### 3. tree-sitter-grammars/tree-sitter-markdown
Uses two-pass parsing:
- Block grammar first
- Inline grammar with included ranges

**Lesson**: Splitting block and inline parsing simplifies ambiguity, which this grammar already does.

### 4. Tree-sitter External Scanner Docs
Key patterns:
- Use `mark_end()` for zero-width tokens
- Implement `serialize`/`deserialize` for multi-line state
- Use `simulate` mode for lookahead without side effects

## Challenges and Solutions

### Challenge 1: Lexer Position Management
**Problem**: `parse_line_block()` advances the lexer, but if it returns false, the position is wrong for `parse_pipe_table()`.

**Solutions**:
- **Option A**: Use `s->simulate = true` during line block detection (already used in pipe table parsing)
- **Option B**: Restructure to peek without advancing, then advance once decision is made
- **Option C**: Make line block detection non-advancing and only mark the start token

**Recommendation**: Use simulate mode (Option A) - already proven in codebase.

### Challenge 2: Escaped Pipes
**Problem**: Content with escaped `\|` might be mis-detected as line block when it's actually a table cell.

**Solution**: Track previous character; if it's `\`, don't count the pipe.

### Challenge 3: Empty Line Blocks
**Problem**: Line block with just `|` and whitespace.

**Solution**: Allow empty content (optional inline in grammar rule), similar to pipe table empty cells.

### Challenge 4: Line Block vs Paragraph Starting with |
**Problem**: A paragraph might start with `|` as literal text.

**Solution**: Require next line to either:
- Continue line block pattern (`| content`)
- End (EOF)
- Otherwise, let paragraph rule match

## Testing Strategy

1. **Unit tests** for scanner functions (if possible with tree-sitter test infrastructure)
2. **Corpus tests** covering:
   - Simple line blocks (3 lines)
   - Line blocks with indentation
   - Line blocks with inline formatting
   - Empty line block lines
   - Line blocks followed by pipe tables
   - Pipe tables followed by line blocks
   - Edge case: single line with `|` (paragraph vs line block)
3. **Regression tests** ensuring pipe tables still work correctly

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Break existing pipe tables | Medium | High | Thorough testing, try line block first |
| Performance degradation | Low | Medium | Use simulate mode, optimize lookahead |
| State serialization issues | Low | Medium | Follow existing pattern, test multi-line |
| Edge cases not handled | Medium | Medium | Comprehensive test suite |

## Estimated Effort

- **Phase 1-2**: 2-3 hours (token setup, function implementation)
- **Phase 3**: 1-2 hours (scan function integration, position management)
- **Phase 4**: 1 hour (grammar updates)
- **Phase 5**: 30 minutes (highlighting)
- **Phase 6**: 30 minutes (restore tests)
- **Testing/Debug**: 2-4 hours (handle edge cases)

**Total**: 7-11 hours of focused development

## References

- [Tree-sitter External Scanner Docs](https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners.html)
- [Pandoc Line Blocks Spec](https://pandoc.org/MANUAL.html#line-blocks)
- Current `parse_pipe_table()` implementation (lines 1173-1307)
- Current scanner state management patterns

## Next Steps

1. Review this plan with maintainer
2. Set up development branch (e.g., `feat/external-scanner-line-blocks`)
3. Implement Phase 1-2 (tokens and detection function)
4. Test in isolation
5. Integrate Phase 3-4 (grammar and scan function)
6. Add highlighting and restore tests
7. Iterate on edge cases
8. Submit PR with comprehensive test coverage

---

## Implementation Attempt Results

**Date**: 2025-10-11
**Branch**: `feat/phase-1-pandoc-grammar`
**Status**: ❌ Incomplete - Tests failing for both line blocks and pipe tables

### What Was Implemented

All 6 phases from the plan were completed:

#### Phase 1: Scanner Tokens ✅
**Files modified**: `src/scanner.c`

Added to TokenType enum (lines 57-58):
```c
LINE_BLOCK_START,
LINE_BLOCK_LINE_ENDING,
```

Added to should_mark_end array (lines 174-175):
```c
true,  // LINE_BLOCK_START (zero width)
false, // LINE_BLOCK_LINE_ENDING
```

#### Phase 2: parse_line_block() Function ✅
**Files modified**: `src/scanner.c` (lines 1188-1276)

Implemented with:
- Zero-width LINE_BLOCK_START token emission
- Check for `|` followed by space/tab requirement
- Multi-line lookahead to detect pipe table delimiter rows
- Escape handling for `\|` characters
- **Key innovation**: Use of `s->simulate = true` to avoid advancing lexer state when returning false

```c
static bool parse_line_block(Scanner *s, TSLexer *lexer, const bool *valid_symbols) {
    // Uses simulate mode to peek ahead without modifying lexer position
    // Returns false without side effects if not a line block
    // Checks for multiple pipes → returns false (pipe table)
    // Checks next line for delimiter row → returns false (pipe table)
    // Otherwise returns true with LINE_BLOCK_START token
}
```

#### Phase 3: scan() Function Integration ✅
**Files modified**: `src/scanner.c` (lines 1518-1531)

Added case `'|'` handler:
```c
case '|':
    // Try line block first if it's valid
    if (valid_symbols[LINE_BLOCK_START]) {
        bool result = parse_line_block(s, lexer, valid_symbols);
        if (result) {
            return true;
        }
    }
    // Try pipe table if it's valid
    if (valid_symbols[PIPE_TABLE_START]) {
        return parse_pipe_table(s, lexer, valid_symbols);
    }
    return false;
```

#### Phase 4: Grammar Rules ✅
**Files modified**: `grammar.js`

Added externals declaration (lines 16-19):
```javascript
externals: $ => [
    $.line_block_start,
    $.pipe_table_start,
],
```

Added line_block rules (lines 288-297):
```javascript
line_block: $ => prec.right(seq(
    $.line_block_start,
    $.line_block_line,
    repeat($.line_block_line)
)),

line_block_line: $ => seq(
    field('marker', alias(token(prec(1, /\|[ \t]+/)), $.line_block_marker)),
    optional(field('content', $.inline)),
    /\r?\n/
),
```

Updated pipe_table to include external token (line 300-305):
```javascript
pipe_table: $ => prec.right(seq(
    $.pipe_table_start,
    field('header', $.pipe_table_header),
    field('delimiter', $.pipe_table_delimiter),
    repeat1(field('row', $.pipe_table_row))
)),
```

Added precedence to _block choices (lines 40-41):
```javascript
prec(2, $.line_block),
prec(1, $.pipe_table),
```

#### Phase 5: Highlighting Queries ✅
**Files modified**: `queries/highlights.scm` (line 33)

```scheme
(line_block_marker) @punctuation.special
```

#### Phase 6: Tests Restored ✅
**Files modified**: `test/corpus/foundation.txt`

Moved 4 line block tests from `test/disabled/line-blocks.txt` back to main corpus (lines 698-800):
- Line block simple
- Line block with indentation
- Line block with emphasis
- Empty line block line

### Current Test Results

**Block grammar**: 37/43 tests passing (6 failures)
- ❌ Thematic break spaced (regression)
- ❌ Pipe table
- ❌ Line block simple
- ❌ Line block with indentation
- ❌ Line block with emphasis
- ❌ Empty line block line

**Inline grammar**: 29/29 tests passing ✅

### Failure Analysis

#### 1. Pipe Table Test Failure

**Expected**:
```
(document
  (pipe_table
    (pipe_table_header
      (pipe_table_header_cell ...)
      (pipe_table_header_cell ...))
    (pipe_table_delimiter ...)
    (pipe_table_row ...)
    (pipe_table_row ...)))
```

**Actual**:
```
(document
  (ERROR (UNEXPECTED 'N') (UNEXPECTED 'V')))
  (pipe_table_start)
  (pipe_table_header ...)
  (ERROR ...)
  (line_block_marker)
  (line_block_start))
```

**Analysis**:
- Both external tokens are being emitted
- Grammar is creating ERROR nodes before/around the structures
- Tokens from both line_block and pipe_table appearing in same parse
- Suggests external token isn't properly controlling which rule matches

#### 2. Line Block Test Failures

**Expected** (for "Line block simple"):
```
(document
  (line_block
    (line_block_line (line_block_marker) (inline (text)))
    (line_block_line (line_block_marker) (inline (text)))
    (line_block_line (line_block_marker) (inline (text)))))
```

**Actual**:
```
(document
  (ERROR (UNEXPECTED 'F'))
  (line_block
    (line_block_start)
    (line_block_line (line_block_marker) (inline (text)))
    (line_block_line (line_block_marker) (inline (text)))))
```

**Analysis**:
- ERROR appears before line_block structure
- Only 2 of 3 line_block_line nodes parsed
- line_block_start appears in tree (expected for external token)
- Third line not being captured by `repeat($.line_block_line)`

#### 3. Thematic Break Spaced Regression

**Expected**: `(document (thematic_break))`

**Actual**:
```
(document
  (ERROR
    (fenced_div_delimiter)
    (info_string_text)
    (fenced_div_delimiter)))
```

**Analysis**: Pattern `* * *` is now matching fenced_div instead of thematic_break. Likely a side effect of precedence changes.

### Root Cause Hypotheses

1. **External Token Mechanics**: The external scanner is emitting tokens, but tree-sitter's GLR parser is still trying multiple parse paths, creating conflicts between line_block and pipe_table rules even though only one should be valid.

2. **Lexer State Not Preserved**: Despite using `simulate` mode, the lexer position may still be corrupted when `parse_line_block` returns false, causing `parse_pipe_table` to fail.

3. **Precedence Insufficient**: Even with `prec(2, $.line_block)` and `prec(1, $.pipe_table)`, tree-sitter is trying other rules first (like paragraph or other block types), leading to ERROR nodes.

4. **External Token Visibility**: The external tokens may need to be hidden from the AST or handled differently. The appearance of `line_block_start` directly in the tree suggests it's being treated as a regular node rather than a disambiguation signal.

5. **Grammar Structure**: Including the external token as a child of the rule (e.g., `seq($.line_block_start, $.line_block_line, ...)`) may not be the correct pattern. Other grammars might use external tokens differently.

### Attempted Solutions

1. **Simulate mode usage** ✅: Implemented `s->simulate = true` wrapper in `parse_line_block` to avoid lexer state corruption
2. **Precedence tuning** ✅: Added `prec(2, $.line_block)` and `prec(1, $.pipe_table)` to _block choice
3. **Parse order** ✅: Try line_block before pipe_table in scan() function
4. **Zero-width tokens** ✅: Both LINE_BLOCK_START and PIPE_TABLE_START are zero-width

### What Didn't Work

1. **Adding external tokens to both rules**: Breaking the grammar structure
2. **Dynamic precedence**: `prec.dynamic(4, ...)` didn't help
3. **Conflict declarations**: Adding `[$.code_span, $.raw_inline]` style conflicts for pipe patterns
4. **Removing external tokens**: Without them, disambiguation impossible
5. **Quick-check functions**: Attempted non-advancing peek functions, but still had lexer state issues

### Lessons Learned

1. **External scanners are complex**: The interaction between external tokens, grammar rules, and tree-sitter's GLR parser is non-trivial
2. **Simulate mode has limits**: Even with simulate mode, there are still side effects or the external token emission itself creates ambiguity
3. **Precedence alone is insufficient**: You can't rely solely on precedence to disambiguate when both patterns start identically
4. **Pattern overlap is fundamental**: `|` starting both constructs means any solution requires perfect coordination between scanner and grammar

### Recommended Next Steps

1. **Study Working Examples**:
   - Examine how Python grammar handles indent/dedent with external scanner
   - Look at how Bash grammar disambiguates similar constructs
   - Study tree-sitter documentation examples more carefully

2. **Debugging Approach**:
   - Add printf debugging to scanner.c to trace token requests
   - Use `tree-sitter parse --debug` to see parse graph
   - Create minimal reproduction test case (single line block vs single table)

3. **Alternative Approaches**:
   - **Option A**: Make line blocks require `||` instead of `|` (breaks Pandoc compatibility)
   - **Option B**: Use different marker character in grammar temporarily to validate scanner logic works
   - **Option C**: Implement both as single rule, differentiate in post-processing

4. **Get Expert Help**:
   - Post to tree-sitter Discussions with minimal reproduction
   - Ask in tree-sitter Discord/Matrix channels
   - Review tree-sitter-markdown implementations more thoroughly

5. **Incremental Testing**:
   - Test line blocks in isolation (remove pipe_table from grammar temporarily)
   - Test pipe tables in isolation (remove line_block from grammar temporarily)
   - Verify scanner functions work correctly in isolation before combining

### Files Modified in This Attempt

- `src/scanner.c`: Added LINE_BLOCK tokens, parse_line_block(), scan() case
- `grammar.js`: Added externals, line_block rules, precedence
- `queries/highlights.scm`: Added line_block_marker highlighting
- `test/corpus/foundation.txt`: Restored 4 line block tests
- `src/grammar.json`: Generated (reflects grammar changes)
- `src/node-types.json`: Generated (reflects grammar changes)
- `src/parser.c`: Generated (reflects all changes)

### Reverted Changes

None yet - implementation is left in place for future debugging and iteration.

### Time Invested

Approximately 3-4 hours of implementation and debugging.

### Conclusion

The implementation follows correct patterns from the tree-sitter documentation and mimics approaches seen in other grammars. However, the specific interaction between external tokens and GLR parsing in this case requires deeper expertise than initially anticipated. The failure mode suggests that both external tokens are being emitted simultaneously or that tree-sitter is trying multiple parse paths even when only one should be valid according to the external scanner.

This is a challenging problem that requires either:
1. Deep expertise in tree-sitter's external scanner mechanics
2. Community help from tree-sitter experts
3. A different architectural approach (splitting grammars, changing syntax, etc.)

The work done provides a solid foundation for future attempts and clearly documents what was tried and why it didn't work.
