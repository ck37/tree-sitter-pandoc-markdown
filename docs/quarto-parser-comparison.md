# Comparison: tree-sitter-pandoc-markdown vs Quarto Markdown Parser

**Document Version:** 1.0
**Last Updated:** 2025-10-13
**Status:** Analysis Complete

## Executive Summary

The [Quarto Markdown Parser](https://github.com/quarto-dev/quarto-markdown) project and our tree-sitter-pandoc-markdown parser serve fundamentally different purposes despite both parsing Pandoc-flavored Markdown. This document explains the architectural differences, design rationales, and why their approach is correct for their use case while ours is correct for ours.

## Background

During implementation of simple tables (see [simple-tables-impossibility.md](./simple-tables-impossibility.md)), we discovered that the Quarto project independently reached identical conclusions about LR(1) limitations for definition lists, line blocks, and simple tables. This led to a deeper investigation of their parser architecture to understand potential collaboration opportunities.

## Architecture Comparison

### Quarto Markdown Parser Architecture

**Primary Goal:** Drop-in replacement for Pandoc's markdown reader in the rendering pipeline

**Pipeline Position:**
```
┌─────────────────────────────────────────────────────────────┐
│ 1. EXECUTION PHASE (knitr/jupyter/julia)                    │
│    .qmd file → Execute code cells → .md file                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. PARSING PHASE (Quarto Parser)                            │
│    .md file → [Quarto Parser] → Pandoc AST                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. FILTER PHASE (Lua/JSON filters)                          │
│    Pandoc AST → [Quarto filters] → Modified Pandoc AST      │
│                                                              │
│    Filters handle:                                           │
│    - Cross-references (@fig-1 → numbered figure refs)       │
│    - Callouts, Shortcodes, Layout, Citations                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. WRITER PHASE (Pandoc)                                    │
│    Modified Pandoc AST → HTML/PDF/DOCX/etc                  │
└─────────────────────────────────────────────────────────────┘
```

**Key Constraints:**
- **Must produce identical Pandoc AST** - Hundreds of existing Lua filters expect specific node types
- **Must maintain filter compatibility** - Users have custom filters that traverse Pandoc AST
- **Must work with Pandoc writers** - All output formats (HTML, PDF, DOCX) expect standard AST

**Why They're Building This:**
1. **Syntax error detection** - Pandoc has no error reporting; Quarto needs errors for large documents
2. **Quarto-specific syntax** - Pandoc 3 doesn't support ` ```{python} ` code cell syntax
3. **Performance** - Tree-sitter enables incremental parsing and better performance
4. **Editor integration** - Secondary benefit from tree-sitter (but not primary goal)

### tree-sitter-pandoc-markdown Architecture

**Primary Goal:** Rich syntax tree for editor integration and tooling

**Use Cases:**
- Syntax highlighting with semantic precision
- Code folding, navigation, outline views
- Tree-sitter queries for linting, analysis
- AST-based transformations and refactoring
- Language server protocol implementations

**Key Design Principles:**
- **Maximize semantic precision** - Distinct node types enable better editor features
- **Editor-first** - Optimize for real-time parsing and highlighting
- **Tree-sitter ecosystem** - Integrate with nvim-treesitter, Zed, Helix, etc.
- **Standalone parser** - No dependency on Pandoc's rendering pipeline

## Feature Comparison

| Feature | Our Parser | Quarto Parser | Rationale |
|---------|-----------|---------------|-----------|
| **Cross-references** | `cross_reference` token | `Cite` node | Quarto: Filters expect `Cite` nodes<br>Us: Semantic distinction aids highlighting |
| **Chunk options** | `chunk_option` token | Not in parser | Quarto: Handled by knitr before parsing<br>Us: Enable editor features in raw `.qmd` |
| **Citations** | `citation` token | `Cite` node with modes | Both: Support `@item` syntax<br>Quarto: Exact Pandoc compatibility |
| **AST Output** | Tree-sitter nodes | Pandoc AST (JSON/native) | Different consumers entirely |
| **Error Handling** | Tree-sitter ERROR nodes | Syntax errors reported | Both prioritize error detection |
| **Line blocks** | Deferred (LR(1) limit) | Excluded (LR(1) limit) | Identical conclusion, same reason |
| **Definition lists** | Impossible (documented) | Excluded (documented) | Identical conclusion, validated |
| **Simple tables** | Impossible (documented) | Excluded (LR(1) limit) | Identical conclusion |

## Design Decision Analysis

### Cross-References: Why Different Approaches Are Both Correct

**Quarto's Approach: Parse as `Cite` nodes**

```lua
-- Quarto's cross-reference filter (simplified)
function Cite(cite)
  if cite.citations[1].id:match("^fig%-") then
    return create_figure_reference(cite)  -- Transform @fig-1 → "Figure 1"
  elseif cite.citations[1].id:match("^tbl%-") then
    return create_table_reference(cite)   -- Transform @tbl-1 → "Table 1"
  else
    return cite  -- Regular bibliography citation
  end
end
```

**Rationale:** Pandoc's AST has no separate cross-reference type. All `@item` syntax becomes `Cite` nodes. Quarto's filters already expect this structure. Changing it would break hundreds of filters and require ecosystem-wide updates.

**Our Approach: Dedicated `cross_reference` token**

```regex
cross_reference: $ => token(/@[A-Za-z0-9_.+-]+:[A-Za-z0-9_.:+-]*[A-Za-z0-9_+-]/)
```

**Rationale:**
- `@fig:chart` and `@smith2020` serve different semantic purposes
- Distinct tokens enable different syntax highlighting colors
- Editor features can provide different behaviors (jump to figure vs bibliography)
- No need for Pandoc filter compatibility

**Conclusion:** Both approaches are correct for their respective ecosystems.

### Chunk Options: Execution-Time vs Parse-Time Handling

**Quarto's Approach: Not in parser**

Chunk options like `#| label: foo` are handled during the **execution phase**:

```
Input .qmd:
    ```{python}
    #| label: fig-plot
    #| echo: false
    plot(data)
    ```

After knitr execution:
    ```python
    # (chunk options consumed, code executed, plot embedded)
    ```

Parser sees:
    (fenced_code_block with embedded results, no #| lines)
```

**Rationale:** By the time the markdown parser runs, chunk options have already been consumed by knitr/jupyter. The parser only sees the post-execution markdown.

**Our Approach: First-class `chunk_option` tokens**

```javascript
chunk_option: $ => token(prec(1, /[ \t]*#\|[^\r\n]*/))
```

**Rationale:**
- Enable editor features in unexecuted `.qmd` files
- Syntax highlighting for option syntax
- Validation and autocomplete for option names
- Parsing raw source files, not execution output

**Conclusion:** Different pipeline positions require different handling.

## Validation of LR(1) Limitations

Both projects independently reached identical conclusions about tree-sitter limitations:

### Line Blocks

**Quarto Documentation:**
> "Line blocks offer the same problem. There's no way to know that the following construct isn't a paragraph followed by something else without parsing the entire paragraph first. We will also not support definition lists directly."
>
> "tree-sitter is (mostly) a LALR(1) parser, which means it needs to decide rules based on 1-token lookahead."

**Our Documentation:** [plan.md](./plan.md#24-line-blocks), [options-for-proceeding.md](./options-for-proceeding.md)

**Conclusion:** External validation that this is a fundamental constraint, not implementation oversight.

### Definition Lists

Both projects document that definition lists cannot be implemented due to the need for multi-line lookahead to distinguish `Term\n: Definition` from `Paragraph\n: Something else`.

**Quarto's Solution:** Escape hatch syntax `{<pandoc}` to fall back to Pandoc's parser
**Our Solution:** Document limitation, recommend pipe tables or other alternatives

### Simple Tables

Both projects recognize that whitespace-aligned tables with dash separators require examining line N+1 to classify line N, which violates LR(1) constraints.

**Validation Status:** Confirmed by independent implementation attempts (see [simple-tables-impossibility.md](./simple-tables-impossibility.md))

## Lessons Learned

### What We Confirmed

1. **LR(1) limitations are fundamental** - Not implementation flaws, but architectural constraints
2. **Quarto is aware of these limitations** - They explicitly document LALR(1) parser constraints
3. **Different goals require different designs** - Neither approach is "better"; they solve different problems
4. **Pandoc AST compatibility is essential for Quarto** - Breaking it would break their entire filter ecosystem

### What We Discovered

1. **Chunk options are execution-time, not parse-time** - Our parser handles raw source; theirs handles execution output
2. **Cross-references as citations is intentional** - Required for Pandoc filter compatibility
3. **Editor features are secondary for Quarto** - Primary goal is rendering pipeline replacement
4. **Escape hatches are pragmatic** - Quarto's `{<pandoc}` syntax acknowledges parser limitations

### What This Means for Collaboration

**Should we submit PRs or issues to Quarto?**

**No.** Here's why:

1. **Different architectural requirements** - They need Pandoc AST; we need rich tree-sitter nodes
2. **Our "advantages" aren't advantages for them** - Distinct cross-reference nodes would break their filters
3. **Project maturity** - Their README warns "not ready for public consumption"
4. **Already aware of limitations** - They explicitly document what they can't support

**Better approach:**

- **Wait for maturity** - Both projects are still evolving
- **Cross-reference documentation** - Link to each other as validation of findings
- **Share insights** - If they ask about implementation approaches, share our experience
- **Potential future discussion** - When both mature, discuss trade-offs in editor vs rendering focus

## References

### Quarto Project
- **Repository:** https://github.com/quarto-dev/quarto-markdown
- **Key Documentation:**
  - `docs/syntax-notes.md` - Documents line blocks and definition lists as unsupported
  - `docs/notes.md` - Technical implementation notes
  - `README.md` - Project goals and current state

### Our Project
- **[plan.md](./plan.md)** - Implementation roadmap with LR(1) analysis
- **[simple-tables-impossibility.md](./simple-tables-impossibility.md)** - Detailed impossibility proof
- **[quarto-validation.md](./quarto-validation.md)** - External validation summary
- **[architecture-rationale.md](./architecture-rationale.md)** - Design decisions

### External Resources
- **Quarto Rendering Pipeline:** https://quarto-tdg.org/look-under-hood
- **Pandoc Filters:** https://pandoc.org/filters.html
- **Tree-sitter LR(1) Limitations:**
  - https://github.com/tree-sitter/tree-sitter/issues/1005
  - https://github.com/tree-sitter/tree-sitter/issues/1252

## Conclusion

The Quarto Markdown Parser and tree-sitter-pandoc-markdown represent two valid approaches to parsing Pandoc Markdown, optimized for different use cases:

- **Quarto:** Rendering-focused, Pandoc AST compatible, filter ecosystem integration
- **Ours:** Editor-focused, semantic precision, tree-sitter ecosystem integration

Our investigation validates that both projects have made correct architectural decisions for their respective goals. The convergence on LR(1) limitations provides external validation of our analysis. Rather than viewing this as competition, we should view it as complementary tools serving different parts of the Pandoc Markdown ecosystem.

---

**Document Version:** 1.0
**Last Updated:** 2025-10-13
**Author:** Analysis conducted during simple tables implementation research
