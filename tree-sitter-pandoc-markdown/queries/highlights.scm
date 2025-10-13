; Pandoc Markdown Highlighting Queries
; Modern semantic scopes following nvim-treesitter conventions

; ============================================================================
; Headings
; ============================================================================

; ATX headings with level distinction
(atx_heading
  (atx_heading_marker) @markup.heading.marker
  (inline) @markup.heading)

(atx_heading_marker) @markup.heading.1.marker
  (#match? @markup.heading.1.marker "^# ")

(atx_heading_marker) @markup.heading.2.marker
  (#match? @markup.heading.2.marker "^## ")

(atx_heading_marker) @markup.heading.3.marker
  (#match? @markup.heading.3.marker "^### ")

(atx_heading_marker) @markup.heading.4.marker
  (#match? @markup.heading.4.marker "^#### ")

(atx_heading_marker) @markup.heading.5.marker
  (#match? @markup.heading.5.marker "^##### ")

(atx_heading_marker) @markup.heading.6.marker
  (#match? @markup.heading.6.marker "^###### ")

; Setext headings
(setext_heading
  (inline) @markup.heading)

(setext_heading_marker) @markup.heading.marker

; ============================================================================
; Code
; ============================================================================

(fenced_code_block) @markup.raw.block
(fenced_code_block_delimiter) @punctuation.delimiter
(code_fence_content) @markup.raw.block
(code_fence_line_text) @markup.raw.block

(language) @markup.raw.language

(info_string_text) @comment

; Quarto/RMarkdown chunk options
(chunk_option) @comment

; ============================================================================
; Front Matter & Metadata
; ============================================================================

; YAML front matter (injected as YAML)
(yaml_front_matter_start) @markup.raw.block.frontmatter
(yaml_front_matter_delimiter) @punctuation.delimiter.frontmatter
(yaml_front_matter_content) @markup.raw.block.frontmatter

; Percent metadata
(percent_metadata_title) @markup.heading.metadata
(percent_metadata_author) @string.special.metadata
(percent_metadata_date) @string.special.metadata

; ============================================================================
; Math
; ============================================================================

(inline_math
  (math_content)? @markup.math.inline)

(display_math
  (math_content)? @markup.math.block)

(math_delimiter) @punctuation.delimiter.math

; ============================================================================
; Footnotes
; ============================================================================

(footnote_label) @markup.reference.footnote
(footnote_reference) @markup.reference.footnote
(inline_footnote) @markup.reference.footnote

; ============================================================================
; Tables
; ============================================================================

(pipe_table_header_cell) @markup.heading.table
(pipe_table_cell) @markup.list.table
(pipe_table_alignment_marker) @punctuation.delimiter.table

; ============================================================================
; Blocks
; ============================================================================

; Fenced divs (Pandoc containers)
(fenced_div_delimiter) @punctuation.delimiter.div

; Lists
(list_marker) @markup.list.marker

; Block quotes
(block_quote_marker) @markup.quote.marker

; Thematic breaks
(thematic_break) @punctuation.special.thematic_break

; ============================================================================
; Inline Formatting
; ============================================================================

; Note: emphasis and strong_emphasis are parsed by the inline grammar
; and will be highlighted via grammar injection

(strikethrough) @markup.strikethrough
(highlight) @markup.highlight
(subscript) @markup.subscript
(superscript) @markup.superscript
(underline) @markup.underline

; Code spans
(code_span) @markup.raw.inline
(code_span_content) @markup.raw.inline

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

(link_reference_definition
  (link_label) @markup.link.label
  (link_destination)? @markup.link.url
  (link_title)? @string)

(autolink) @markup.link.url

; ============================================================================
; Pandoc Extensions
; ============================================================================

; Citations
(citation_group) @markup.reference.citation
(citation) @markup.reference.citation

; Cross-references
(cross_reference) @markup.reference.cross_ref

; Shortcodes (Quarto/Hugo)
(shortcode) @keyword.directive

; Attributes
(attribute_span
  (inline)? @markup.raw)
(attribute_span
  (attribute_list) @attribute)

(attribute_list) @attribute

; Raw content
(raw_block) @markup.raw.block
(raw_block_delimiter) @punctuation.delimiter
(raw_block_content) @markup.raw.block
(raw_inline) @markup.raw.inline
(raw_inline_content) @markup.raw.inline
(raw_format) @attribute

; ============================================================================
; HTML
; ============================================================================

(html_open_tag) @tag
(html_close_tag) @tag
(html_block_content) @markup.raw.html
(html_inline) @tag

; ============================================================================
; Comments & Meta
; ============================================================================

; Note: Actual comments in markdown are HTML comments, handled by html_inline
