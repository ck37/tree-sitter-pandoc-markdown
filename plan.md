## Phase 1: Standalone Pandoc Markdown Grammar

### Current Status
**Phase 1F In Progress** - The standalone Pandoc Markdown grammar is functional and supports the majority of Pandoc features. Recent work added raw content (inline/block), percent metadata blocks, and identified a pipe table vs line block parsing conflict requiring external scanner implementation.

**Background**: After investigation, the repository's grammar inheritance approach was broken due to structural changes in the tree-sitter-markdown submodule. To avoid an endless chase after upstream churn and to gain full control over Pandoc features, a purpose-built standalone grammar was implemented. This provides complete control over grammar structure, Zed editor compatibility (ABI version 14), and the ability to add Pandoc-specific features incrementally.

### Revised Approach
Build **standalone** Tree-sitter grammars for Pandoc Markdown that work independently, rather than attempting to extend tree-sitter-markdown. This provides:
- Complete control over grammar structure and node types
- Zed editor compatibility (ABI version 14)
- Clear path forward without dependency issues
- Ability to add Pandoc-specific features incrementally

### Objectives
- Create minimal working standalone grammars for block and inline structure
- Ensure Tree-sitter ABI version 14 compatibility for Zed editor
- Establish test suite that passes cleanly
- Build foundation for incremental addition of Pandoc-specific features

### Implementation Phases

#### Phase 1A: Foundation
1. **ABI 14 Compatibility**
   - Enforce `--abi=14` flag in build scripts ✓
   - Document requirement in CONTRIBUTING.md ✓
   - Ensure all generated parsers use ABI 14

2. **Minimal Standalone Grammars**
   - Create basic block grammar (headings, paragraphs, lists, code blocks)
   - Create basic inline grammar (emphasis, code spans, text)
   - Remove broken tree-sitter-markdown inheritance
   - Ensure parsers generate successfully

3. **Test Infrastructure**
   - Establish minimal passing corpus for foundation rules
   - Remove or repair legacy fixtures that depended on upstream grammars
   - Ensure `tree-sitter test` runs cleanly
   - Consider parallelizing test execution

4. **Build & Documentation**
   - Update build scripts for standalone approach
   - Document new architecture in CONTRIBUTING.md
   - Clean commit history on feat/phase-1-pandoc-grammar branch

#### Phase 1B: Core Markdown Features
Once foundation is stable, incrementally add:
- [x] Setext headings
- [x] Block quotes
- [x] Thematic breaks (extended patterns)
- [x] HTML blocks
- [x] Fenced code blocks with language info (extended metadata)
- [x] Reference-style links (inline reference usage and definitions)
- [x] Images (inline and reference)
- [x] Autolinks
- [x] HTML inline tags

#### Phase 1C: Pandoc Extensions
After core markdown works, add Pandoc-specific features:
- [x] Fenced divs with attributes (`:::`)
- [x] Attribute lists (`{.class #id key=value}`)
- [x] Citations (`@item`, `[@item p. 4]`)
- [x] Cross references (`@fig:name`)
- [x] Shortcodes (`{{< name >}}`, `{{% name %}}`)
- [x] Chunk options (`#|` comment lines in code blocks)
- [x] YAML front matter (Pandoc metadata block)

**Phase 1C Work Plan**
1. **Attribute Lists** ✓
   - Support `{.class #id key=val}` tokens in both block and inline grammars.
   - Allow attribute lists to appear in info strings, fenced div markers, and inline sequences.
   - Update highlight/injection queries and corpus coverage accordingly.
2. **Fenced Div Blocks (`:::`)** ✓
   - Introduce a `fenced_div` block rule with open/close delimiters and optional attribute list.
   - Ensure proper nesting by tuning precedence/associativity.
   - Add targeted corpus fixtures and highlighting.
3. **Pandoc Inline Extensions** ✓
   - Implement tokens for `@cite`, `[@cite p. 4]`, and `@fig:name`.
   - Integrate with existing inline precedence so they coexist cleanly with links and emphasis.
   - Extend highlight queries and corpus coverage for these nodes.
4. **Shortcodes (`{{< ... >}}`, `{{% ... %}}`)** ✓
   - Parse shortcodes as standalone block nodes.
   - Highlight as macros and add representative corpus cases.
5. **Chunk Option Lines (`#| option: value`)** ✓
   - Recognize chunk option lines inside fenced code blocks without disrupting link/reference parsing.
   - Emit dedicated nodes (e.g., `chunk_option`) alongside regular code fence text for highlighting.
   - Extend corpora and highlighting to cover these lines.
6. **YAML Front Matter** ✓
   - Parse Pandoc metadata blocks delimited by `---` / `...` at the start of the document.
   - Tag the opening segment, metadata lines, and closing delimiter for highlighting.
   - Add foundation corpus coverage to confirm interaction with downstream blocks.
6. **Plan & Regression Tests**
   - After each feature: regenerate parsers (`npm run build`), extend corpora, and run `npm test`.
   - Update this plan and mark Phase 1C checklist items once their implementation stabilizes.

#### Phase 1D: Mathematical Notation & Tables
Focus on high-impact Pandoc features that benefit all users (not Quarto-specific).

**Status:** Inline/display math and pipe tables implemented. Beginning Phase 1E work.

1. **Inline & Display Math** ✓
   - Add `inline_math` and `display_math` nodes with `math_content` capturing interior LaTeX. ✓
   - Support `$...$` and `$$...$$` delimiters (single-line and multi-line) with escape handling. ✓
   - Inject LaTeX highlighting for math content and tag delimiters as punctuation. ✓
   - Expand corpus with inline, block, adjacent math, and malformed delimiter cases. ✓
2. **Pipe Tables** ✓
   - Introduce `pipe_table`, `pipe_table_header`, `pipe_table_delimiter`, `pipe_table_row`, `pipe_table_cell`, and alignment markers. ✓
   - Handle leading/trailing pipes, column alignment (`:---`, `---:`, `:---:`), and ensure tables coexist with surrounding paragraphs. ✓
   - Provide highlight coverage for headers, alignment cues, and cell boundaries; add comprehensive corpus fixtures (optionally noting captions for later phases). ✓

#### Phase 1E: Document Semantics & Typography
Enhance inline semantics and block structures now that math/tables are stable.

1. **Footnotes** ✓
   - `footnote_reference`, `footnote_definition`, and `inline_footnote` nodes implemented with corpus coverage.
   - References integrate cleanly with inline precedence and block parsing.
2. **Definition Lists** *(deferred)*
   - Multiple implementation attempts caused widespread regressions because the colon-led description marker is indistinguishable from ordinary paragraph lines without a lookahead.
   - Future work likely requires an external scanner or a more sophisticated newline classification strategy before re-introducing this rule; revisit after completing the remaining phases.
3. **Strikethrough, Subscript, Superscript** ✓
   - Inline tokens for `~~text~~`, `H~2~O`, and `x^2^` in both grammars with highlights and tests.
4. **Attribute Spans** ✓
   - `[text]{.class #id}` spans supported for inline nesting; highlights and corpus cases in place.
5. **Highlighting and Underline** ✓
   - `==highlight==` and `+underline+` inline tokens implemented with precedence rules, highlighting, and fixture coverage.

#### Phase 1F: Raw Content, Line Blocks, and Additional Tables
Round out remaining Pandoc Markdown constructs before considering Quarto-only enhancements.

**Status:** Complete (for grammar-only features). Raw content and percent metadata successfully implemented and tested. Line blocks, simple tables, and grid tables identified as requiring external scanner (C code) to resolve pattern conflicts - these are deferred pending external scanner development.

**Completed:**
1. **Raw Inline and Raw Blocks** ✓
   - Implemented `raw_inline` parsing for `` `code`{=html} `` syntax in both grammars with `prec(4)` to take precedence over regular code spans.
   - Implemented `raw_block` parsing for fenced blocks with format markers (` ```{=format} `).
   - Modified `attribute_list` token pattern to exclude `{=...}` syntax (now `/\{[^={}\r\n][^{}\r\n]*\}|\{\}/`), reserving format markers exclusively for raw content.
   - Added `raw_inline`, `raw_inline_content`, `raw_block`, `raw_block_content`, `raw_block_delimiter`, and `raw_format` highlighting.
   - Added 8 corpus tests: 5 for inline (HTML, LaTeX, multiple formats), 3 for blocks (HTML, LaTeX, empty).
   - **Test Results**: ✓ All 8 tests passing in both grammars.

2. **Percent Metadata Blocks** ✓
   - Implemented `percent_metadata` recognizing `% Title`, `% Author`, `% Date` sequences at document start.
   - Supports optional author/date fields (title-only, title+author, or full metadata).
   - Added highlighting for `percent_metadata_title`, `percent_metadata_author`, `percent_metadata_date`.
   - Added 4 corpus tests covering all metadata combinations.
   - **Test Results**: ✓ All 4 tests passing.

3. **Line Blocks** ⚠️ (Partial - Known Issue)
   - Implemented `line_block` and `line_block_line` with `|` marker syntax.
   - Line block marker requires at least one space (`/\|[ \t]+/`) to differentiate from pipe table delimiters.
   - Added 4 corpus tests: simple blocks, indentation, emphasis within lines, empty lines.
   - **Test Results**: ✓ All 4 line block tests pass in isolation.
   - **Known Conflict**: Line blocks conflict with existing pipe tables (both use `|` character). Pipe table test now fails when line block is enabled in grammar.
   - **Root Cause**: Both constructs start with `|`, and tree-sitter cannot disambiguate without lookahead. Pipe tables require `| cell | cell |` with delimiter row `| :--- | ---: |`, while line blocks are `| line content`.
   - **Resolution Options**:
     1. External scanner to peek ahead and detect table structure vs line block
     2. Defer line blocks until after pipe table detection via precedence/ordering (attempted, insufficient)
     3. Make line blocks require different marker (e.g., `||` - breaks Pandoc compatibility)
   - **Current Status**: Line block implementation commented out/reverted from `_block` choices to restore pipe table functionality. Feature code preserved in git history.

**Deferred Pending External Scanner:**
1. **Line Blocks** ⚠️ (Requires External Scanner - Implementation Attempted 2025-10-11)
   - **Issue**: `|` marker conflicts with pipe table delimiters
   - Both constructs use `|` character, creating ambiguous parses
   - Attempted precedence-based resolution insufficient
   - **Resolution**: External scanner (C code) needed for context-aware tokenization
   - **Status**: Full external scanner implementation attempted (see EXTERNAL_SCANNER_PLAN.md for details)
     - ✅ Added LINE_BLOCK_START/LINE_BLOCK_LINE_ENDING tokens to scanner.c
     - ✅ Implemented parse_line_block() with simulate mode and multi-line lookahead
     - ✅ Updated scan() function with '|' case handler for disambiguation
     - ✅ Added grammar rules (line_block, line_block_line) with external tokens
     - ✅ Added highlighting queries and restored 4 corpus tests
     - ❌ Tests failing: Both line blocks and pipe tables broken (6 test failures)
     - ❌ External tokens emitted but parser creating ERROR nodes
     - ❌ Suggests GLR parser trying multiple paths despite external token guidance
   - **Current State**: Implementation left in codebase (not reverted) for debugging
   - **Test Results**: 37/43 block tests passing (down from 39/39 before attempt)
   - **Blocker**: Requires deeper tree-sitter external scanner expertise or community help
   - **See**: EXTERNAL_SCANNER_PLAN.md "Implementation Attempt Results" section for full analysis

2. **Simple Tables** ⚠️ (Requires External Scanner)
   - **Issue**: Dash separator patterns conflict with multiple constructs:
     - Pipe table alignment markers (`:?-{3,}:?`)
     - Setext heading underlines (`===` or `---`)
     - Thematic breaks (`---`)
     - YAML front matter delimiters (`---`)
   - Tree-sitter creates competing parses resulting in ERROR nodes
   - **Resolution**: External scanner needed for context-aware dash pattern disambiguation
   - **Status**: Implementation attempted and reverted

3. **Grid Tables** (Not Attempted)
   - Complex border syntax with `+`, `-`, and `|` characters
   - Would support multi-line cells and complex layouts
   - Likely faces similar pattern conflicts as line blocks and simple tables
   - **Status**: Deferred until external scanner infrastructure exists

**Phase 1F Summary:**
- ✅ **2 of 5 features completed**: Raw content (inline/block), Percent metadata
- ⚠️ **3 features require external scanner**: Line blocks, Simple tables, Grid tables
- **Test coverage**: Added 16 new tests (12 passing, 4 failing line block tests)
- **Production ready**: Raw inline, raw blocks, percent metadata
- **In progress**: Line block external scanner implementation (incomplete, 6 test failures introduced)
- **Current test status**: 37/43 block tests passing, 29/29 inline tests passing
- **Technical insight**: Pure grammar rules insufficient for ambiguous Markdown constructs; external scanner (C code) required for context-aware lexing
- **External scanner challenge**: Full implementation attempted but requires deeper tree-sitter expertise to resolve GLR parser interaction issues
- All successfully implemented features follow established workflow: grammar updates, highlighting/injection queries, corpus tests, regeneration, and test verification.

### Cleanup & Repository Hygiene
- [x] Remove the legacy `tree-sitter-markdown` git submodule and drop it from `package.json` / `package-lock.json` now that the grammar is fully standalone.
- [x] Update documentation (README, CONTRIBUTING, plan notes) to eliminate references to extending upstream grammars and clarify the standalone architecture.
- [x] Run a final `git submodule status` after removal to ensure no stale submodule state remains.
- [x] Execute `npm run build` and `npm test` to confirm tooling works without the submodule.

**Parse Conflict Mitigation Notes**
- Add one grammar feature at a time and run `npm run build` immediately to surface conflicts early.
- Prefer tuning `prec`, `prec.left`, or `prec.right` before resorting to global `conflicts` declarations to keep the parser deterministic.
- Keep complex constructs (citations, chunk options, shortcodes) as lexical tokens where possible to avoid high-level rule contention.
- Expand the corpus alongside new constructs so regression tests catch issues as soon as they’re introduced.

### Technical Requirements

#### ABI Version Compatibility
- **Target**: Tree-sitter ABI version 14
- **Reason**: Zed editor currently supports ABI 13-14 only
- **Reference**: [Zed issue #24632](https://github.com/zed-industries/zed/issues/24632)
- **Enforcement**: Build script uses `--abi=14` flag automatically

#### Grammar Structure
```
tree-sitter-pandoc-markdown/
├── grammar.js          # Block structure (standalone)
├── src/
│   ├── scanner.c       # Custom scanner if needed
│   └── parser.c        # Generated (ABI 14)
└── queries/
    ├── highlights.scm  # Syntax highlighting
    └── injections.scm  # Language injections

tree-sitter-pandoc-markdown-inline/
├── grammar.js          # Inline structure (standalone)
├── src/
│   ├── scanner.c       # Custom scanner if needed
│   └── parser.c        # Generated (ABI 14)
└── queries/
    ├── highlights.scm
    └── injections.scm
```

### Testing Strategy
1. Start with minimal corpus tests for basic functionality
2. Expand test coverage as features are added
3. Ensure all tests pass before adding new features
4. Test Zed integration regularly

### Deliverables (Phase 1A)
- [x] ABI 14 enforcement in build scripts
- [x] ABI 14 documentation in CONTRIBUTING.md
- [x] Working standalone block grammar (headings, paragraphs, lists, fences, thematic breaks)
- [x] Working standalone inline grammar (text, emphasis, strong, code spans)
- [x] Passing test suite for foundation corpus
- [ ] Clean commit on feat/phase-1-pandoc-grammar
- [ ] Updated documentation

### Success Criteria
- `npm run build` completes without errors
- `npm test` passes all tests
- Parsers work in Zed editor without ABI version errors
- Grammar can be extended incrementally for Pandoc features

### Risks & Mitigations
- **Loss of upstream improvements**: By going standalone, we lose automatic updates from tree-sitter-markdown. *Mitigation*: Document CommonMark compliance and manually sync important fixes.
- **Maintenance burden**: Maintaining complete grammar is more work. *Mitigation*: Start minimal, add features incrementally, prioritize Quarto-critical features.
- **ABI Version Changes**: Zed may update to ABI 15. *Mitigation*: Monitor Zed issue, flag can be changed easily in build script.
- **Grammar complexity**: Full markdown is complex. *Mitigation*: Focus on commonly-used subset, add edge cases as needed.

### Phase 1 Summary: Implemented Features

**Block-Level Constructs:**
- ATX headings (`#` through `######`)
- Setext headings (underlined with `=` or `-`)
- Block quotes (`>`)
- Fenced code blocks with chunk options (`#|`)
- HTML blocks
- Fenced divs (`:::`) with attributes
- YAML front matter (`---`)
- Percent metadata (`% Title`, `% Author`, `% Date`)
- Pipe tables with alignment markers
- Display math (`$$...$$`)
- Raw blocks (` ```{=format} `)
- Footnote definitions
- Link reference definitions
- Shortcode blocks (`{{< ... >}}`, `{{% ... %}}`)
- Lists (ordered and unordered)
- Thematic breaks
- Paragraphs

**Inline-Level Constructs:**
- Emphasis (`*` and `_`)
- Strong emphasis (`**` and `__`)
- Code spans (`` ` ``)
- Raw inline (`` `code`{=format} ``)
- Links (inline and reference-style)
- Images (inline and reference-style)
- Autolinks
- HTML inline tags
- Citations (`@key`, `[@key]`)
- Cross-references (`@fig:id`)
- Attribute lists (`{.class #id key=val}`)
- Attribute spans (`[text]{.attrs}`)
- Footnote references (`[^1]`)
- Inline footnotes (`^[text]`)
- Inline math (`$...$`)
- Strikethrough (`~~text~~`)
- Highlight (`==text==`)
- Subscript (`~text~`)
- Superscript (`^text^`)
- Underline (`+text+`)

**Test Coverage:**
- Block grammar: 43 tests (42 passing, 1 known conflict)
- Inline grammar: 29 tests (all passing)

**Known Issues:**
- Line blocks vs pipe tables conflict (both use `|` delimiter)

### Future Considerations (Post Phase 1)
- Resolve line block/pipe table conflict via external scanner
- Implement simple tables
- Implement grid tables
- Evaluate if/when to sync with CommonMark spec updates
- Consider whether to re-integrate with tree-sitter-markdown if they stabilize structure
- Plan for Quarto-specific grammar extensions (Phase 2)
- Performance optimization and error recovery improvements
