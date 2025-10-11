(fenced_code_block
  (info_string
    (language) @injection.language)?
  (code_fence_content) @injection.content)

((inline) @injection.content (#set! injection.language "pandoc_markdown_inline"))
