/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Standalone Pandoc Markdown Inline Grammar
// Phase 1A: Minimal working grammar foundation

module.exports = grammar({
  name: 'pandoc_markdown_inline',

  extras: $ => [/\s/],

  rules: {
    inline: $ => repeat1($._inline_element),

    _inline_element: $ => choice(
      $.emphasis,
      $.strong_emphasis,
      $.code_span,
      $.text
    ),

    emphasis: $ => choice(
      prec.left(1, seq('*', repeat1($._inline_no_star), '*')),
      prec.left(1, seq('_', repeat1($._inline_no_underscore), '_'))
    ),

    strong_emphasis: $ => choice(
      prec.left(2, seq('**', repeat1($._inline_element), '**')),
      prec.left(2, seq('__', repeat1($._inline_element), '__'))
    ),

    _inline_no_star: $ => choice(
      $.strong_emphasis,
      $.code_span,
      $.text
    ),

    _inline_no_underscore: $ => choice(
      $.strong_emphasis,
      $.code_span,
      $.text
    ),

    code_span: $ => prec(3, seq(
      '`',
      field('content', optional(alias(/[^`]+/, $.code_span_content))),
      '`'
    )),

    text: $ => prec.right(repeat1(choice(
      /[^\n\r*_`\[]+/, 
      /[*_`]/
    )))
  }
});
