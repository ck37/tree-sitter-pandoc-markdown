(emphasis) @text.emphasis
(strong_emphasis) @text.strong

(code_span) @text.literal
(code_span_content) @text.literal

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

