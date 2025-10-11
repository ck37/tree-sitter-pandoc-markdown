# tree-sitter-pandoc-markdown


## Setup

Install [treesitter dependencies](https://tree-sitter.github.io/tree-sitter/creating-parsers#dependencies), then

```bash
git clone --recurse-submodules git@github.com:jmbuhr/tree-sitter-pandoc-markdown.git
cd tree-sitter-pandoc-markdown
npm install
npm run build
npm run test
```

When used via npm it wouldn't find its `common/common.js` file.

## Testing in Neovim

Run

```bash
sudo make install
```

Add to your `init.lua` file:

```lua
vim.treesitter.language.add('pandoc_markdown', { path = "/usr/local/lib/libtree-sitter-pandoc-markdown.so" })
vim.treesitter.language.add('pandoc_markdown_inline', { path = "/usr/local/lib/libtree-sitter-pandoc-markdown-inline.so" })
vim.treesitter.language.register('pandoc_markdown', { 'quarto', 'rmarkdown' })
```

Add some querries for highlighting and injections for the pandoc-markdowm filetype e.g. from https://github.com/quarto-dev/quarto-nvim/pull/160/

Open e.g. a quarto file `test.qmd`.
