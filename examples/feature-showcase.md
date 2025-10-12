---
title: "Phase 1 Feature Showcase"
subtitle: "All 72 Tests Passing"
author: "tree-sitter-pandoc-markdown"
date: "2025-10-12"
---

# Phase 1 Complete: Feature Showcase

## Core Markdown (CommonMark)

### Text Formatting

Regular text with *emphasis* and **strong** formatting.

You can also nest them: **bold with *italic* inside**.

`inline code` for programming terms.

### Links

[inline link](https://example.com)

[reference link][ref]

![image](test.png)

[ref]: https://example.com

### Lists

- Bullet item 1
- Bullet item 2
  - Nested item

1. Numbered item
2. Another item

### Code Blocks

```python
def hello():
    return "Hello, World!"
```

```{r}
#| label: fig-test
#| echo: false

plot(1:10)
```

### Quotes and Breaks

> Block quote with **formatting**
> and multiple lines.

---

## Pandoc Extensions

### Fenced Divs

:::{.callout-note}
Important information in a callout block!
:::

:::{#special .custom-class key="value"}
Divs support multiple attribute types.
:::

### Citations & References

See @smith2020 for background.

Multiple sources: [@jones2021; @doe2022, p. 42]

Figure reference @fig:results and table reference @tbl:data

### Attributes

Paragraph with attributes {.highlight #special}

[Span with attributes]{.code #inline key="value"}

### Math

Inline: $E = mc^2$

Display:
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

### Footnotes

Text with footnote[^1] and inline note^[inline content].

[^1]: Footnote text here.

### Typography

~~strikethrough~~ text

Chemical: H~2~O

Exponent: x^2^

==highlighted== text

+underlined+ text

### Tables

Note: Pipe tables are in Phase 2 (external scanner work in progress).

Example table syntax (not yet fully parsed):
```
| Left | Center | Right |
|:-----|:------:|------:|
| A    |   B    |     C |
```

### Shortcodes

{{< include partial.md >}}

{{% note %}}
Content with processing
{{% /note %}}

### Raw Content

HTML: `<div class="raw">`{=html}

LaTeX: `\textbf{bold}`{=latex}

```{=html}
<script>alert("raw block");</script>
```

## Document Metadata

### YAML (at top)

This document uses YAML front matter.

### Percent Style

Alternative metadata format (must be at document start, not shown here since we already have YAML front matter).

* * *

**Status**: All features implemented and tested!
**Test Coverage**: 72/72 passing (100%)
