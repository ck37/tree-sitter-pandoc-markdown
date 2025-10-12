# Known Issues

This document tracks known parser limitations and bugs discovered during testing (as of 2025-10-12).

## Phase 2 Features (Not Yet Implemented)

These features are planned but require external scanner work:

### 1. Pipe Tables
**Status**: External scanner work in progress
**Issue**: Tables parse as ERROR nodes. The `pipe_table_start` external token implementation has fundamental issues with grammar structure.

**Example that fails**:
```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| A    |   B    |     C |
```

**Reference**: See docs/plan.md lines 297-401 for detailed debugging history.

**Workaround**: Use tables in code blocks for documentation purposes.

### 2. Definition Lists
**Status**: Not started (moved from Phase 1E)
**Issue**: Colon-led description marker indistinguishable from ordinary paragraph lines without lookahead.

**Example syntax** (not yet supported):
```markdown
Term
:   Description paragraph
```

**Reference**: See docs/plan.md line 119-121.

### 3. Line Blocks
**Status**: Deferred
**Issue**: Both `LINE_BLOCK_START` and `PIPE_TABLE_START` external tokens become valid simultaneously, causing GLR parser conflicts.

**Example syntax** (not yet supported):
```markdown
| First line preserved exactly
| Second line with   extra spaces
```

**Reference**: See docs/plan.md lines 491-545 for detailed analysis.

### 4. Simple Tables & Grid Tables
**Status**: Not attempted
**Issue**: Expected to have similar external scanner requirements as pipe tables.

## Grammar Bugs

~~None currently known~~ (Fenced div bug fixed 2025-10-12)

## Edge Cases / Limitations

### 1. Triple Asterisks (Nested Bold + Italic)
**Status**: Limitation
**Severity**: Low - rare usage

**Issue**: `***both bold and italic***` doesn't parse correctly. The parser interprets this as emphasis/strong conflicts.

**Example that fails**:
```markdown
Regular text with ***both bold and italic***.
```

**Workaround**: Use nested formatting:
```markdown
**bold with *italic* inside**
```

**Notes**: Not tested in corpus (tree-sitter-pandoc-markdown-inline/test/corpus/foundation.txt has no `***` tests).

### 2. Cross-References After Colons
**Status**: Edge case
**Severity**: Low - specific phrasing issue

**Issue**: When cross-references appear after colons at end of line, the colon can be misinterpreted as setext heading marker.

**Example that fails**:
```markdown
Cross-reference: See @fig:results

Next paragraph.
```

**Workaround**: Rephrase to avoid colon before cross-reference:
```markdown
Figure reference @fig:results and table reference @tbl:data
```

### 3. Percent Metadata Mid-Document
**Status**: Limitation (by design)
**Severity**: None - correct Pandoc behavior

**Issue**: Percent metadata (`% Title`, `% Author`, `% Date`) must appear at document start, not mid-document.

**Example that fails**:
```markdown
# Introduction

Some content...

% Title
% Author
% Date
```

**Workaround**: Use percent metadata only at document start, or use YAML front matter instead.

## Test Coverage

**Passing Tests**: 73/73 (100%)
- Block grammar: 44/44 tests (added "Fenced div with content after")
- Inline grammar: 29/29 tests

**Example Files**:
- `examples/simple-test.md` - ✅ Parses with ZERO errors
- `examples/feature-showcase.md` - ✅ Parses with ZERO errors (after workarounds applied)
- `examples/comprehensive-example.md` - ⚠️ Has known issues with tables/divs

## Reporting Issues

When reporting new parsing issues, please include:

1. Minimal reproducible example
2. Output of `tree-sitter parse your-file.md`
3. Expected vs actual parse tree
4. Tree-sitter version and ABI version (should be 14)

Run parser with debug output:
```bash
tree-sitter parse --debug your-file.md
```
