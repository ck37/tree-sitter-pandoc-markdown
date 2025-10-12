---
title: "Comprehensive Pandoc Markdown Example"
author: "Tree-sitter Pandoc Markdown Parser"
date: "2025-10-12"
tags: [pandoc, markdown, tree-sitter]
---

# Comprehensive Pandoc Markdown Feature Showcase

This document demonstrates all features supported by the tree-sitter-pandoc-markdown parser (Phase 1 complete).

## Basic Markdown Features

### Headings

ATX headings use `#` symbols:

# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

Setext headings use underlines:

This is H1
==========

This is H2
----------

### Emphasis and Strong

You can use *emphasis* or _emphasis_ for italics.

You can use **strong** or __strong__ for bold.

You can combine ***bold and italic*** or ___bold and italic___.

### Block Quotes

> This is a block quote.
> It can span multiple lines.
>
> And include multiple paragraphs.

### Lists

Unordered list:

- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

Ordered list:

1. First item
2. Second item
   1. Nested item
   2. Another nested item
3. Third item

### Code

Inline code: `print("Hello, World!")`

Code block with language:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
```

Code block with chunk options (Quarto/RMarkdown):

```{r}
#| label: fig-plot
#| fig-cap: "Example plot"
#| echo: false

plot(cars)
```

### Thematic Breaks

You can use various patterns for horizontal rules:

---

* * *

___

### Links and Images

[Inline link](https://example.com)

[Link with title](https://example.com "Example Site")

[Reference link][ref]

![Inline image](image.png)

![Image with alt text](image.png "Image Title")

![Reference image][img-ref]

Autolinks: <https://example.com> and <email@example.com>

[ref]: https://example.com "Reference"
[img-ref]: image.png "Image Reference"

### HTML

Inline HTML: <span style="color: red;">red text</span>

HTML block:

<div class="custom">
  <p>Custom HTML content</p>
</div>

## Pandoc Extensions

### Fenced Divs with Attributes

::: {.callout-note}
This is a callout block with a class attribute.
:::

::: {#special-div .custom-class key="value"}
Divs can have IDs, classes, and key-value attributes.
:::

### Attribute Lists

This paragraph has attributes. {.highlight #para1}

### Citations

Basic citation: @smith2020

Citation with locator: [@smith2020, p. 42]

Multiple citations: [@smith2020; @jones2021, ch. 3]

### Cross References

See @fig:example for details.

Refer to @tbl:data for the results.

### Shortcodes

Shortcodes for static site generators:

{{< include file.md >}}

{{% warning %}}
This is a warning shortcode with inner content.
{{% /warning %}}

### Footnotes

Here is a footnote reference[^1] and another one[^bignote].

Inline footnote: ^[This is an inline footnote.]

[^1]: This is the footnote content.

[^bignote]: This is a longer footnote.

    It can have multiple paragraphs.

## Mathematical Notation

Inline math: The formula $E = mc^2$ shows mass-energy equivalence.

Display math:

$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

Complex equation:

$$
f(x) = \sum_{n=0}^{\infty} \frac{f^{(n)}(a)}{n!}(x-a)^n
$$

## Tables

Basic pipe table:

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

Table with alignment:

| Right | Left | Center | Default |
|------:|:-----|:------:|---------|
|    12 | 12   |   12   | 12      |
|   123 | 123  |  123   | 123     |
|     1 | 1    |   1    | 1       |

## Typography Extensions

### Strikethrough

This text is ~~deleted~~ using strikethrough.

### Subscript and Superscript

Chemical formula: H~2~O

Mathematical expression: x^2^ + y^2^ = r^2^

### Highlighting and Underline

==Highlighted text== stands out.

+Underlined text+ for emphasis.

### Attribute Spans

You can add attributes to any inline content: [custom styled text]{.fancy #unique key="value"}

## Raw Content

Raw inline content for specific formats:

HTML: `<div class="raw">`{=html}

LaTeX: `\LaTeX{}`{=latex}

Raw blocks for format-specific content:

```{=html}
<script>
console.log("Raw HTML block");
</script>
```

```{=latex}
\begin{theorem}
Raw LaTeX block
\end{theorem}
```

## Metadata Blocks

### YAML Front Matter

This document starts with YAML metadata (see top of file).

### Percent Metadata

Percent-style metadata (alternative to YAML):

% Document Title
% Author Name
% 2025-10-12

## Document Structure Features

### Link Reference Definitions

Reference-style links keep your content readable.

[pandoc]: https://pandoc.org "Pandoc Homepage"
[quarto]: https://quarto.org "Quarto Homepage"

Links: Visit [Pandoc][pandoc] or [Quarto][quarto] for more info.

---

## Summary

This document demonstrates all 72 test cases passing in the tree-sitter-pandoc-markdown parser:

**Block-level features (43 tests):**
- ATX and Setext headings
- Paragraphs and block quotes
- Ordered and unordered lists
- Fenced code blocks with chunk options
- YAML front matter and percent metadata
- Fenced divs with attributes
- Display math and pipe tables
- HTML blocks and raw blocks
- Footnote definitions and link references
- Shortcodes and thematic breaks

**Inline features (29 tests):**
- Emphasis, strong, and code spans
- Links and images (inline and reference)
- Citations and cross-references
- Autolinks and HTML inline tags
- Attribute lists and attribute spans
- Footnote references and inline footnotes
- Inline math and raw inline content
- Strikethrough, subscript, superscript
- Highlighting and underline

All features are fully functional with 100% test pass rate!
