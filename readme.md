# tree-sitter-pandoc-markdown

Tree-sitter parser for Pandoc-flavored Markdown, including support for Quarto and RMarkdown.

**Fully standalone grammars** that work independently without extending tree-sitter-markdown. Compatible with Zed editor (ABI version 14).

## Features

Supports **42+ Pandoc Markdown constructs** including:

### Block-Level
ATX/Setext headings, block quotes, fenced code blocks, fenced divs, YAML front matter, pipe tables, display math, footnote definitions, shortcodes, lists, and more.

### Inline-Level
Emphasis, strong, links, images, citations, cross-references, inline math, strikethrough, subscript/superscript, attribute spans, and more.

**📚 [Complete feature list →](docs/improvements.md#feature-completeness)**

### Not Yet Implemented
Simple tables and grid tables (require external scanner). Definition lists and line blocks cannot be implemented due to tree-sitter LR(1) parsing limitations (see [plan.md](docs/plan.md) for details).

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

## Syntax Highlighting

This parser uses **modern nvim-treesitter scope conventions** (`@markup.*`) introduced in nvim-treesitter PR #3449 (August 2023). These replace deprecated `@text.*` scopes and provide better semantic highlighting across all tree-sitter-compatible editors.

**Modern scopes used:**
- `@markup.heading` - Headings with level variants (`.1` through `.6`)
- `@markup.strong` / `@markup.italic` - Emphasis
- `@markup.link.url` / `@markup.link.label` - Links
- `@markup.raw.block` - Code blocks and raw content
- `@markup.list` - List markers
- `@markup.quote` - Block quotes

See [queries/highlights.scm](tree-sitter-pandoc-markdown/queries/highlights.scm) for complete scope mappings.

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

MIT License - Copyright (c) 2024 Jannik Buhr

See [LICENSE](LICENSE) for full details.
