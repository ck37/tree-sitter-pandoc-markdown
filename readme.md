# tree-sitter-pandoc-markdown

Tree-sitter parser for Pandoc-flavored Markdown, including support for Quarto and RMarkdown.

**Fully standalone grammars** that work independently without extending tree-sitter-markdown. Compatible with Zed editor (ABI version 14).

## Status

✅ **Phase 1 Complete** - All grammar-only Pandoc Markdown features implemented and tested.

**Test Coverage:** 67/67 tests passing (100%)
- 38/38 block grammar tests
- 29/29 inline grammar tests

## Features

Supports **42+ Pandoc Markdown constructs** including:

### Block-Level
ATX/Setext headings, block quotes, fenced code blocks, fenced divs, YAML front matter, pipe tables, display math, footnote definitions, shortcodes, lists, and more.

### Inline-Level
Emphasis, strong, links, images, citations, cross-references, inline math, strikethrough, subscript/superscript, attribute spans, and more.

**📚 [Complete feature list →](docs/improvements.md#feature-completeness)**

### Coming in Phase 2
Definition lists, line blocks, simple tables, grid tables (require external scanner).

**📖 [Full documentation →](docs/readme.md)**

## Quick Start

```bash
git clone git@github.com:jmbuhr/tree-sitter-pandoc-markdown.git
cd tree-sitter-pandoc-markdown
npm install
npm run build
npm test
```

### Neovim Setup

```bash
sudo make install
```

Add to `init.lua`:

```lua
vim.treesitter.language.add('pandoc_markdown', {
  path = "/usr/local/lib/libtree-sitter-pandoc-markdown.so"
})
vim.treesitter.language.add('pandoc_markdown_inline', {
  path = "/usr/local/lib/libtree-sitter-pandoc-markdown-inline.so"
})
vim.treesitter.language.register('pandoc_markdown', { 'quarto', 'rmarkdown' })
```

## Architecture

Two-grammar architecture following CommonMark's two-phase parsing strategy:
- **Block grammar**: Document structure (headings, lists, tables, etc.)
- **Inline grammar**: Inline formatting (emphasis, links, citations, etc.)

**Grammar-first approach** with minimal external scanner usage.

**🏗️ [Architecture details →](docs/architecture.md)**

## Documentation

- **[docs/](docs/)** - Complete project documentation
- **[docs/architecture.md](docs/architecture.md)** - Architecture overview and feature lists
- **[docs/improvements.md](docs/improvements.md)** - Full changelog vs upstream
- **[docs/plan.md](docs/plan.md)** - Implementation roadmap
- **[docs/papers/](docs/papers/)** - Academic papers and research

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## License

[License information here]
