# Improvement planning

## Current Status

See [improvements.md](./improvements.md) for detailed Phase 1 achievements.

## Pending Work

### Phase 2: External Scanner Features

These features require external scanner implementation for disambiguation. They were deferred from Phase 1 due to pattern ambiguities that cannot be resolved with pure grammar rules.

#### 2.1 Definition Lists
**Status:** Cannot be implemented (attempted 2025-10-13, blocked by tree-sitter LR(1) limitations)

**Syntax:**
```markdown
Term
:   Description paragraph

Another term
:   Another description
```

**Challenge:** Requires lookahead that is fundamentally incompatible with LR(1) parsing.

**Root Cause Analysis:**
- Definition terms are structurally identical to paragraphs until the next line is examined
- Tree-sitter's LR(1) parser commits to `paragraph` rule before checking if next line has definition marker
- External scanner is only called AFTER grammar rule selection, not before
- GLR conflicts only help when both paths are viable at the same parse state - they don't help with rule selection
- Three different implementation approaches attempted, all failed due to same fundamental limitation

**Attempted Approaches (2025-10-13):**
1. **GLR with dynamic precedence**: Parser commits to paragraph before GLR exploration begins
2. **Setext heading pattern**: Same issue - paragraph matches before definition_list_item is tried
3. **Scanner-driven lookahead with DEFINITION_TERM_START**: Scanner never called because parser doesn't try definition_list path

**Why This Is Impossible in Tree-sitter:**
- Tree-sitter uses LR(1) parsing with single token lookahead
- LR parsers must decide which grammar rule to try BEFORE calling external scanner
- External scanner cannot influence grammar rule selection - only provide tokens for already-selected rules
- Definition lists need to examine line N+1 to decide how to parse line N (multi-token lookahead)
- No backtracking after a rule succeeds (paragraph matches "Term\n" perfectly)

**Evidence This Is a Known Limitation:**
- Tree-sitter documentation confirms: "only one token of look-ahead is available"
- Community discussions ([tree-sitter#1005](https://github.com/tree-sitter/tree-sitter/issues/1005), [tree-sitter#1252](https://github.com/tree-sitter/tree-sitter/issues/1252)) document this limitation
- Stack Overflow: "if the scanner C code identifies a token and returns it, TS will not backtrack"

**Alternatives:**
1. **Post-processing**: Parse as paragraphs, then identify definition list patterns in post-processing
2. **Different parser**: Use a parser generator that supports arbitrary lookahead
3. **Accept limitation**: Document that definition lists are not supported in tree-sitter-pandoc-markdown

**Recommendation:** Accept limitation and document. This is not a bug or implementation flaw - it's an architectural constraint of LR(1) parsing that cannot be worked around.

**External Validation:** The [Quarto Markdown Parser](https://github.com/quarto-dev/quarto-markdown) project independently reached identical conclusions: "Definition lists offer the same problem. There's no way to know that the following construct isn't a paragraph followed by something else without parsing the entire paragraph first. We will also not support definition lists directly." See [quarto-parser-comparison.md](./quarto-parser-comparison.md) for detailed architectural comparison.

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
**Status:** Cannot be implemented (attempted 2025-10-13, blocked by tree-sitter LR(1) limitations)

**Syntax:**
```markdown
  Right     Left     Center     Default
-------     ------ ----------   -------
     12     12        12            12
    123     123       123          123
      1     1          1             1
```

**Challenge:** Requires lookahead that is fundamentally incompatible with LR(1) parsing.

**Root Cause Analysis:**
- Header rows are structurally identical to paragraphs until the separator row is examined
- Separator rows look like setext heading underlines (`---`) until multiple dash groups with whitespace gaps are detected
- Tree-sitter's LR(1) parser commits to `paragraph` or `setext_heading` rules before detecting simple table pattern
- External scanner is only called AFTER grammar rule selection, not before
- Simple tables need to examine line N+1 to decide how to parse line N (multi-line lookahead)
- No backtracking after a rule succeeds (paragraph matches "Header\n" perfectly)

**Attempted Approaches (2025-10-13):**
1. **Scanner validation of separator row**: Implemented parse_simple_table() that detects multiple dash groups with whitespace gaps (scanner.c:1317-1389)
2. **Grammar rules with external token**: Added SIMPLE_TABLE_START external token and grammar rules (grammar.js:295-367)
3. **Test corpus**: Created 14 comprehensive test cases (test/corpus/simple-tables.txt)

**Why This Failed:**
- Parser sees header text and commits to `paragraph` rule
- Parser sees separator row (`-------  -----`) and commits to `setext_heading` rule (paragraph + dash underline)
- Grammar never tries `simple_table` rule, so scanner is never called for SIMPLE_TABLE_START
- Even if scanner were called, parser cannot backtrack after committing to paragraph

**Dash Pattern Conflicts:**
- Setext heading underlines: `===` or `---` (continuous dashes)
- Thematic breaks: `---` (continuous dashes, no preceding text)
- YAML front matter delimiters: `---`
- Pipe table alignment markers: `:?-{3,}:?`
- Simple table separators: `-------  -----` (multiple dash groups with 2+ spaces)

The separator row pattern IS distinctive (multiple dash groups vs continuous), but this doesn't help because:
1. By the time parser sees separator row, it already committed to paragraph for header
2. Setext heading rule matches (paragraph + dash line = heading)
3. Parser never explores simple_table path

**Why This Is Impossible in Tree-sitter:**
- Tree-sitter uses LR(1) parsing with single token lookahead
- LR parsers must decide which grammar rule to try BEFORE calling external scanner
- External scanner cannot influence grammar rule selection - only provide tokens for already-selected rules
- Simple tables need multi-token lookahead (examine entire next line to determine current line's type)
- No backtracking after a rule succeeds

**Evidence This Is a Known Limitation:**
- Same root cause as definition lists (plan.md:14-56)
- Tree-sitter documentation confirms: "only one token of look-ahead is available"
- Community discussions ([tree-sitter#1005](https://github.com/tree-sitter/tree-sitter/issues/1005), [tree-sitter#1252](https://github.com/tree-sitter/tree-sitter/issues/1252)) document this limitation
- Stack Overflow: "if the scanner C code identifies a token and returns it, TS will not backtrack"

**Potential Workarounds (all have significant drawbacks):**
1. **Headerless tables only**: Start detection at separator row, treat header as separate paragraph
   - Breaks semantic relationship between header and table
   - Requires post-processing to associate header with table
   - Still ambiguous with thematic breaks
2. **Require distinctive marker**: Use different syntax like `Table:` caption before table
   - Breaks Pandoc compatibility
   - Defeats purpose of Pandoc markdown support
3. **Full block-level scanner**: Adopt tree-sitter-markdown's approach with massive scanner
   - Contradicts minimal scanner philosophy
   - Requires moving all block parsing to scanner
   - Maintenance burden and complexity increase

**Alternatives:**
1. **Post-processing**: Parse as paragraphs/headings, then identify simple table patterns in post-processing
2. **Different parser**: Use a parser generator that supports arbitrary lookahead (GLR, PEG)
3. **Accept limitation**: Document that simple tables are not supported in tree-sitter-pandoc-markdown
4. **Use pipe tables instead**: Pipe tables work correctly and are more common in practice

**Recommendation:** Accept limitation and document. Simple tables are relatively rare (pipe tables are more common), and this is not a bug or implementation flaw - it's an architectural constraint of LR(1) parsing that cannot be worked around without compromising the grammar's design principles.

**Implementation Evidence:**
- Scanner logic: scanner.c:1317-1389 (parse_simple_table function)
- Grammar rules: grammar.js:295-367 (simple_table and related rules)
- Test corpus: test/corpus/simple-tables.txt (14 test cases, all fail due to LR(1) constraints)
- External token: SIMPLE_TABLE_START defined in scanner.c:59, 177
- Detailed analysis: docs/simple-tables-impossibility.md

**External Validation:** The [Quarto Markdown Parser](https://github.com/quarto-dev/quarto-markdown) project independently reached identical conclusions about line blocks (same problem as simple tables) and definition lists. They explicitly document that these features "interact very badly with pipe tables under any fixed lookahead parsing strategy" and that "tree-sitter is (mostly) a LALR(1) parser, which means it needs to decide rules based on 1-token lookahead." Their solution: provide escape hatch syntax (`{<pandoc}`) to fall back to Pandoc's parser for unsupported features. See [quarto-parser-comparison.md](./quarto-parser-comparison.md) for detailed architectural comparison and explanation of why their design differs from ours.

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

## References

### Internal Documentation
- **[improvements.md](./improvements.md)** - Detailed Phase 1 achievements and changes
- **[architecture-rationale.md](./architecture-rationale.md)** - Why split block/inline grammars
- **[scanner-research.md](./scanner-research.md)** - External scanner patterns analysis
- **[options-for-proceeding.md](./options-for-proceeding.md)** - Decision analysis for line blocks
- **[external-scanner-plan.md](./external-scanner-plan.md)** - Line block implementation attempt
- **[external-scanner-resources.md](./external-scanner-resources.md)** - Research resources
- **[simple-tables-impossibility.md](./simple-tables-impossibility.md)** - Proof of simple tables impossibility
- **[quarto-validation.md](./quarto-validation.md)** - External validation summary
- **[quarto-parser-comparison.md](./quarto-parser-comparison.md)** - Architecture comparison: rendering vs editor focus
- **[readme.md](./readme.md)** - Documentation index

### External Resources
- [Pandoc Manual](https://pandoc.org/MANUAL.html) - Pandoc Markdown specification
- [CommonMark Spec](https://spec.commonmark.org/) - Base Markdown specification
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/) - Parser generator docs
- [tree-sitter-markdown](https://github.com/tree-sitter-grammars/tree-sitter-markdown) - Reference implementation
- [Quarto Markdown Parser](https://github.com/quarto-dev/quarto-markdown) - Rendering-focused parser (external validation)
- [Zed Editor Issue #24632](https://github.com/zed-industries/zed/issues/24632) - ABI version compatibility

---

**Document Version:** 2.1
**Last Updated:** 2025-10-13
**Branch:** zed-compatible-scopes
**Status:** Phase 1 Complete ✅ | Phase 2: Definition Lists & Simple Tables Determined Impossible Due to LR(1) Constraints
