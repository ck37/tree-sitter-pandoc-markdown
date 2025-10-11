/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// Standalone Pandoc Markdown Block Grammar
// Phase 1A: Minimal working grammar foundation

function thematicLine(char) {
  return token(new RegExp(`${char}(?:[ \t]*${char}){2,}[ \t]*`));
}

module.exports = grammar({
  name: 'pandoc_markdown',

  extras: $ => [/\s/],

  conflicts: $ => [
    [$._inline_element, $._link_text_element],
  ],

  rules: {
    document: $ => choice(
      seq($.yaml_front_matter, repeat($._block)),
      repeat($._block)
    ),

    _block: $ => choice(
      $.atx_heading,
      $.setext_heading,
      $.block_quote,
      $.footnote_definition,
      $.link_reference_definition,
      $.fenced_div,
      $.display_math,
      $.pipe_table,
      $.shortcode_block,
      $.paragraph,
      $.html_block,
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
    paragraph: $ => prec.left(-2, seq(
      field('content', $.inline),
      /\r?\n/
    )),

    html_block: $ => seq(
      field('open', alias(token(prec(1, /<[^>\s]+[^>]*>/)), $.html_open_tag)),
      repeat(seq(alias(/[^<\r\n][^\r\n]*/, $.html_block_content), /\r?\n/)),
      field('close', alias(token(/<\/[A-Za-z][^>]*>/), $.html_close_tag)),
      /\r?\n/
    ),

    fenced_div: $ => prec.right(seq(
      field('open', alias(token(/:::+/), $.fenced_div_delimiter)),
      optional(field('attributes', $.attribute_list)),
      /\r?\n/,
      repeat($._block),
      field('close', alias(token(/:::+/), $.fenced_div_delimiter)),
      /\r?\n/
    )),

    yaml_front_matter: $ => prec(-1, seq(
      field('start', alias(token(seq('---', /\r?\n/, /[^:\r\n]+:[^\r\n]*/)), $.yaml_front_matter_start)),
      /\r?\n/,
      repeat(choice(
        seq(alias(token(prec(-1, /[^\r\n]+/)), $.yaml_front_matter_content), /\r?\n/),
        /\r?\n/
      )),
      field('close', alias(token(prec(1, choice('---', '...'))), $.yaml_front_matter_delimiter)),
      /\r?\n/
    )),

    // Inline content
    inline: $ => prec.right(repeat1($._inline_element)),

    _inline_element: $ => choice(
      $.emphasis,
      $.strong_emphasis,
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
      $.text
    ),

    _inline_no_underscore: $ => choice(
      $.strong_emphasis,
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
      $.text
    ),

    code_span: $ => prec(3, seq(
      '`',
      field('content', optional(alias(/[^`\r\n]+/, $.code_span_content))),
      '`'
    )),

    autolink: $ => token(choice(
      /<[^\s<>]+:[^\s<>]+>/,
      /<[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9.-]+>/
    )),

    html_inline: $ => token(/<\/?[A-Za-z][^>\r\n]*>/),

    citation_group: $ => token(/\[[^\]\r\n]*@[A-Za-z0-9_.:+-][^\]\r\n]*\]/),

    cross_reference: $ => token(/@[A-Za-z0-9_.+-]+:[A-Za-z0-9_.:+-]*[A-Za-z0-9_+-]/),

    citation: $ => token(/@[A-Za-z0-9_.+-]*[A-Za-z0-9_+-]/),

    attribute_list: $ => token(/\{[^{}\r\n]*\}/),

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

    shortcode_block: $ => seq(field('shortcode', $.shortcode), /\r?\n/),

    shortcode: $ => token(/\{\{[<%][^{}\r\n]*[>%]\}\}/),

    footnote_definition: $ => prec(1, seq(
      field('label', alias(token(/\[\^[^\]\r\n]+\]:/), $.footnote_label)),
      optional(/[ \t]*/),
      field('content', optional($.inline)),
      /\r?\n/
    )),

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

    display_math: $ => prec.right(seq(
      field('open', alias(token('$$'), $.math_delimiter)),
      optional(/\r?\n/),
      field('content', optional(alias($.display_math_content, $.math_content))),
      field('close', alias(token('$$'), $.math_delimiter)),
      /\r?\n/
    )),

    display_math_content: $ => prec.right(repeat1(choice(
      token.immediate(/[^\\$]+/),
      seq('\\', token.immediate(/./)),
      token.immediate(/\r?\n/)
    ))),

    pipe_table: $ => prec.right(seq(
      field('header', $.pipe_table_header),
      field('delimiter', $.pipe_table_delimiter),
      repeat1(field('row', $.pipe_table_row))
    )),

    pipe_table_header: $ => seq(
      '|',
      field('cell', $.pipe_table_header_cell),
      repeat1(seq('|', field('cell', $.pipe_table_header_cell))),
      optional('|'),
      /\r?\n/
    ),

    pipe_table_header_cell: $ => seq(
      field('content', alias(token(/[^\r\n|]+/), $.pipe_table_cell_content))
    ),

    pipe_table_delimiter: $ => seq(
      '|',
      field('alignment', $.pipe_table_alignment),
      repeat1(seq('|', field('alignment', $.pipe_table_alignment))),
      optional('|'),
      /\r?\n/
    ),

    pipe_table_alignment: $ => seq(
      field('marker', alias(token(prec(2, /:?-{3,}:?/)), $.pipe_table_alignment_marker))
    ),

    pipe_table_row: $ => seq(
      '|',
      field('cell', $.pipe_table_cell),
      repeat1(seq('|', field('cell', $.pipe_table_cell))),
      optional('|'),
      /\r?\n/
    ),

    pipe_table_cell: $ => seq(
      field('content', alias(token(/[^\r\n|]+/), $.pipe_table_cell_content))
    ),

    text: $ => prec.right(repeat1(choice(
      /[^\n\r*_`#<>\-\[\]{}@\^$|~=+]+/, 
      /[>*_`]/
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

    link_reference_definition: $ => seq(
      '[',
      field('label', $.link_label),
      ']:',
      optional(/[ \t]*/),
      optional(field('destination', $.link_destination)),
      optional(seq(/[ \t]+/, field('title', $.link_title))),
      /\r?\n/
    ),

    link_title: $ => choice(
      seq('"', /[^"]*/, '"'),
      seq("'", /[^']*/, "'"),
      seq('(', /[^)]*/, ')')
    ),

    // Fenced code blocks
    fenced_code_block: $ => seq(
      field('delimiter', alias(token(/```+/), $.fenced_code_block_delimiter)),
      optional(field('info', $.info_string)),
      /\r?\n/,
      optional(field('content', alias(repeat1(choice(
        seq($.chunk_option, /\r?\n/),
        seq($.code_fence_line_text, /\r?\n/)
      )), $.code_fence_content))),
      field('delimiter', alias(token(/```+/), $.fenced_code_block_delimiter)),
      /\r?\n/
    ),

    chunk_option: $ => token(prec(1, /[ \t]*#\|[^\r\n]*/)),

    code_fence_line_text: $ => token(/[^\r\n]*/),

    info_string: $ => seq(
      choice(
        $.attribute_list,
        alias(token(/[A-Za-z0-9_+-]+/), $.language),
        alias(token(/[^\s\r\n{}]+/), $.info_string_text)
      ),
      repeat(seq(
        optional(/[ \t]+/),
        choice(
          $.attribute_list,
          alias(token(/[A-Za-z0-9_+-]+/), $.language),
          alias(token(/[^\s\r\n{}]+/), $.info_string_text)
        )
      ))
    ),

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
        thematicLine('\\*'),
        thematicLine('\-'),
        thematicLine('_')
      ),
      /\r?\n/
    ),

    // Blank line
    blank_line: $ => /\r?\n/
  }
});
