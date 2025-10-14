# External Validation: Quarto Markdown Parser

**Date:** 2025-10-13

## Summary

The [Quarto Markdown Parser](https://github.com/quarto-dev/quarto-markdown) project independently reached identical conclusions about LR(1) parsing limitations when building their tree-sitter-based Pandoc-flavored markdown parser.

## Their Conclusions (From Their Documentation)

### Line Blocks

> **tl;dr: Quarto Markdown will not support Pandoc LineBlock parsing.**
>
> Unfortunately, this syntax interacts very badly with pipe tables **under any fixed lookahead parsing strategy.**
>
> **Quarto Markdown is designed to be efficiently parseable (via `tree-sitter` grammars).** `tree-sitter` is (mostly) a LALR(1) parser, which means it needs to decide rules based on 1-token lookahead. **We don't see how to distinguish pipe tables and line blocks with fixed lookahead.**

### Definition Lists

> **tl;dr: Quarto Markdown will not support Pandoc DefinitionList parsing.**
>
> Definition lists offer the same problem. **There's no way to know that the following construct isn't a paragraph followed by something else without parsing the entire paragraph first.**
>
> **We will also not support definition lists directly.**

### Simple Tables & Grid Tables

From their README.md:

> **Important differences:**
> - no grid tables: use `{<markdown}`, list tables, or Quarto's HTML-as-table-AST mode

They don't explicitly mention simple tables, but the same constraints apply.

## Why This Matters

1. **Independent Discovery**: Different team, different timeline, same conclusions
2. **Explicit Understanding**: They reference "LALR(1)", "1-token lookahead", "fixed lookahead parsing"
3. **Same Features Excluded**: Line blocks, definition lists, grid tables
4. **Same Root Cause**: Paragraph commitment problem before seeing next line
5. **Architectural Validation**: Confirms these are fundamental constraints, not implementation issues

## Their Solution: Escape Hatches

Quarto provides `{<pandoc}` reader syntax to fall back to Pandoc's parser:

```markdown
```{<pandoc}
| This will become a line block
| Line blocks are not supported by Quarto Markdown but
| can be supported via this fallback syntax
```
```

This allows users to:
- Use fast tree-sitter parsing by default
- Fall back to full Pandoc for unsupported features
- Choose the tradeoff on a per-block basis

## Key Takeaway

**Quote from Quarto's README:**

> **Syntax Errors are good, actually**
>
> Quarto Markdown gives syntax errors in malformed documents. Standards such as Commonmark dictate that no documents ever contain mistakes. **This isn't a tenable situation in large documents.**

Both projects prioritize:
- Real-time editor integration
- Predictable performance (LR parsing)
- Error detection capabilities
- Grammar-first philosophy

Both projects accept:
- Some Pandoc features cannot be supported
- This is an architectural constraint, not a bug
- Better to be honest about limitations

## References

- **Quarto Markdown Parser**: https://github.com/quarto-dev/quarto-markdown
- **Their syntax notes**: https://github.com/quarto-dev/quarto-markdown/blob/main/docs/syntax-notes.md
- **Our detailed analysis**: docs/simple-tables-impossibility.md
- **Our plan document**: docs/plan.md
