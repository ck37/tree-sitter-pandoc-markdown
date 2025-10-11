(atx_heading
  (inline) @text.title)

(atx_heading_marker) @punctuation.special

(setext_heading
  (inline) @text.title)

(setext_heading_marker) @punctuation.special

(fenced_code_block) @text.literal
(fenced_code_block_delimiter) @punctuation.delimiter
(code_fence_content) @text.literal
(code_fence_line_text) @text.literal
(chunk_option) @comment

(fenced_div_delimiter) @punctuation.special

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

(html_open_tag) @tag
(html_close_tag) @tag
(html_block_content) @text.literal

(image
  (link_text) @text.reference
  (link_destination)? @text.uri)

(image
  (link_label) @text.reference)

(link_reference_definition
  (link_label) @text.reference
  (link_destination)? @text.uri
  (link_title)? @string)

(autolink) @text.uri

(citation_group) @text.reference
(citation) @text.reference
(cross_reference) @text.reference
(shortcode) @constant.macro

(html_inline) @tag

(language) @type
(attribute_list) @property
(info_string_text) @string
