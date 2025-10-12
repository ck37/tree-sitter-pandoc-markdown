/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Standalone Pandoc Markdown Inline Grammar
// Phase 1A: Minimal working grammar foundation

module.exports = grammar({
  name: 'pandoc_markdown_inline',

  extras: $ => [/\s/],

  conflicts: $ => [
    [$._inline_element, $._link_text_element]
  ],

  rules: {
    inline: $ => repeat1($._inline_element),

    _inline_element: $ => choice(
      $.emphasis,
      $.strong_emphasis,
      $.raw_inline,
      $.code_span,
      $.link,
      $.autolink,
      $.html_inline,
      $.citation_group,
      $.cross_reference,
      $.citation,
      $.attribute_list,
      $.image,
      $.strikethrough,
      $.highlight,
      $.subscript,
      $.superscript,
      $.underline,
      $.attribute_span,
      $.footnote_reference,
      $.inline_footnote,
      $.inline_math,
      $.text
    ),

    emphasis: $ => choice(
      // Standard single-delimiter emphasis
      prec.left(1, seq('*', repeat1($._inline_no_star), '*')),
      prec.left(1, seq('_', repeat1($._inline_no_underscore), '_')),
      // Triple-delimiter: emphasis wrapping strong_emphasis
      prec(1, seq('*', $.strong_emphasis, '*')),
      prec(1, seq('_', $.strong_emphasis, '_'))
    ),

    strong_emphasis: $ => choice(
      prec.left(2, seq('**', repeat1($._inline_element), '**')),
      prec.left(2, seq('__', repeat1($._inline_element), '__'))
    ),

    _inline_no_star: $ => choice(
      $.strong_emphasis,
      $.raw_inline,
      $.code_span,
      $.link,
      $.autolink,
      $.html_inline,
      $.citation_group,
      $.cross_reference,
      $.citation,
      $.attribute_list,
      $.image,
      $.strikethrough,
      $.highlight,
      $.subscript,
      $.superscript,
      $.underline,
      $.attribute_span,
      $.footnote_reference,
      $.inline_footnote,
      $.inline_math,
      $.text
    ),

    _inline_no_underscore: $ => choice(
      $.strong_emphasis,
      $.raw_inline,
      $.code_span,
      $.link,
      $.autolink,
      $.html_inline,
      $.citation_group,
      $.cross_reference,
      $.citation,
      $.attribute_list,
      $.image,
      $.strikethrough,
      $.highlight,
      $.subscript,
      $.superscript,
      $.underline,
      $.attribute_span,
      $.footnote_reference,
      $.inline_footnote,
      $.inline_math,
      $.text
    ),

    code_span: $ => prec(3, seq(
      '`',
      field('content', optional(alias(/[^`]+/, $.code_span_content))),
      '`'
    )),

    raw_inline: $ => prec(4, seq(
      '`',
      field('content', optional(alias(/[^`]+/, $.raw_inline_content))),
      '`',
      field('format', alias(token.immediate(/\{=[A-Za-z0-9_+-]+\}/), $.raw_format))
    )),

    autolink: $ => token(choice(
      /<[^\s<>]+:[^\s<>]+>/,
      /<[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9.-]+>/
    )),

    html_inline: $ => token(/<\/?[A-Za-z][^>\r\n]*>/),

    citation_group: $ => token(/\[[^\]\r\n]*@[A-Za-z0-9_.:+-][^\]\r\n]*\]/),

    cross_reference: $ => token(/@[A-Za-z0-9_.+-]+:[A-Za-z0-9_.:+-]*[A-Za-z0-9_+-]/),

    citation: $ => token(/@[A-Za-z0-9_.+-]*[A-Za-z0-9_+-]/),

    attribute_list: $ => token(/\{[^={}\r\n][^{}\r\n]*\}|\{\}/),

    strikethrough: $ => token(/~~[^~\r\n]+~~/),

    highlight: $ => token(/==[^=\r\n]+==/),

    subscript: $ => token(/~[^~\r\n]+~/),

    superscript: $ => token(/\^[^\[\^\r\n][^\^\r\n]*\^/),

    underline: $ => token(/\+[^+\r\n]+\+/),

    attribute_span: $ => seq(
      '[',
      field('content', optional($.inline)),
      ']',
      field('attributes', alias(token.immediate(/\{[^{}\r\n]*\}/), $.attribute_list))
    ),

    footnote_reference: $ => token(/\[\^[^\]\r\n]+\]/),

    inline_footnote: $ => token(/\^\[[^\]\r\n]+\]/),

    inline_math: $ => prec(2, seq(
      field('open', alias(token('$'), $.math_delimiter)),
      field('content', optional(alias($.inline_math_content, $.math_content))),
      field('close', alias(token('$'), $.math_delimiter))
    )),

    inline_math_content: $ => prec.right(repeat1(choice(
      token.immediate(/[^\\$\r\n]+/),
      seq('\\', token.immediate(/./))
    ))),

    link: $ => seq(
      '[',
      field('text', optional($.link_text)),
      ']',
      choice(
        seq(
          '(',
          field('destination', optional($.link_destination)),
          ')'
        ),
        seq(
          '[',
          field('reference', optional($.link_label)),
          ']'
        )
      )
    ),

    image: $ => seq(
      '!',
      '[',
      field('alt', optional($.link_text)),
      ']',
      choice(
        seq(
          '(',
          field('destination', optional($.link_destination)),
          ')'
        ),
        seq(
          '[',
          field('reference', optional($.link_label)),
          ']'
        )
      )
    ),

    link_text: $ => repeat1($._link_text_element),

    _link_text_element: $ => choice(
      $.emphasis,
      $.strong_emphasis,
      $.raw_inline,
      $.code_span,
      $.strikethrough,
      $.highlight,
      $.subscript,
      $.superscript,
      $.underline,
      $.attribute_span,
      $.text
    ),

    link_destination: $ => /[^)\r\n]+/,

    link_label: $ => repeat1($._link_text_element),

    text: $ => prec.right(repeat1(choice(
      /[^\n\r*_`<>\[\]{}@\^$|~+=]+/, 
      /[*_`]/
    )))
  }
});
