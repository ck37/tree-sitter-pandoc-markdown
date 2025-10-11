## Phase 1: Standalone Pandoc Markdown Grammar

### Current Status
After investigation, the repository's grammar inheritance approach is broken due to structural changes in the tree-sitter-markdown submodule. The require paths no longer exist, and tests have been failing for multiple commits.

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
- Fenced divs with attributes (`:::`)
- Attribute lists (`{.class #id key=value}`)
- Citations (`@item`, `[@item p. 4]`)
- Cross references (`@fig:name`)
- Shortcodes (`{{< name >}}`, `{{% name %}}`)
- Chunk options (`#|` comment lines in code blocks)

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
