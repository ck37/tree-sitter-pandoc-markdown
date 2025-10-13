# Folds Test File

This file tests code folding patterns.

## Heading with Content

This section has content that should fold.
Multiple paragraphs here.

More content in the section.

## Another Heading

This should also fold independently.

### Nested Heading

Nested sections should fold recursively.

## Code Blocks

```python
def function():
    # This code block should fold
    print("hello")
    print("world")
```

```javascript
// Another code block
function test() {
  console.log('test');
}
```

## Fenced Divs

:::note
This is a note div.
It has multiple lines.
Should fold as a unit.
:::

:::{.important}
Important content here.
With more lines.
:::

## Block Quotes

> This is a quote
> with multiple lines
> that should fold together.

> Another quote
> > with nesting
> > that should also fold

## Lists

- Item 1
  - Nested A
  - Nested B
    - Deep nested
- Item 2
- Item 3

1. First ordered
2. Second ordered
   1. Nested ordered
   2. Another nested

## YAML Front Matter

---
title: Test Document
author: Test Author
date: 2025-01-15
metadata:
  key: value
  nested:
    deeper: value
---

## Footnotes

Long footnote definition[^long].

[^long]: This is a very long footnote
    that spans multiple lines
    and should fold to save space.

    It even has multiple paragraphs.

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |
| Row 3    | Data     | Data     |
| Row 4    | Data     | Data     |

## Raw Blocks

```{=html}
<div class="container">
  <h1>Title</h1>
  <p>Paragraph</p>
  <p>Another paragraph</p>
</div>
```

```{=latex}
\begin{document}
\title{Document}
\author{Author}
\maketitle
\end{document}
```
