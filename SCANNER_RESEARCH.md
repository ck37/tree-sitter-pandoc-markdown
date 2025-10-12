# Tree-sitter External Scanner Research

**Date:** 2025-10-12
**Purpose:** Understand how other tree-sitter grammars handle external scanners and ambiguous constructs to inform pipe table implementation

## Executive Summary

After researching 6 major tree-sitter grammars (Markdown, Python, Ruby, TypeScript, Bash, Org-mode), key findings:

1. **Conflicts Array is Common**: Most complex grammars use explicit `conflicts` arrays to declare ambiguities
2. **External Token Positioning Varies**: Some place external tokens BEFORE ambiguous characters (Markdown), others use them for state management (Python INDENT/DEDENT)
3. **Precedence is Critical**: All grammars use `prec()` and `prec.right()` extensively
4. **valid_symbols Check is Universal**: Every scanner checks `valid_symbols` before emitting tokens
5. **Our Issue is Unique**: Most grammars either (a) have distinctive starting tokens or (b) use external scanner for state tracking, not disambiguation

## 1. tree-sitter-markdown

**Repository:** https://github.com/tree-sitter-grammars/tree-sitter-markdown

### Externals Array
```javascript
externals: $ => [
  $.\_newline,
  $.\_soft\_line\_break,
  $.\_block\_close,
  $.\_block\_continuation,
  $.\_block\_quote\_start,
  $.\_indented\_chunk\_start,
  // ATX heading markers (H1-H6)
  $.\_atx\_h1\_marker,
  $.\_atx\_h2\_marker,
  // ... more heading markers
  // Setext underlines
  $.\_setext\_h1\_underline,
  $.\_setext\_h2\_underline,
  $.\_thematic\_break,
  // List markers
  $.\_list\_marker\_minus,
  $.\_list\_marker\_plus,
  // ... more list markers
  // Code blocks
  $.\_fenced\_code\_block\_start\_backtick,
  $.\_fenced\_code\_block\_start\_tilde,
  $.\_fenced\_code\_block\_end\_backtick,
  $.\_fenced\_code\_block\_end\_tilde,
  $.\_blank\_line\_start,
  // HTML blocks
  $.\_html\_block\_1\_start,
  // ... more HTML block types
  $.\_close\_block,
  $.\_no\_indented\_chunk,
  $.\_error,
  $.\_trigger\_error,
  $.\_eof,
  $.\_minus\_metadata,
  $.\_plus\_metadata,
  $.\_pipe\_table\_start,      // ← Our focus
  $.\_pipe\_table\_line\_ending,
  $.\_line\_block\_start,
  $.\_line\_block\_line\_ending,
]
```

**Key Observation:** MASSIVE externals array with ~40+ tokens. The scanner handles most block-level disambiguation.

### Pipe Table Grammar Structure
```javascript
pipe_table: $ => prec.right(seq(
  $.\_pipe\_table\_start,  // BEFORE first '|' - zero-width validation
  alias($.pipe_table_row, $.pipe_table_header),
  $.\_newline,
  $.pipe_table_delimiter_row,
  repeat(seq($.\_pipe\_table\_newline, optional($.pipe_table_row))),
  choice($.\_newline, $.\_eof)
))
```

**Critical Detail:** `_pipe_table_start` comes BEFORE the first '|' character.

### Block Choice Order
```javascript
_block_not_section: $ => choice(
  alias($.\_setext\_heading1, $.setext\_heading),
  alias($.\_setext\_heading2, $.setext\_heading),
  $.paragraph,                    // ← Paragraph comes BEFORE pipe_table
  $.indented\_code\_block,
  $.block\_quote,
  $.thematic\_break,
  $.list,
  $.fenced\_code\_block,
  $.\_blank\_line,
  $.html\_block,
  $.link\_reference\_definition,
  common.EXTENSION\_PIPE\_TABLE ? $.pipe\_table : choice()  // ← Conditional
)
```

**Critical Detail:** Pipe table comes AFTER paragraph in choice order.

### Scanner Logic for '|'
```c
// In scan() function, switch statement for lookahead
case '|':
    if (lexer->lookahead != '\r' && lexer->lookahead != '\n' &&
        valid_symbols[PIPE_TABLE_START]) {
        return parse_pipe_table(s, lexer, valid_symbols);
    }
    // Fall through or return false
```

### Conflicts Array
```javascript
conflicts: $ => [
  [$.link_reference_definition],
  [$.link_label, $._line],
  [$.link_reference_definition, $._line]
]
```

**Key Observation:** NO conflict declared between pipe_table and paragraph!

### Why It Works for Them

The key difference: Their scanner is called **before any block rule commits**. The extensive external token set means:

1. Parser sees start of line
2. Immediately calls external scanner
3. Scanner examines lookahead and determines which block type is starting
4. Returns appropriate START token (PIPE_TABLE_START, BLOCK_QUOTE_START, etc.)
5. Grammar uses that token to enter the correct rule

**Their approach:** External scanner acts as a **block type classifier** at line beginnings.

---

## 2. tree-sitter-python

**Repository:** https://github.com/tree-sitter/tree-sitter-python

### Externals Array
```javascript
externals: $ => [
  $.\_newline,
  $.\_indent,           // ← State management
  $.\_dedent,           // ← State management
  $.string_start,
  $.\_string\_content,
  $.escape_interpolation,
  $.string_end,
  $.comment,
  // Closing brackets for dedent management
  ']', ')', '}',
  'except'
]
```

**Key Observation:** External tokens manage **indentation state**, not content disambiguation.

### How INDENT/DEDENT Works

```javascript
_suite: $ => choice(
  alias($.\_simple_statements, $.block),
  seq($.\_indent, $.block),      // ← External token starts block
  alias($.\_newline, $.block)
),

block: $ => seq(
  repeat($.\_statement),
  $.\_dedent                      // ← External token ends block
)
```

### Scanner Logic
```c
// Simplified scanner logic
bool scan(Scanner *scanner, TSLexer *lexer, const bool *valid_symbols) {
    // Measure whitespace at line start
    int indent_length = 0;
    while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
        indent_length += (lexer->lookahead == '\t') ? 8 : 1;
        lexer->advance(lexer, true);
    }

    int current_indent = scanner->indents.size > 0 ?
        scanner->indents.contents[scanner->indents.size - 1] : 0;

    // Emit INDENT if increased
    if (valid_symbols[INDENT] && indent_length > current_indent) {
        array_push(&scanner->indents, indent_length);
        lexer->result_symbol = INDENT;
        return true;
    }

    // Emit DEDENT if decreased
    if (valid_symbols[DEDENT] && indent_length < current_indent) {
        array_pop(&scanner->indents);
        lexer->result_symbol = DEDENT;
        return true;
    }

    // ... NEWLINE handling
}
```

### Conflicts Array
Not shown in research, but likely minimal since indentation is unambiguous once measured.

### Why It Works

Python's approach is **fundamentally different**:
- External tokens represent **state transitions** (indent level changes), not content types
- Indentation is **unambiguous** - you measure it, no parsing needed
- The grammar is **structured around** these state tokens

**Not applicable to our pipe table problem** because '|' doesn't represent a state transition - it's a content delimiter that conflicts with inline parsing.

---

## 3. tree-sitter-ruby

**Repository:** https://github.com/tree-sitter/tree-sitter-ruby

### Externals Array (Subset)
```javascript
externals: $ => [
  $.\_line\_break,
  $.\_no\_line\_break,
  // Delimited literals
  $.simple\_symbol,
  $.\_string\_start,
  $.\_symbol\_start,
  $.\_subshell\_start,
  $.\_regex\_start,
  $.\_string\_array\_start,
  $.\_symbol\_array\_start,
  $.\_heredoc\_body\_start,      // ← Heredoc tokens
  $.string\_content,
  $.heredoc\_content,           // ← Heredoc tokens
  $.\_string\_end,
  $.heredoc\_end,               // ← Heredoc tokens
  $.heredoc\_beginning,         // ← Heredoc tokens
  // Tokens that require lookahead
  '/',
  $.\_block\_ampersand,
  // ... many more (30+ tokens)
]
```

### Heredoc Handling

Ruby's heredocs are interesting because they have **delayed processing**:

```ruby
puts <<EOF
  content
EOF
```

The `<<EOF` marker appears inline, but the content follows later. The external scanner:
1. Recognizes `heredoc_beginning` when it sees `<<`
2. Returns `heredoc_body_start` at the appropriate line
3. Returns `heredoc_end` when delimiter is reached

### Conflicts Array
**NONE** - Ruby uses precedence exclusively.

### Precedence Approach
```javascript
// Defined precedence levels at top of grammar
const PREC = {
  COMMENT: -2,
  LAMBDA_BODY: 0,
  RESCUE: 1,
  // ... 50+ precedence levels
  CALL: 56,
  NOT: 57,
  DEFINED: 58,
}

// Used throughout grammar
binary_expression: $ => choice(
  prec.left(PREC.AND, seq($.\_expression, 'and', $.\_expression)),
  prec.left(PREC.OR, seq($.\_expression, 'or', $.\_expression)),
  // ... many more with explicit precedence
)
```

### Why It Works

Ruby's approach:
- **Distinctive syntax**: Heredocs start with `<<`, not ambiguous with other constructs
- **Delayed processing**: Content appears later, so no immediate ambiguity
- **Precedence hierarchy**: 50+ levels ensure unambiguous parsing

**Lesson for pipe tables:** We need either (a) distinctive starting token or (b) explicit conflicts declaration.

---

## 4. tree-sitter-typescript

**Repository:** https://github.com/tree-sitter/tree-sitter-typescript

### Externals Array
```javascript
externals: ($, previous) => previous.concat([
  $.\_function\_signature\_automatic\_semicolon,
  $.\_\_error\_recovery
])
```

**Key Observation:** Very minimal! TypeScript inherits most externals from JavaScript, then adds only 2 more.

### Conflicts Array (Partial)
```javascript
conflicts: ($, previous) => previous.concat([
  // Generic vs comparison
  [$.call_expression, $.instantiation_expression, $.binary_expression],
  [$.call_expression, $.instantiation_expression, $.binary_expression, $.unary_expression],

  // Type vs value contexts
  [$.nested_identifier, $.nested_type_identifier, $.primary_expression],
  [$.primary_expression, $.literal_type],

  // Tuple vs array
  [$.tuple_type, $.array_type, $.readonly_type],

  // Many more - 30+ conflict scenarios
])
```

**Key Observation:** EXTENSIVE conflicts array! TypeScript explicitly declares dozens of ambiguous situations.

### JSX Ambiguity Handling

The famous `<Foo>` ambiguity (is it generic or JSX?):

```javascript
// In define-grammar.js
const dialect = require('../dialect');

module.exports = function defineGrammar(languageName) {
  return grammar(require('../javascript/grammar'), {
    name: languageName,

    rules: {
      primary_expression: ($, previous) => {
        const choices = [
          ...previous.members,
          // Only include JSX if dialect is 'tsx'
          ...(dialect === 'tsx' ? [
            $.jsx_element,
            $.jsx_fragment,
          ] : [])
        ];
        return choice(...choices);
      },
    },
  });
}
```

**They solve it with separate grammars**: `typescript` vs `tsx`.

### Why It Works

TypeScript's approach:
- **Explicit conflicts**: Declare all ambiguities upfront
- **Separate dialects**: Split JSX into separate grammar variant
- **Rely on GLR**: Let the parser explore multiple paths, conflicts array tells it which are OK

**Lesson for pipe tables:** We should add `[$.pipe_table, $.paragraph]` to conflicts array!

---

## 5. tree-sitter-bash

**Repository:** https://github.com/tree-sitter/tree-sitter-bash

### Externals Array (Subset)
```javascript
externals: $ => [
  $.heredoc\_start,              // ← Heredoc tokens
  $.simple\_heredoc\_body,
  $.heredoc\_content,
  $.heredoc\_end,
  $.file\_descriptor,
  $.variable\_name,
  $.test\_operator,
  $.regex,
  $.\_expansion\_word,
  $.\_empty\_value,
  $.\_concat,
  $.\_simple\_heredoc\_body,
  $.\_heredoc\_body\_beginning,
  // ... more
]
```

### Conflicts Array
```javascript
conflicts: $ => [
  [$.expression, $.command_name],
  [$.command, $.variable_assignments],
  [$.redirected_statement, $.command],
  [$.function_definition, $.command_name],
  // ... more
]
```

**Key Observation:** Both extensive externals AND conflicts arrays.

### Heredoc Handling

Bash heredocs are even more complex than Ruby's:

```bash
cat <<-EOF
\tcontent with tab
EOF
```

The scanner:
1. Detects `<<` or `<<-` (strip tabs)
2. Captures delimiter (`EOF`)
3. Returns `heredoc_start`
4. Tracks nesting level
5. Returns `heredoc_end` when delimiter matched

### Why It Works

Bash approach:
- **State machine**: Scanner maintains complex state for heredocs, expansions, etc.
- **Explicit conflicts**: Grammar declares known ambiguities
- **Lookahead**: Scanner does multi-character lookahead to determine context

**Lesson for pipe tables:** Complex state tracking possible but may be overkill for our use case.

---

## 6. tree-sitter-org

**Repository:** https://github.com/milisims/tree-sitter-org

### Externals Array
```javascript
externals: $ => [
  $.\_liststart,
  $.\_listend,
  $.\_listitemend,
  $.bullet,
  $.\_stars,             // ← Heading markers
  $.\_sectionend,
  $.\_eof,
]
```

**Key Observation:** Much smaller than Markdown, focused on specific constructs.

### Table Grammar Structure
```javascript
table: $ => prec.right(seq(
  optional($.\_directive\_list),
  repeat1(choice($.row, $.hr)),
  repeat($.formula)
)),

row: $ => seq(
  '|',                    // ← Starts with '|'
  optional($._contents),
  repeat(seq('|', optional($._contents))),
  optional('|'),
  $.\_eol
),

hr: $ => seq('|', $.\_hrtext, $.\_eol),
```

**Critical Detail:** Table row starts directly with '|' - NO external token for validation!

### How Do They Avoid Ambiguity?

Looking at the `_block` choice:
```javascript
_block: $ => choice(
  $.table,              // ← Table comes first
  $.list,
  $.drawer,
  $.para,               // ← Paragraph comes later
  // ...
)
```

**Key Observation:** Table has HIGHER priority than paragraph in choice order!

### Conflicts Array
```javascript
conflicts: $ => [
  [$.headline, $.taglist],
  [$.drawer, $.property, $._contents],
  [$.\_end_block_markup, $.end_block],
  // ... various entry and list conflicts
]
```

No explicit table vs paragraph conflict.

### Why It Works

Org-mode's approach:
- **Priority through ordering**: Table comes before paragraph in choice
- **Distinctive patterns**: Full table rows have multiple '|' characters
- **Context clues**: Org tables usually have clear delimiters

**Potential lesson:** Try placing `pipe_table` BEFORE `paragraph` in our `_block` choice order!

---

## Comparison Matrix

| Grammar | Externals Count | Conflicts Array | Ambiguous Start Chars | Resolution Strategy |
|---------|----------------|-----------------|----------------------|---------------------|
| **Markdown** | 40+ | Minimal (3 conflicts) | Many (`#`, `>`, `-`, `*`, `|`) | External scanner classifies block types |
| **Python** | ~10 | Not shown | None (whitespace unambiguous) | State management (INDENT/DEDENT) |
| **Ruby** | 30+ | None | Few (`<<`, `/`) | Heavy precedence (50+ levels) |
| **TypeScript** | 2 (+ JS base) | Extensive (30+) | `<` (generic vs JSX) | Explicit conflicts + separate dialects |
| **Bash** | 15+ | Moderate (5+) | Several (`$`, `<<`, `(`) | State tracking + conflicts |
| **Org** | ~7 | Moderate (10+) | `*`, `|`, `:` | Priority through choice ordering |

---

## Key Insights for Our Pipe Table Problem

### Pattern 1: External Scanner as Block Classifier (Markdown)

**How it works:**
- Scanner is called at the beginning of lines
- Examines lookahead to determine block type
- Returns START token (PIPE_TABLE_START, BLOCK_QUOTE_START, etc.)
- Grammar uses that token to enter correct rule
- External token comes BEFORE the distinctive character

**Why we're not doing this:**
Our goal is a "minimal external scanner" that only handles pipe tables, not all blocks. We've successfully moved headings, lists, block quotes, etc. to pure grammar rules. Reverting to Markdown's approach would mean moving everything back to the scanner.

**Status:** Not our desired architecture.

### Pattern 2: Choice Ordering (Org-mode)

**How it works:**
```javascript
_block: $ => choice(
  $.pipe_table,    // ← Try this first
  $.paragraph,     // ← Then this
  // ...
)
```

Put the more specific rule (pipe_table) before the more general rule (paragraph).

**Why it might work:**
Tree-sitter tries alternatives in order. If pipe_table matches, it commits. If not, it tries paragraph.

**Current state:** We have paragraph BEFORE pipe_table in choice order (inherited from Markdown).

**Action item:** **Try moving pipe_table before paragraph!**

### Pattern 3: Explicit Conflicts (TypeScript)

**How it works:**
```javascript
conflicts: $ => [
  [$.pipe_table, $.paragraph],
  // Tell tree-sitter it's OK for these to be ambiguous
  // Let GLR explore both paths
]
```

**Why it might work:**
Our problem is that the parser can't decide between pipe_table and paragraph when it sees '|'. Declaring this conflict explicitly tells tree-sitter "yes, this is ambiguous, and that's OK - explore both paths."

**Current state:** We have NO conflicts in our grammar.

**Action item:** **Add conflict declaration for pipe_table vs paragraph!**

### Pattern 4: High Precedence (Ruby)

**How it works:**
```javascript
pipe_table: $ => prec(10, seq(
  '|',
  // ...
)),

paragraph: $ => prec.left(-2, seq(
  // ...
))
```

Give pipe_table very high precedence, paragraph very low.

**Current state:** We have `prec(1)` on pipe_table, `prec.left(-2)` on paragraph.

**Status:** Already doing this, but maybe precedence isn't high enough?

### Pattern 5: External Token Position After Concrete Token

**Current issue:**
```javascript
// Our current structure
pipe_table_header: $ => seq(
  '|',
  $.pipe_table_start,  // External token AFTER '|'
  // ...
)
```

Parser sees '|' and has to decide: try pipe_table or parse as inline?
By the time it tries pipe_table and requests pipe_table_start, it may have already committed to paragraph.

**Markdown's structure:**
```javascript
// tree-sitter-markdown structure
pipe_table: $ => seq(
  $.\_pipe\_table\_start,  // External token BEFORE '|'
  $.pipe_table_row,     // Row starts with '|'
  // ...
)
```

External token comes first, so scanner is called BEFORE any concrete token is consumed.

**Problem:** But we found that doesn't work either! Parser doesn't know to request PIPE_TABLE_START until it tries the pipe_table rule, and it won't try that rule without seeing something distinctive.

**Chicken and egg:**
- Can't try pipe_table without seeing something distinctive
- Can't see PIPE_TABLE_START (distinctive) without trying pipe_table

---

## Recommended Experiments

Based on research, here's what to try (in order):

### Experiment 1: Add Conflict Declaration ⭐⭐⭐

```javascript
module.exports = grammar({
  name: 'pandoc_markdown',

  externals: $ => [
    $.pipe_table_start,
  ],

  conflicts: $ => [
    [$.pipe_table, $.paragraph],           // ← ADD THIS
    [$.pipe_table_header, $._inline],       // ← Maybe also this
  ],

  // ... rest of grammar
```

**Rationale:** TypeScript shows that explicit conflicts allow GLR to explore both paths. This tells tree-sitter "yes, '|' could start either pipe_table or paragraph (which contains inline), try both."

**Expected result:** Parser explores both pipe_table and paragraph paths when it sees '|'.

### Experiment 2: Reorder Block Choices ⭐⭐

```javascript
_block: $ => choice(
  $.atx_heading,
  $.setext_heading,
  $.block_quote,
  $.pipe_table,          // ← Move BEFORE paragraph
  $.footnote_definition,
  $.link_reference_definition,
  $.fenced_div,
  $.display_math,
  $.shortcode_block,
  $.raw_block,
  $.paragraph,           // ← After pipe_table
  $.html_block,
  $.fenced_code_block,
  $.list,
  $.thematic_break,
  $.blank_line
),
```

**Rationale:** Org-mode successfully parses tables by trying them before paragraphs.

**Expected result:** When parser sees '|', it tries pipe_table first.

### Experiment 3: Make External Token Truly Block-Level ⭐

Move PIPE_TABLE_START to before the '|':

```javascript
pipe_table: $ => seq(
  $.pipe_table_start,      // BEFORE any concrete token
  $.pipe_table_header,     // Header starts with '|'
  $.pipe_table_delimiter,
  repeat1($.pipe_table_row)
),

pipe_table_header: $ => seq(
  '|',                     // Now '|' is inside header, not at pipe_table level
  optional(alias(token(/[^\r\n|]+/), $.pipe_table_header_cell)),
  repeat1(seq('|', optional(alias(token(/[^\r\n|]+/), $.pipe_table_header_cell)))),
  /\r?\n/
),
```

**Rationale:** Matches Markdown's structure. External token at pipe_table level, not nested inside header.

**Problem:** We tried this and it timed out. But maybe combined with conflicts declaration it would work?

### Experiment 4: Increase Precedence ⭐

```javascript
pipe_table: $ => prec(100, seq(    // Very high precedence
  // ...
)),
```

**Rationale:** Force parser to strongly prefer pipe_table when there's ambiguity.

**Skepticism:** Precedence usually affects operator precedence and choice within expressions, not top-level block disambiguation. But worth trying.

### Experiment 5: Dynamic Precedence

```javascript
pipe_table: $ => prec.dynamic(10, seq(
  // ...
)),

paragraph: $ => prec.dynamic(-10, seq(
  // ...
)),
```

**Rationale:** `prec.dynamic()` affects runtime disambiguation in GLR, while `prec()` affects grammar generation. Maybe we need runtime disambiguation?

**From tree-sitter docs:**
> "Dynamic precedence is used when two rules overlap and tree-sitter's default choice is undesirable."

This sounds exactly like our problem!

---

## The Root Cause (Hypothesis)

After all this research, here's my hypothesis for why we're failing:

1. **Markdown works because:** Their external scanner is called at the START of block parsing, before any rule commits. The scanner acts as a **block type classifier**.

2. **We're failing because:** We're trying to have our cake and eat it too:
   - We want grammar rules to handle most blocks (good for maintainability)
   - We want scanner to only handle pipe tables (minimal complexity)
   - But parser needs to DECIDE whether to try pipe_table before it can REQUEST pipe_table_start
   - With '|' appearing in inline content, parser may commit to paragraph before trying pipe_table

3. **The missing piece:** We haven't declared the conflict. The parser doesn't KNOW that '|' creates ambiguity between pipe_table and paragraph. Without that knowledge, it just picks one path (probably paragraph because it comes first in choice order).

---

## Recommended Next Actions

1. **Experiment 1 first** (add conflicts array)
2. **If that fails, try Experiment 2** (reorder block choices)
3. **If both fail, combine them** (conflicts + reordering)
4. **If still failing, try Experiment 5** (dynamic precedence)
5. **Last resort:** Move to Markdown's full external scanner approach (but this defeats our "minimal scanner" goal)

---

## Additional Resources

- **Tree-sitter Documentation on Conflicts:** https://tree-sitter.github.io/tree-sitter/creating-parsers#conflicting-tokens
- **Tree-sitter Dynamic Precedence:** https://tree-sitter.github.io/tree-sitter/creating-parsers#dynamic-precedence
- **Python Scanner:** https://github.com/tree-sitter/tree-sitter-python/blob/master/src/scanner.c
- **TypeScript Conflicts:** https://github.com/tree-sitter/tree-sitter-typescript/blob/master/common/define-grammar.js

---

## Conclusion

The research reveals that our approach is **unusual but not wrong**:
- Markdown uses external scanner for ALL blocks (we only use it for pipe tables)
- Python uses external scanner for STATE MANAGEMENT (we use it for disambiguation)
- TypeScript uses CONFLICTS ARRAY for disambiguation (we haven't tried this yet)
- Org-mode uses CHOICE ORDERING (we haven't tried this yet)

**Most promising path:** Combine conflicts array + choice reordering + dynamic precedence.

**Nuclear option:** Expand external scanner to handle all block starts (like Markdown), but this violates our minimal scanner principle.
