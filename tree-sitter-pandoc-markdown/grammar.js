/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Standalone Pandoc Markdown Block Grammar
// Phase 1A: Minimal working grammar foundation

module.exports = grammar({
  name: 'pandoc_markdown',

  extras: $ => [/\s/],

  rules: {
    document: $ => repeat($._block),

    _block: $ => choice(
      $.atx_heading,
      $.setext_heading,
      $.block_quote,
      $.paragraph,
      $.fenced_code_block,
      $.list,
      $.thematic_break,
      $.blank_line
    ),

    // Headings
    atx_heading: $ => seq(
      field('marker', alias(token(prec(1, /#{1,6}[ \t]*/)), $.atx_heading_marker)),
      optional(field('content', $.inline)),
      /\r?\n/
    ),

    setext_heading: $ => seq(
      field('content', $.inline),
      /\r?\n/,
      field('underline', alias(choice(token(/=+/), token(/-+/)), $.setext_heading_marker)),
      /\r?\n/
    ),

    block_quote: $ => prec.right(seq(
      $.block_quote_line,
      repeat($.block_quote_line)
    )),

    block_quote_line: $ => seq(
      field('marker', alias(token(prec(1, seq('>', optional(/[ \t]/)))), $.block_quote_marker)),
      optional(field('content', $.inline)),
      /\r?\n/
    ),

    // Paragraph
    paragraph: $ => prec.right(seq(
      field('content', $.inline),
      /\r?\n/
    )),

    // Inline content
    inline: $ => prec.right(repeat1($._inline_element)),

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
      field('content', optional(alias(/[^`\r\n]+/, $.code_span_content))),
      '`'
    )),

    text: $ => prec.right(repeat1(choice(
      /[^\n\r*_`#>\-]+/,
      /[>*_`]/
    ))),

    // Fenced code blocks
    fenced_code_block: $ => seq(
      field('delimiter', alias(token(/```+/), $.fenced_code_block_delimiter)),
      optional(field('language', $.language)),
      /\r?\n/,
      optional(field('content', alias(repeat(seq(/[^\r\n]*/, /\r?\n/)), $.code_fence_content))),
      field('delimiter', alias(token(/```+/), $.fenced_code_block_delimiter)),
      /\r?\n/
    ),

    language: $ => token(/[^\r\n]+/),

    // Lists
    list: $ => prec.right(seq(
      $.list_item,
      repeat(seq(optional($.blank_line), $.list_item))
    )),

    list_item: $ => seq(
      field('marker', choice(
        alias(token(seq(choice('-', '*', '+'), /[ \t]+/)), $.list_marker),
        alias(token(seq(/[0-9]+\./, /[ \t]+/)), $.list_marker)
      )),
      optional(field('content', $.inline)),
      /\r?\n/
    ),

    // Thematic break
    thematic_break: $ => seq(
      choice(
        /---+/,
        /\*\*\*+/,
        /___+/
      ),
      /\r?\n/
    ),

    // Blank line
    blank_line: $ => /\r?\n/
  }
});
