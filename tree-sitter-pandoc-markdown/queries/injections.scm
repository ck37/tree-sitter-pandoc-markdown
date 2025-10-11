(fenced_code_block
  (info_string
    (language) @injection.language)?
  (code_fence_content) @injection.content)

((inline) @injection.content (#set! injection.language "pandoc_markdown_inline"))

((display_math (math_content) @injection.content)
  (#set! injection.language "latex"))

((inline_math (math_content) @injection.content)
  (#set! injection.language "latex"))
