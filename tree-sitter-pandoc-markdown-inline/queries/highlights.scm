(emphasis) @text.emphasis
(strong_emphasis) @text.strong

(code_span) @text.literal
(code_span_content) @text.literal

(raw_inline) @text.literal
(raw_inline_content) @text.literal
(raw_format) @property

(link
  (link_text) @text.reference
  (link_destination) @text.uri)

(link
  (link_label) @text.reference)

(image
  (link_text) @text.reference
  (link_destination)? @text.uri)

(image
  (link_label) @text.reference)

(autolink) @text.uri

(citation_group) @text.reference
(citation) @text.reference
(cross_reference) @text.reference

(footnote_reference) @text.reference
(inline_footnote) @comment

(strikethrough) @text.strike
(highlight) @text.highlight
(subscript) @text.subscript
(superscript) @text.super
(underline) @text.underline

(attribute_span
  (inline)? @text)
(attribute_span
  (attribute_list) @property)

(inline_math
  (math_content)? @string)

(math_delimiter) @punctuation.special

(html_inline) @tag

(attribute_list) @property

