# Architecture Overview

This document provides detailed technical information about the tree-sitter-pandoc-markdown parser architecture.

---

## Table of Contents

- [Two-Grammar Architecture](#two-grammar-architecture)
- [External Scanner Design](#external-scanner-design)
- [Grammar-First Approach](#grammar-first-approach)
- [Complete Feature List](#complete-feature-list)
- [Not Yet Implemented](#not-yet-implemented)

---

## Two-Grammar Architecture

The project ships two separate but related grammars:

- **Block grammar** (`tree-sitter-pandoc-markdown/`): Document structure (headings, lists, code blocks, tables, etc.)
- **Inline grammar** (`tree-sitter-pandoc-markdown-inline/`): Inline formatting (emphasis, links, citations, math, etc.)

### Key Technical Details

- **ABI version 14** for Zed editor compatibility
- **Minimal external scanner** - Only handles `pipe_table_start` token
- **Grammar-first approach** - All other constructs handled by pure grammar rules
- **Shared common code** in `common/` directory

### Why Separate Grammars?

This architecture follows the CommonMark specification's two-phase parsing strategy:

1. **Phase 1:** Parse block structure (paragraphs, lists, code blocks, etc.)
2. **Phase 2:** Parse inline content within blocks (emphasis, links, etc.)

**Rationale:** Block structure determines context for inline parsing. For example, code blocks disable inline parsing, and list indentation affects inline parsing rules.

**📖 See [architecture-rationale.md](architecture-rationale.md) for complete explanation of why grammars should NOT be unified.**

---

## External Scanner Design

The external scanner in `scanner.c` is intentionally minimal.

### Scanner Responsibilities

**Only emits:** `pipe_table_start` token (for detecting pipe table structures)

**Does NOT handle:**
- Headings (grammar handles via regex)
- Block quotes (grammar handles)
- Lists (grammar handles)
- Thematic breaks (grammar handles)
- Any inline constructs (grammar handles)

### Design Rationale

This minimal design prevents scanner interference with grammar rules. The scanner returns `false` for all cases except when `pipe_table_start` is valid, ensuring clean separation between scanner-based and grammar-based parsing.

**Historical note:** The scanner.c originated from tree-sitter-markdown (which uses external scanner extensively with 40+ token types). We modified it to only handle pipe tables, allowing our standalone grammar to control all other syntax.

---

## Grammar-First Approach

**Philosophy:** Implement features in pure grammar rules whenever possible. Only use external scanner when absolutely necessary for disambiguation.

### Constructs Handled by Grammar (Not Scanner)

**Block-level:**
- ATX and Setext headings
- Block quotes with nesting
- Lists (ordered and unordered)
- Thematic breaks
- Fenced code blocks
- Fenced divs
- YAML front matter
- Percent metadata
- HTML blocks
- Display math
- Raw blocks
- Footnote definitions
- Link reference definitions
- Shortcodes

**Inline-level:**
- All emphasis variants (single, strong)
- Code spans
- Raw inline
- Links and images (all styles)
- Autolinks
- HTML inline tags
- Attribute lists and spans
- Citations and cross-references
- Footnote references (regular and inline)
- Inline math
- Strikethrough, subscript, superscript
- Highlight and underline

### Benefits

- Grammar rules are declarative and readable
- Easier testing and debugging
- Better tree-sitter conflict resolution
- More predictable parsing behavior
- Reduced scanner complexity

---

## Complete Feature List

### Block-Level Constructs (20 features)

1. **ATX headings** - `#` through `######`
2. **Setext headings** - Underlined with `=` or `-`
3. **Block quotes** - `>` with nesting support
4. **Fenced code blocks** - ` ``` ` with language and chunk options (`#|`)
5. **HTML blocks** - Raw HTML block elements
6. **Fenced divs** - `:::` with attributes
7. **YAML front matter** - `---` delimited metadata blocks
8. **Percent metadata** - `% Title`, `% Author`, `% Date`
9. **Pipe tables** - With alignment markers (`|---|:---|---:|:---:|`)
10. **Display math** - `$$...$$` LaTeX equations
11. **Raw blocks** - ` ```{=format} ` for format-specific content
12. **Footnote definitions** - `[^1]: Footnote text`
13. **Link reference definitions** - `[ref]: url "title"`
14. **Shortcode blocks** - `{{< name >}}` and `{{% name %}}`
15. **Ordered lists** - `1.`, `2.`, etc. with nesting
16. **Unordered lists** - `*`, `-`, `+` with nesting
17. **Thematic breaks** - `---`, `***`, `___`
18. **Paragraphs** - With inline content
19. **Line breaks** - Hard breaks in text
20. **Blank lines** - Document spacing

### Inline-Level Constructs (22 features)

1. **Emphasis** - `*text*` and `_text_`
2. **Strong emphasis** - `**text**` and `__text__`
3. **Code spans** - `` `code` ``
4. **Raw inline** - `` `code`{=format} ``
5. **Inline links** - `[text](url "title")`
6. **Reference links** - `[text][ref]`
7. **Inline images** - `![alt](url "title")`
8. **Reference images** - `![alt][ref]`
9. **Autolinks** - `<http://url>` and `<email@example.com>`
10. **HTML inline tags** - `<span>`, `<em>`, etc.
11. **Attribute lists** - `{.class #id key=val}`
12. **Attribute spans** - `[text]{.attrs}`
13. **Citations** - `@key`, `[@key]`, `@key [p. 4]`
14. **Cross-references** - `@fig:id`, `@tbl:id`, `@sec:id`
15. **Footnote references** - `[^1]`
16. **Inline footnotes** - `^[footnote text]`
17. **Inline math** - `$...$` LaTeX equations
18. **Strikethrough** - `~~text~~`
19. **Highlight** - `==text==`
20. **Subscript** - `~text~`
21. **Superscript** - `^text^`
22. **Underline** - `+text+`

**Total: 42 fully implemented and tested features**

### Test Coverage

- **Block grammar:** 38 comprehensive tests (100% passing)
- **Inline grammar:** 29 comprehensive tests (100% passing)
- **Total:** 67 tests covering all implemented features

---

## Not Yet Implemented

The following features require external scanner implementation and are planned for Phase 2:

### Definition Lists

**Syntax:**
```markdown
Term
: Definition paragraph
```

**Challenge:** Colon syntax conflicts with paragraphs containing colons.

**Status:** Requires context-aware scanner to distinguish definition lists from regular paragraphs.

### Line Blocks

**Syntax:**
```markdown
| This is a line block
| Each line preserved exactly
| Including  spacing
```

**Challenge:** `|` marker conflicts with pipe table delimiters.

**Status:** Deferred after extensive research. Both `LINE_BLOCK_START` and `PIPE_TABLE_START` external tokens become valid simultaneously, causing GLR parser conflicts.

**📖 See [options-for-proceeding.md](options-for-proceeding.md) for detailed analysis of 7 approaches to resolve this conflict.**

### Simple Tables

**Syntax:**
```markdown
  Right     Left     Center     Default
-------   ------ ----------   -------
     12   12        12            12
    123   123       123          123
      1   1          1             1
```

**Challenge:** Dash patterns conflict with:
- Setext headings (underlined with dashes)
- Thematic breaks (`---`)
- Pipe table alignment markers

**Status:** Requires external scanner to distinguish table separators from other uses of dashes.

### Grid Tables

**Syntax:**
```markdown
+---------------+---------------+--------------------+
| Fruit         | Price         | Advantages         |
+===============+===============+====================+
| Bananas       | $1.34         | - built-in wrapper |
|               |               | - bright color     |
+---------------+---------------+--------------------+
```

**Challenge:** Complex border syntax with `+`, `-`, `|`, and `=` characters.

**Status:** Requires sophisticated external scanner to track table structure.

---

## Implementation Roadmap

See [plan.md](plan.md) for complete implementation roadmap including:
- Phase 1A-1F completion details
- Phase 2 objectives (external scanner features)
- Technical challenges and solutions
- Test coverage tracking
- Next steps

---

## Performance Characteristics

### Parser Size Reduction

Compared to extending tree-sitter-markdown:

- **Block parser:** 78,882 lines (39% reduction from upstream)
- **Inline parser:** 82,387 lines (41% reduction from upstream)

### Benefits of Grammar-First Approach

- **Fewer external scanner calls** - Scanner only invoked at potential table boundaries
- **Direct grammar parsing** - Most constructs parsed without scanner overhead
- **Efficient parse tree construction** - Reduced state transitions
- **Fast test execution** - 67 focused tests run quickly

---

## Related Documentation

- **[architecture-rationale.md](architecture-rationale.md)** - Why separate grammars (and why NOT to unify them)
- **[plan.md](plan.md)** - Implementation roadmap and phases
- **[scanner-research.md](scanner-research.md)** - External scanner patterns across 6 grammars
- **[improvements.md](improvements.md)** - Complete changelog vs upstream

---

**Last Updated:** 2025-10-12
**Part of:** tree-sitter-pandoc-markdown documentation
