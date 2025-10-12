# Options for Proceeding with Line Blocks Implementation

**Date**: 2025-10-11
**Current Status**: 41/43 tests passing (2 failures involving external token interference)

## Root Cause Analysis

Through extensive debugging with printf statements, we've determined:

1. **Scanner is working correctly**: `parse_line_block()` and `parse_pipe_table()` check for `|` and return false when lookahead isn't `|`
2. **Error recovery check is working**: When both tokens are valid simultaneously, we return false
3. **Grammar structure is the problem**: The grammar makes both `LINE_BLOCK_START` and `PIPE_TABLE_START` valid in inappropriate contexts (e.g., inside block quotes where lookahead is `>`)
4. **Tree-sitter behavior**: During error recovery, tree-sitter inserts expected-but-unavailable tokens into ERROR nodes

Debug output shows:
```
scan() called: lookahead='>' (0x3e), LINE_BLOCK=1, PIPE_TABLE=1
  -> Error recovery mode detected, returning false
```

Even though we return false, tree-sitter adds these tokens to the parse tree as part of ERROR recovery.

## The Fundamental Issue

The `_pipe_construct` wrapper grouping `line_block` and `pipe_table` is **not sufficient** to make them mutually exclusive in tree-sitter's GLR parser. The parser still considers both external tokens valid in many contexts, leading to:

- Ambiguous parse states
- Error recovery inserting unwanted tokens
- Both constructs failing to parse correctly

## Options for Proceeding

### Option 1: Change Line Block Syntax (Easiest, Breaks Pandoc Compatibility)

**What**: Require line blocks to use `||` instead of `|`

**Changes needed**:
```javascript
line_block_line: $ => seq(
  field('marker', alias(token(prec(1, /\|\|[ \t]+/)), $.line_block_marker)),
  // ...
),
```

**Pros**:
- ✅ Completely eliminates ambiguity with pipe tables
- ✅ Scanner can easily distinguish `||` vs `|`
- ✅ Would likely work immediately with existing scanner
- ✅ No GLR conflicts

**Cons**:
- ❌ **Breaks Pandoc compatibility** - not standard Pandoc markdown
- ❌ Documents with line blocks wouldn't parse correctly
- ❌ Defeats the purpose of "Pandoc markdown" grammar

**Recommendation**: Only if we're willing to create a "Pandoc-like" grammar instead of true Pandoc support.

---

### Option 2: Implement Only Pipe Tables, Defer Line Blocks (Pragmatic)

**What**: Remove line blocks entirely, focus on pipe tables which are more common

**Changes needed**:
- Comment out `line_block` rules in grammar
- Remove `LINE_BLOCK_START` from externals
- Remove line block tests

**Pros**:
- ✅ Pipe tables are more widely used than line blocks
- ✅ Eliminates the ambiguity problem completely
- ✅ Allows us to ship a working parser sooner
- ✅ Can revisit line blocks in future when we have better solution

**Cons**:
- ❌ Line blocks won't be supported (but they're rarely used)
- ❌ Incomplete Pandoc support
- ❌ May disappoint users who need line blocks

**Recommendation**: **Best pragmatic choice**. Pipe tables cover 95% of use cases.

---

### Option 3: Add Grammar Constraints (Medium Difficulty, May Not Work)

**What**: Add precedence, conflicts declarations, or other grammar mechanisms to prevent both tokens being valid

**Approaches to try**:
```javascript
conflicts: $ => [
  [$.line_block, $.pipe_table],
  [$._inline_element, $._link_text_element],
],
```

Or restructure `_block` with more explicit precedence:
```javascript
_block: $ => prec.left(choice(
  prec(10, $.atx_heading),
  // ...
  prec(2, choice($.line_block, $.pipe_table)),  // Force choice resolution
  prec(-2, $.paragraph),
)),
```

**Pros**:
- ✅ Maintains Pandoc compatibility
- ✅ Keeps both features

**Cons**:
- ❌ Uncertain if it will work (we've tried similar approaches)
- ❌ May create new conflicts elsewhere
- ❌ Could take significant trial-and-error
- ❌ Tree-sitter's GLR parser may still request both tokens

**Recommendation**: Worth 1-2 hours of experimentation, but not guaranteed to succeed.

---

### Option 4: Deep Grammar Restructuring (High Difficulty)

**What**: Fundamentally change how blocks are structured to enforce mutual exclusivity at parse table level

**Approaches**:
- Split `_block` into categories that can't contain pipe constructs (like `_block_in_quote`)
- Use separate start rules for different contexts
- Implement context tracking in scanner with state serialization

**Example**:
```javascript
_block: $ => choice($.block_quote, $.fenced_code_block, $._pipe_construct, ...),
_block_in_quote: $ => choice($.paragraph, $.list, /* NO pipe constructs */),

block_quote_line: $ => seq(
  field('marker', ...),
  optional(field('content', $._inline_or_block_in_quote)),  // Restricted
  /\r?\n/
),
```

**Pros**:
- ✅ Could solve the problem correctly
- ✅ Maintains full Pandoc compatibility
- ✅ Proper solution to the fundamental issue

**Cons**:
- ❌ **Very complex** - requires understanding tree-sitter deeply
- ❌ Could take days/weeks to get right
- ❌ May introduce new issues
- ❌ Requires extensive testing of all existing constructs
- ❌ Risk of breaking working features

**Recommendation**: Only if this is a critical feature and we have significant time to invest.

---

### Option 5: External Scanner State Management (High Difficulty, Advanced)

**What**: Use scanner state serialization to track context and refuse to emit tokens in wrong contexts

**Implementation**:
```c
typedef struct {
  Array(Block) open_blocks;
  Array(ContextType) context_stack;  // NEW: track parsing context
  // ...
} Scanner;

static bool parse_line_block(Scanner *s, TSLexer *lexer, const bool *valid_symbols) {
  // Check context stack - don't allow line blocks inside block quotes
  for (size_t i = 0; i < s->context_stack.size; i++) {
    if (s->context_stack.items[i] == CONTEXT_BLOCK_QUOTE) {
      return false;  // Line blocks not allowed in this context
    }
  }
  // ... rest of function
}
```

**Pros**:
- ✅ Maintains Pandoc compatibility
- ✅ Sophisticated solution
- ✅ Could handle complex nesting rules

**Cons**:
- ❌ **Very complex** - requires perfect state tracking
- ❌ Must serialize/deserialize state correctly
- ❌ Easy to introduce subtle bugs
- ❌ May still not prevent grammar from requesting both tokens
- ❌ Debugging is difficult

**Recommendation**: Only attempt if you're comfortable with advanced tree-sitter patterns (see YAML scanner for reference).

---

### Option 6: Modify Tests (Not Recommended)

**What**: Change test expectations to accept current ERROR-filled output

**Changes**: Update test corpus to expect the ERROR nodes

**Pros**:
- ✅ Tests would pass immediately

**Cons**:
- ❌ **Doesn't solve the actual problem**
- ❌ Parser would be broken for real-world use
- ❌ Error nodes make syntax highlighting/LSP features impossible
- ❌ Defeats the purpose of the tests

**Recommendation**: **Do not do this**. Tests exist to validate correctness.

---

### Option 7: Community Help (Time Investment)

**What**: Post detailed question to tree-sitter Discussions/Discord with minimal reproduction

**What to include**:
- Simplified grammar showing the conflict
- Scanner code
- Debug output showing both tokens valid simultaneously
- What we've tried
- Ask: "How to make external tokens mutually exclusive in grammar?"

**Pros**:
- ✅ Expert advice from tree-sitter maintainers
- ✅ May reveal techniques we don't know
- ✅ Could get definitive answer on feasibility
- ✅ Helps the community with similar issues

**Cons**:
- ❌ Takes time to write good question
- ❌ May not get quick response
- ❌ Might be told "this isn't possible" or "restructure grammar"

**Recommendation**: Worth doing if Options 2-5 don't work, but prepare detailed writeup.

---

## Recommended Path Forward

### **Short-term (Next 2-4 hours)**:

1. ✅ **Option 2**: Remove line blocks, keep only pipe tables
   - Comment out line block grammar rules
   - Remove LINE_BLOCK_START from externals
   - Update tests
   - Verify all tests pass
   - Document in README that line blocks aren't supported yet

2. ⏭️ **Clean up**: Remove debug fprintf statements from scanner.c

3. ⏭️ **Document**: Update plan.md with findings and decision

### **Medium-term (If line blocks are critical)**:

4. **Option 3**: Try grammar constraints (1-2 hours max)
   - Experiment with conflicts declarations
   - Try different precedence structures
   - If doesn't work quickly, move to Option 7

5. **Option 7**: Seek community help
   - Prepare minimal reproduction
   - Post to tree-sitter Discussions
   - Wait for expert guidance

### **Long-term (If needed)**:

6. **Option 4 or 5**: Deep restructuring based on community feedback

---

## Decision Matrix

| Criterion | Opt 1: Change Syntax | Opt 2: Defer Line Blocks | Opt 3: Grammar Constraints | Opt 4: Deep Restructuring | Opt 5: Scanner State |
|-----------|---------------------|-------------------------|---------------------------|--------------------------|---------------------|
| **Time to implement** | 30 min | 30 min | 1-2 hours | Days/weeks | Days |
| **Likelihood of success** | 100% | 100% | 30% | 60% | 40% |
| **Maintains Pandoc compat** | ❌ No | ⚠️ Partial | ✅ Yes | ✅ Yes | ✅ Yes |
| **Complexity** | Low | Low | Medium | Very High | Very High |
| **Risk of breaking existing** | Low | None | Medium | High | Medium |

---

## My Recommendation

**Go with Option 2** (defer line blocks) because:

1. **Pipe tables are much more common** than line blocks in real-world Pandoc documents
2. **We've already spent 6+ hours** on this problem with extensive research
3. **Line blocks can be added later** when we have better understanding or community guidance
4. **All other Pandoc features work** - we have 41/43 tests passing
5. **Pragmatic > perfect** - ship a working parser now, improve later

The alternative is to spend potentially days on Options 4/5 with uncertain success, or break Pandoc compatibility with Option 1.

---

## If You Choose Option 2: Implementation Steps

1. Edit `tree-sitter-pandoc-markdown/grammar.js`:
   ```javascript
   externals: $ => [
     // $.line_block_start,  // Deferred - see options-for-proceeding.md
     $.pipe_table_start,
   ],

   _pipe_construct: $ => choice(
     // $.line_block,  // Deferred - requires grammar restructuring
     $.pipe_table
   ),

   // Comment out line_block and line_block_line rules
   ```

2. Remove debug fprintf statements from `src/scanner.c`

3. Run `npm run build && npm test` - should get 43/43 passing (or 41/41 after removing line block tests)

4. Update `README.md` and `plan.md` noting line blocks aren't yet supported

5. Document decision in `external-scanner-resources.md` for future reference

---

## Conclusion

We've made excellent progress:
- ✅ Researched external scanners thoroughly
- ✅ Implemented working scanner code
- ✅ Identified root cause (grammar structure issue)
- ✅ Got 41/43 tests passing (huge improvement from initial failures)
- ✅ Compiled comprehensive learning resources

The remaining 2 failures are due to a fundamental grammar design challenge that requires either significant restructuring or accepting limitations. **Option 2 is the pragmatic choice** that delivers value now while leaving the door open for future enhancement.
