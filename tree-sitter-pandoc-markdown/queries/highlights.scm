(atx_heading
  (inline) @text.title)

(atx_heading_marker) @punctuation.special

(setext_heading
  (inline) @text.title)

(setext_heading_marker) @punctuation.special

(fenced_code_block) @text.literal
(fenced_code_block_delimiter) @punctuation.delimiter
(code_fence_content) @text.literal

(list_marker) @punctuation.special
(block_quote_marker) @punctuation.special
(thematic_break) @punctuation.special

(emphasis) @text.emphasis
(strong_emphasis) @text.strong
(code_span) @text.literal
(code_span_content) @text.literal

(link
  (link_text) @text.reference
  (link_destination) @text.uri)

(link
  (link_label) @text.reference)

(link_reference_definition
  (link_label) @text.reference
  (link_destination)? @text.uri
  (link_title)? @string)
