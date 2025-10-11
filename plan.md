## Phase 1: Standalone Pandoc Markdown Grammar

### Current Status
After investigation, the repository's grammar inheritance approach is broken due to structural changes in the tree-sitter-markdown submodule. In upstream revisions from late 2023 the generated parser artifacts were relocated under nested directories (e.g. `tree-sitter-markdown/tree-sitter-markdown/grammar.js`), while this project still referenced the prior flat layout via `require('tree-sitter-markdown/grammar')`. As a result, Node emits `Cannot find module 'tree-sitter-markdown/tree-sitter-markdown/grammar'` during the build step, and every commit since that structural change (now roughly 22–24 months ago) has produced failing tests because the inherited grammar can no longer be loaded. Simply patching the import would not solve the broader mismatch—upstream refactors also altered node types and queries, and their CommonMark grammar still lacks the Pandoc-specific constructs (divs, citations, chunk options, shortcodes, etc.) we need. To avoid an endless chase after upstream churn and to gain full control over Pandoc features, a purpose-built standalone grammar is the safer long-term strategy.

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

#### Phase 1A: Foundation (Current Priority)
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

**Phase 1C Work Plan (current focus):**
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

#### Phase 1D: Mathematical Notation & Tables (Next Up)
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

1. **Footnotes** *(in progress)*
   - Parse `footnote_reference`, `footnote_definition`, and `inline_footnote`, supporting multi-paragraph definitions.
   - Ensure references integrate with inline precedence and definitions align with block parsing.
2. **Definition Lists** *(deferred)*
   - Multiple implementation attempts caused widespread regressions because the colon-led description marker is indistinguishable from ordinary paragraph lines without a lookahead.
   - Future work likely requires an external scanner or a more sophisticated newline classification strategy before re-introducing this rule; revisit after remaining typography is complete.
3. **Strikethrough, Subscript, Superscript**
   - Add inline nodes for `~~text~~`, `H~2~O`, `x^2^`, resolving precedence relative to emphasis and code spans.
4. **Attribute Spans**
   - Support `[text]{.class #id}` spans reusing `attribute_list`, ensuring they can nest within inline content.
5. **Highlighting and Underline**
   - Implement `==highlight==` and `+underline+` inline nodes with precedence rules comparable to strikethrough/sub/superscript and add corpus/highlight coverage.

#### Phase 1F: Raw Content, Line Blocks, and Additional Tables
Round out remaining Pandoc Markdown constructs before considering Quarto-only enhancements.

1. **Raw Inline and Raw Blocks**
   - Parse backtick + format markers (`` `code`{=html} ``) and fenced raw blocks (```{=latex}``).
   - Emit `raw_inline`, `raw_block`, and `raw_format` nodes and inject appropriate languages based on format identifiers.
2. **Line Blocks**
   - Implement `line_block` and `line_block_line` for leading `|` syntax, preserving indentation and blank-line handling.
3. **Additional Table Forms**
   - Extend grammar for grid tables and simple tables, including optional captions and multi-line cells.
4. **Percent Metadata Blocks**
   - Recognize `% Title`, `% Author`, `% Date` sequences at the document start as `percent_metadata` (alternative to YAML front matter).

Each Phase 1D–1F feature should follow the established workflow: update grammar(s), queries, corpora, regenerate parsers, run tests, and log progress here.

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

### Future Considerations (Post Phase 1)
- Evaluate if/when to sync with CommonMark spec updates
- Consider whether to re-integrate with tree-sitter-markdown if they stabilize structure
- Plan for Quarto-specific grammar extensions (Phase 2)
- Performance optimization and error recovery improvements
