# Test File for Highlights Query

This file tests various syntax highlighting patterns.

## Headings

# H1 Heading
## H2 Heading
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

Setext Heading Level 1
======================

Setext Heading Level 2
----------------------

## Emphasis and Strong

*italic text* and _also italic_

**bold text** and __also bold__

***bold and italic*** and ___also both___

****deeply nested****

## Links and Images

[link text](https://example.com)
[reference link][ref]
![image alt](image.png)
![reference image][img]

<https://autolink.com>
<email@example.com>

[ref]: https://example.com "Title"
[img]: image.png

## Code

Inline `code span` and `` `backticks` ``.

```python
# Python code block
def hello():
    print("world")
```

```javascript
// JavaScript code
console.log('hello');
```

## Pandoc Extensions

### Citations and References

See @doe2020 for details.
Multiple citations [@smith2019; @jones2021].
Cross-reference @fig:results and @tbl:data.

### Attributes

This is [styled text]{.highlight #custom key="value"}.

Paragraph with attributes {.important}

### Fenced Divs

:::warning
This is a warning div.
:::

:::{.note #special}
Div with attributes
:::

### Math

Inline math $E = mc^2$ in text.

Display math:
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$

### Footnotes

Here is a footnote reference[^1].

And an inline footnote^[This is inline].

[^1]: This is the footnote content.

### Special Formatting

~~strikethrough~~ text
==highlighted== text
H~2~O is water
E=mc^2^ is famous
+underlined+ text

### Raw Content

Raw HTML `<span class="test">content</span>`{=html} inline.

Raw LaTeX `\textbf{bold}`{=latex} text.

```{=html}
<div class="custom">
  <p>HTML block</p>
</div>
```

### Lists

- Unordered list
  - Nested item
  - Another nested

1. Ordered list
2. Second item
   1. Nested ordered

### Block Quote

> This is a quote
> with multiple lines
>
> > Nested quote

### Thematic Break

---

* * *

### HTML

<div class="container">
  Inline <strong>HTML</strong> tags.
</div>

### YAML Front Matter

---
title: Document Title
author: Author Name
date: 2025-01-15
tags: [test, example]
---

### Percent Metadata

% Document Title
% Author Name
% 2025-01-15

### Shortcodes

{{< include "file.qmd" >}}

{{% callout note %}}
Content here
{{% /callout %}}

### Tables

| Left | Center | Right |
|:-----|:------:|------:|
| A    |   B    |     C |

### Chunk Options

```{python}
#| label: fig-plot
#| fig-cap: "A nice plot"
#| echo: false
import matplotlib.pyplot as plt
```
