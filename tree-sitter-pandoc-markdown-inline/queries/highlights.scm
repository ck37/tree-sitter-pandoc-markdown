; Pandoc Markdown Inline Highlighting Queries
; Modern semantic scopes following nvim-treesitter conventions

; ============================================================================
; Emphasis & Strong
; ============================================================================

(emphasis) @markup.italic
(strong_emphasis) @markup.bold

; Emphasis delimiters (asterisks, underscores)
(emphasis_delimiter) @punctuation.delimiter.emphasis

; ============================================================================
; Code
; ============================================================================

(code_span) @markup.raw.inline
(code_span_content) @markup.raw.inline

; Raw inline with format markers
(raw_inline) @markup.raw.inline
(raw_inline_content) @markup.raw.inline
(raw_format) @attribute

; ============================================================================
; Links & Images
; ============================================================================

(link
  (link_text) @markup.link.label
  (link_destination) @markup.link.url)

(link
  (link_label) @markup.link.label)

(image
  (link_text) @markup.link.label
  (link_destination)? @markup.link.url)

(image
  (link_label) @markup.link.label)

(autolink) @markup.link.url

; ============================================================================
; Pandoc Extensions
; ============================================================================

; Citations
(citation_group) @markup.reference.citation
(citation) @markup.reference.citation

; Cross-references
(cross_reference) @markup.reference.cross_ref

; Footnotes
(footnote_reference) @markup.reference.footnote
(inline_footnote) @markup.reference.footnote

; ============================================================================
; Special Formatting
; ============================================================================

(strikethrough) @markup.strikethrough
(highlight) @markup.highlight
(subscript) @markup.subscript
(superscript) @markup.superscript
(underline) @markup.underline

; ============================================================================
; Attributes
; ============================================================================

(attribute_span
  (inline)? @markup.raw)
(attribute_span
  (attribute_list) @attribute)

(attribute_list) @attribute

; ============================================================================
; Math
; ============================================================================

(inline_math
  (math_content)? @markup.math.inline)

(math_delimiter) @punctuation.delimiter.math

; ============================================================================
; HTML
; ============================================================================

(html_inline) @tag
