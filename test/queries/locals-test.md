# Locals Test File

Test go-to-definition and reference scoping.

## Link References

This tests link reference definitions and their usage.

Here is a [reference link][myref] in text.
Another [reference][myref] to the same definition.
A different [reference][other] to another definition.

[myref]: https://example.com/target "My Reference"
[other]: https://other.com "Other Reference"

## Footnotes

This tests footnote definitions and references.

Here is a footnote[^1] in text.
Multiple uses of same footnote[^1] should reference same definition.
Different footnote[^2] references different definition.

[^1]: This is the first footnote definition.

[^2]: This is the second footnote definition.
    It can have multiple paragraphs.

## Image References

View this ![image][img1] and this ![image][img2].

[img1]: images/first.png
[img2]: images/second.png

## Scoping

### Nested Scope 1

[local1]: #scope1 "Local to Scope 1"

Reference in scope: [link][local1]

### Nested Scope 2

[local2]: #scope2 "Local to Scope 2"

Different scope reference: [link][local2]

## Mixed References

Combined usage:

- Link: [text][myref]
- Image: ![alt][img1]
- Footnote: [^1]
- Cross-scope: [other][local1]
