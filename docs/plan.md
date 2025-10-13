# Tree-sitter-pandoc-markdown: Implementation Plan

## Current Status

**Phase 1: Complete ✅** (2025-10-12)
- 80/80 tests passing (100%)
- 43 block-level features implemented
- 37 inline-level features implemented
- Comprehensive query files for editor integration
- Full documentation suite

See [improvements.md](./improvements.md) for detailed Phase 1 achievements.

**Phase 2: In Planning** - External scanner features requiring disambiguation

---

## Pending Work

### Phase 2: External Scanner Features

These features require external scanner implementation for disambiguation. They were deferred from Phase 1 due to pattern ambiguities that cannot be resolved with pure grammar rules.

#### 2.1 Definition Lists
**Status:** Not started (moved from Phase 1E)

**Syntax:**
```markdown
Term
:   Description paragraph

Another term
:   Another description
```

**Challenge:** Colon-led description marker (`: `) is indistinguishable from inline colons in normal paragraphs without lookahead.

**Requirements:**
- External scanner to detect `: ` at line start following a term
- Distinguish from inline colons in normal paragraphs
- Handle multi-paragraph descriptions with proper indentation
- Handle multiple terms with single description
- Handle lazy continuation lines

**Implementation Approach:**
1. Add `DEFINITION_LIST_MARKER` external token
2. Scanner checks for `: ` at line start after non-blank line
3. Grammar rule for `definition_list` with terms and descriptions
4. Test corpus with various edge cases

#### 2.2 Line Blocks
**Status:** Deferred (attempted 2025-10-11, requires grammar restructuring)

**Syntax:**
```markdown
| First line preserved exactly
| Second line with   extra spaces
|    Indented line
```

**Challenge:** The `|` marker conflicts with pipe table delimiters. Both `LINE_BLOCK_START` and `PIPE_TABLE_START` external tokens become valid simultaneously in many parse states, causing tree-sitter's GLR parser to explore conflicting paths.

**Root Cause Analysis:**
- Grammar structure allows both tokens to be valid at the same parse position
- GLR parser explores both line_block and pipe_table paths
- External token ambiguity causes parse errors in unrelated constructs
- Cannot be fixed with scanner logic alone - requires grammar restructuring

**Potential Solutions:**
1. **Grammar restructuring** - Ensure line_block and pipe_table are mutually exclusive in grammar contexts
2. **Additional context** - Require 2+ consecutive lines (single `| line` = paragraph)
3. **Alternative syntax** - Use `||` or Unicode variant (breaks Pandoc compatibility)
4. **Advanced scanner** - Complex state tracking with context-aware tokenization

**Decision Rationale:**
- Pipe tables are much more common than line blocks in practice
- Line blocks can be added later with proper grammar restructuring
- Pragmatic approach: ship working parser first, enhance later

**References:**
- `external-scanner-plan.md` - Initial implementation attempt
- `external-scanner-resources.md` - Research findings
- `options-for-proceeding.md` - Analysis of 7 possible approaches

#### 2.3 Simple Tables
**Status:** Not started (moved from Phase 1F)

**Syntax:**
```markdown
  Right     Left     Center     Default
-------     ------ ----------   -------
     12     12        12            12
    123     123       123          123
      1     1          1             1
```

**Challenge:** Dash separator patterns conflict with multiple constructs:
- Setext heading underlines (`===` or `---`)
- Thematic breaks (`---`)
- YAML front matter delimiters (`---`)
- Pipe table alignment markers (`:?-{3,}:?`)

**Requirements:**
- External scanner to detect table structure via column alignment
- Context-aware dash pattern disambiguation
- Detect header row followed by separator row with matching column positions
- Handle column alignment indicators (left, right, center, default)
- Support for multi-line cells and optional caption

**Implementation Approach:**
1. Add `SIMPLE_TABLE_START` external token
2. Scanner validates table structure (header + separator with aligned columns)
3. Grammar rules for rows, cells, alignment
4. Test corpus with various alignment and content patterns

#### 2.4 Grid Tables
**Status:** Not started (moved from Phase 1F)

**Syntax:**
```markdown
+---------------+---------------+--------------------+
| Fruit         | Price         | Advantages         |
+===============+===============+====================+
| Bananas       | $1.34         | - built-in wrapper |
|               |               | - bright color     |
+---------------+---------------+--------------------+
| Oranges       | $2.10         | - cures scurvy     |
|               |               | - tasty            |
+---------------+---------------+--------------------+
```

**Challenge:** Complex border syntax with `+`, `-`, and `|` characters. Likely faces similar pattern conflicts as line blocks and simple tables.

**Requirements:**
- External scanner to detect grid structure
- Multi-line border parsing (top, middle, bottom borders)
- Support for multi-line cells
- Column alignment detection
- Header separator row (with `=` characters)

**Implementation Approach:**
1. Add `GRID_TABLE_START` external token
2. Scanner validates grid structure (borders with matching column positions)
3. Grammar rules for borders, rows, cells
4. Handle complex nesting (lists, code blocks within cells)
5. Test corpus with various layouts and content

#### 2.5 Pipe Table Grammar Improvement
**Status:** Current implementation works but has limitations

**Current State:**
- Pipe tables parse correctly with `pipe_table_start` external token
- Basic cell/row structure implemented
- All pipe table tests passing

**Potential Improvements:**
1. **Adopt tree-sitter-markdown's complex cell patterns**
   - Better handling of optional leading/trailing whitespace
   - More robust cell content parsing
   - Explicit whitespace management

2. **Expand scanner to handle full table structure**
   - Move more parsing into scanner (not just start detection)
   - Simplified grammar rules
   - Trade-off: less editor integration (no per-cell highlighting)

3. **Add advanced features**
   - Table caption support
   - Multi-line cells
   - Inline formatting within cells

**Reference:** See `scanner-research.md` for detailed analysis

---

### Phase 2 Implementation Strategy

**Recommended Order:**
1. **Definition lists** - Simplest pattern, no conflicts with existing features
2. **Simple tables** - Moderate complexity, dash pattern disambiguation
3. **Grid tables** - Complex structure, builds on table experience
4. **Line blocks** - Most complex, requires grammar restructuring

**Success Criteria:**
- Working external scanner infrastructure for each feature
- No regressions in existing tests (80/80 continue passing)
- New corpus tests for each implemented feature
- Updated documentation (grammar.js comments, corpus/*.txt, queries/*.scm)
- Performance testing (scanner should not significantly slow parsing)

**Testing Approach:**
1. Start with minimal test cases in isolation
2. Use `tree-sitter parse --debug` to verify valid_symbols behavior
3. Add edge cases incrementally
4. Test interaction with existing features
5. Validate in real-world documents

**Documentation Requirements:**
- Update `plan.md` with implementation progress
- Document scanner logic in comments
- Add test cases with explanatory comments
- Update `readme.md` with feature status
- Note any known limitations or edge cases

---

## Phase 3: Future Enhancements

### 3.1 Additional Pandoc Features
- **Divs with nested block quotes** - Enhanced nesting support
- **Example lists** - Numbered example lists with `(@)` marker
- **Fancy lists** - Custom list markers (roman numerals, letters)
- **Bracketed spans** - Alternative span syntax `[text]`

### 3.2 Editor Integration
- **VSCode extension** - Package for VSCode marketplace
- **Neovim integration guide** - Setup instructions for nvim-treesitter
- **Zed editor guide** - Installation and configuration
- **Helix editor support** - Query file validation

### 3.3 Performance Optimization
- **Scanner profiling** - Identify bottlenecks
- **Grammar simplification** - Reduce parse states
- **Benchmark suite** - Test with large documents
- **Memory usage analysis** - Optimize tree structure

### 3.4 Error Recovery
- **Partial parse support** - Handle malformed markdown gracefully
- **Error messages** - Better diagnostics for syntax errors
- **Recovery strategies** - Continue parsing after errors

### 3.5 Tooling
- **CLI tool** - Standalone parser/validator
- **Language server** - LSP integration for editors
- **Formatter** - Markdown formatting tool
- **Linter** - Style checking and validation

### 3.6 Testing & Quality
- **Fuzzing** - Automated edge case discovery
- **CommonMark conformance** - Test against spec
- **Pandoc conformance** - Test against Pandoc output
- **Performance regression tests** - Catch slowdowns

---

## Phase 1 Summary (Completed)

**For full details, see [improvements.md](./improvements.md)**

### Implementation Phases Completed

- **Phase 1A:** Foundation (ABI 14, standalone grammars, test infrastructure)
- **Phase 1B:** Core Markdown features (headings, quotes, lists, code, links, images)
- **Phase 1C:** Pandoc extensions (divs, attributes, citations, shortcodes, YAML, chunk options)
- **Phase 1D:** Math & tables (inline/display math, pipe tables)
- **Phase 1E:** Document semantics (footnotes, strikethrough, subscript, superscript, attribute spans, highlight, underline)
- **Phase 1F:** Raw content (raw inline, raw blocks, percent metadata)
- **Phase 1G:** Query files (highlights, folds, tags, locals, textobjects, injections)

### Key Achievements

- **Architecture:** Fully standalone grammar, no git submodules
- **Features:** 42 Pandoc features fully implemented
- **Testing:** 80/80 tests passing (100% pass rate)
- **Documentation:** 3,100+ lines of technical documentation
- **Parser Size:** 39-41% reduction from upstream
- **ABI:** Version 14 enforced for Zed compatibility
- **Queries:** Comprehensive editor integration files

### Critical Bug Fixes

1. **External scanner interference** - Reduced scanner to single token
2. **YAML frontmatter highlighting** - Added injection queries
3. **Triple asterisk emphasis** - Fixed delimiter run algorithm
4. **Fenced div parsing** - Fixed closing delimiter precedence
5. **Comprehensive emphasis tests** - Added 7 edge case tests

---

## References

### Internal Documentation
- **[improvements.md](./improvements.md)** - Detailed Phase 1 achievements and changes
- **[architecture-rationale.md](./architecture-rationale.md)** - Why split block/inline grammars
- **[scanner-research.md](./scanner-research.md)** - External scanner patterns analysis
- **[options-for-proceeding.md](./options-for-proceeding.md)** - Decision analysis for line blocks
- **[external-scanner-plan.md](./external-scanner-plan.md)** - Line block implementation attempt
- **[external-scanner-resources.md](./external-scanner-resources.md)** - Research resources
- **[readme.md](./readme.md)** - Documentation index

### External Resources
- [Pandoc Manual](https://pandoc.org/MANUAL.html) - Pandoc Markdown specification
- [CommonMark Spec](https://spec.commonmark.org/) - Base Markdown specification
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/) - Parser generator docs
- [tree-sitter-markdown](https://github.com/tree-sitter-grammars/tree-sitter-markdown) - Reference implementation
- [Zed Editor Issue #24632](https://github.com/zed-industries/zed/issues/24632) - ABI version compatibility

---

**Document Version:** 2.0
**Last Updated:** 2025-10-13
**Branch:** feat/phase-1-pandoc-grammar
**Status:** Phase 1 Complete ✅ | Phase 2 In Planning
