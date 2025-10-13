# Text Objects Test File

Test nvim-treesitter text object selection.

## Code Blocks

```python
def hello():
    print("world")
    return True
```

```javascript
function test() {
  return 42;
}
```

## Links

This is [a link](https://example.com) with text.
Another [reference link][ref].

[ref]: https://example.com

## Emphasis

This has *italic emphasis* and **bold strong** and ***both combined***.

More emphasis with _underscores_ and __double underscores__.

## Headings

# Top Level

Content under top level.

## Second Level

Content under second level.

### Third Level

Deeply nested content.

## Lists

- First item
- Second item
  - Nested item
  - Another nested
- Third item

1. Ordered first
2. Ordered second
   1. Nested ordered
   2. Another nested

## Fenced Divs

:::note
This is a note div.
It has content.
:::

:::{.warning}
Warning content here.
Multiple lines.
:::

## Images

![Image description](path/to/image.png)

## Block Quotes

> This is a quote
> with multiple lines

## Inline Elements

Test `code span` and ~~strikethrough~~ and ==highlight==.

Subscript H~2~O and superscript E^2^ and +underline+.

## Math

Inline $x^2 + y^2 = z^2$ math.

## Attribute Spans

This is [styled content]{.highlight} with attributes.

## Tables

| Header | Header |
|--------|--------|
| Cell   | Cell   |
| Cell   | Cell   |
