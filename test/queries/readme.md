# Query Test Files

This directory contains test files for validating tree-sitter query patterns.

## Files

- **highlights-test.md** - Tests syntax highlighting query patterns
- **folds-test.md** - Tests code folding query patterns
- **tags-test.md** - Tests symbol extraction and navigation
- **locals-test.md** - Tests reference scoping and go-to-definition
- **textobjects-test.md** - Tests nvim-treesitter text object selection
- **injections-test.md** - Tests language injection for code blocks

## Testing Queries

### Command Line Testing

Test a query file against a test markdown file:

```bash
# Test highlights
tree-sitter query \
  tree-sitter-pandoc-markdown/queries/highlights.scm \
  test/queries/highlights-test.md

# Test folds
tree-sitter query \
  tree-sitter-pandoc-markdown/queries/folds.scm \
  test/queries/folds-test.md

# Test tags
tree-sitter query \
  tree-sitter-pandoc-markdown/queries/tags.scm \
  test/queries/tags-test.md
```

### Neovim Testing

1. Install nvim-treesitter
2. Copy grammar to treesitter directory
3. Open test file in Neovim
4. Run `:InspectTree` to view parse tree
5. Run `:Inspect` to view highlight captures

### Zed Testing

1. Configure Zed to use local grammar
2. Open test file in Zed
3. Verify syntax highlighting
4. Test folding with fold/unfold commands

## Query File Locations

- **Block grammar queries**: `tree-sitter-pandoc-markdown/queries/`
- **Inline grammar queries**: `tree-sitter-pandoc-markdown-inline/queries/`

## Coverage

Each test file is designed to exercise specific query patterns:

### highlights-test.md
- All heading levels (H1-H6, setext)
- Emphasis and strong emphasis
- Links and images (inline, reference)
- Code spans and blocks
- Pandoc extensions (citations, divs, attributes)
- Math (inline and display)
- Lists, quotes, tables
- Frontmatter and metadata

### folds-test.md
- Foldable headings with content
- Code blocks of various languages
- Fenced divs
- Block quotes with nesting
- Lists with nesting
- YAML frontmatter
- Long footnotes
- Tables

### tags-test.md
- Hierarchical heading structure
- Link reference definitions
- Footnote definitions
- Fenced divs with IDs
- Document outline navigation

### locals-test.md
- Link reference definitions and usage
- Footnote definitions and references
- Image reference definitions and usage
- Scoping within nested sections
- Cross-references between scopes

### textobjects-test.md
- Code blocks (outer and inner)
- Links (outer and inner)
- Emphasis and strong
- Headings (outer and inner)
- Lists and list items
- Fenced divs
- All inline elements

### injections-test.md
- Common programming languages (Python, JavaScript, R, TypeScript)
- Shell scripts (bash, sh, zsh)
- Data formats (YAML, JSON)
- Web languages (HTML, CSS, SQL)
- LaTeX math (inline and display)
- Raw blocks with language markers
- YAML frontmatter
- Chunk options

## Expected Behavior

### Highlights

This parser uses **modern nvim-treesitter scope conventions** (`@markup.*`) introduced in nvim-treesitter PR #3449 (August 2023).

**Scope conventions:**
- Headings use `@markup.heading` (with `.1` through `.6` level variants)
- Links use `@markup.link.url` and `@markup.link.label`
- Code uses `@markup.raw.inline` and `@markup.raw.block`
- Emphasis uses `@markup.italic` and `@markup.strong`
- Lists use `@markup.list` (with `.checked` / `.unchecked` for tasks)
- Pandoc citations use `@markup.reference.citation`
- Shortcodes use `@keyword.directive`

**Why modern scopes?**
- Better semantic meaning than deprecated `@text.*` scopes
- Cross-editor compatibility (Neovim, Helix, Zed, Emacs)
- Forward-compatible with tree-sitter ecosystem
- Aligns with CommonMark terminology

### Folds
- Folding headings should hide their content
- Code blocks should fold to first line
- Nested structures should fold recursively

### Tags
- Headings should appear in symbol list
- Link/footnote definitions should be navigable
- IDs should be extractable

### Locals
- References should link to definitions
- Hover should show definition
- Go-to-definition should jump to definition location

### Text Objects
- `vaf` should select entire code block
- `vil` should select inner link text
- `vah` should select heading with content
- Motions should jump between objects

### Injections
- Code blocks should get language-specific highlighting
- Math should use LaTeX highlighting
- YAML frontmatter should use YAML highlighting
- Raw blocks should detect language from content

## Validation Checklist

For each query file implementation:

- [ ] Query syntax is valid (no parse errors)
- [ ] All test file patterns are captured
- [ ] No false positives (incorrect matches)
- [ ] Works with nested constructs
- [ ] Compatible with multiple editors
- [ ] Documented with comments
- [ ] Performance is acceptable (no exponential patterns)
