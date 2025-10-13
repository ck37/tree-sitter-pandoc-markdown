; Pandoc Markdown Language Injection Queries
; Enable syntax highlighting for embedded code and content

; ============================================================================
; Fenced Code Blocks (language-specific)
; ============================================================================

; Generic language injection from info string
(fenced_code_block
  (info_string
    (language) @injection.language)?
  (code_fence_content) @injection.content)

; ============================================================================
; Inline Content (Pandoc inline grammar)
; ============================================================================

; Inject inline grammar for all inline content
((inline) @injection.content
  (#set! injection.language "pandoc_markdown_inline"))

; ============================================================================
; Math (LaTeX)
; ============================================================================

; Display math - inject LaTeX
((display_math
  (math_content) @injection.content)
  (#set! injection.language "latex"))

; Inline math - inject LaTeX
((inline_math
  (math_content) @injection.content)
  (#set! injection.language "latex"))

; ============================================================================
; YAML Front Matter
; ============================================================================

; YAML frontmatter start (includes first line)
((yaml_front_matter_start) @injection.content
  (#set! injection.language "yaml"))

; YAML frontmatter content lines
((yaml_front_matter_content) @injection.content
  (#set! injection.language "yaml"))

; ============================================================================
; Raw Blocks with Format Markers
; ============================================================================

; Raw HTML blocks
((raw_block
  (raw_format) @_format
  (raw_block_content) @injection.content)
  (#eq? @_format "{=html}")
  (#set! injection.language "html"))

; Raw LaTeX blocks
((raw_block
  (raw_format) @_format
  (raw_block_content) @injection.content)
  (#eq? @_format "{=latex}")
  (#set! injection.language "latex"))

; Raw TeX blocks
((raw_block
  (raw_format) @_format
  (raw_block_content) @injection.content)
  (#eq? @_format "{=tex}")
  (#set! injection.language "latex"))

; ============================================================================
; Common Programming Languages
; ============================================================================

; Python
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "python")
  (#set! injection.language "python"))

; R
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "r")
  (#set! injection.language "r"))

; JavaScript
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#any-of? @_lang "javascript" "js")
  (#set! injection.language "javascript"))

; TypeScript
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#any-of? @_lang "typescript" "ts")
  (#set! injection.language "typescript"))

; ============================================================================
; Shell Scripts
; ============================================================================

; Bash/Shell
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#any-of? @_lang "bash" "sh" "shell" "zsh")
  (#set! injection.language "bash"))

; ============================================================================
; Web Technologies
; ============================================================================

; HTML
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "html")
  (#set! injection.language "html"))

; CSS
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "css")
  (#set! injection.language "css"))

; ============================================================================
; Data Formats
; ============================================================================

; JSON
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "json")
  (#set! injection.language "json"))

; YAML
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#any-of? @_lang "yaml" "yml")
  (#set! injection.language "yaml"))

; TOML
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "toml")
  (#set! injection.language "toml"))

; XML
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "xml")
  (#set! injection.language "xml"))

; ============================================================================
; Database
; ============================================================================

; SQL
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "sql")
  (#set! injection.language "sql"))

; ============================================================================
; Systems Programming
; ============================================================================

; C
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "c")
  (#set! injection.language "c"))

; C++
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#any-of? @_lang "cpp" "c++")
  (#set! injection.language "cpp"))

; Rust
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "rust")
  (#set! injection.language "rust"))

; Go
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#any-of? @_lang "go" "golang")
  (#set! injection.language "go"))

; ============================================================================
; Other Languages
; ============================================================================

; Ruby
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "ruby")
  (#set! injection.language "ruby"))

; Java
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "java")
  (#set! injection.language "java"))

; Julia
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "julia")
  (#set! injection.language "julia"))

; Lua
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#eq? @_lang "lua")
  (#set! injection.language "lua"))

; ============================================================================
; Markup & Documentation
; ============================================================================

; LaTeX
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#any-of? @_lang "latex" "tex")
  (#set! injection.language "latex"))

; Vim script
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#any-of? @_lang "vim" "viml")
  (#set! injection.language "vim"))

; Regex
((fenced_code_block
  (info_string
    (language) @_lang)
  (code_fence_content) @injection.content)
  (#any-of? @_lang "regex" "regexp")
  (#set! injection.language "regex"))
