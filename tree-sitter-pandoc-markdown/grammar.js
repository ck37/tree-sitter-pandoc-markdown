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

  externals: $ => [
    // $.line_block_start,  // DEFERRED: Requires grammar restructuring to prevent conflicts with pipe_table
    //                       // See OPTIONS_FOR_PROCEEDING.md and EXTERNAL_SCANNER_RESOURCES.md
    $.pipe_table_start,
  ],

  conflicts: $ => [
    [$._inline_element, $._link_text_element],
    [$.pipe_table, $.paragraph],              // '|' can start either pipe table or inline content
    [$.pipe_table_header, $.inline],          // Header row vs inline parsing
  ],

  rules: {
    document: $ => choice(
      seq($.yaml_front_matter, repeat($._block)),
      seq($.percent_metadata, repeat($._block)),
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
      $.pipe_table,  // NOTE: line_block deferred - see OPTIONS_FOR_PROCEEDING.md
      $.shortcode_block,
      $.raw_block,
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

    fenced_div: $ => seq(
      field('open', alias(token(/:::+/), $.fenced_div_delimiter)),
      optional(field('attributes', $.attribute_list)),
      /\r?\n/,
      repeat($._block),
      field('close', alias(token(prec(10, /:::+/)), $.fenced_div_delimiter)),
      /\r?\n/
    ),

    yaml_front_matter: $ => prec(-1, seq(
      field('start', alias(token(seq('---', /\r?\n/, /[^\r\n]+/)), $.yaml_front_matter_start)),
      /\r?\n/,
      repeat(choice(
        seq(alias(token(prec(-1, /[^\r\n]+/)), $.yaml_front_matter_content), /\r?\n/),
        /\r?\n/
      )),
      field('close', alias(token(prec(1, choice('---', '...'))), $.yaml_front_matter_delimiter)),
      /\r?\n/
    )),

    percent_metadata: $ => prec(-1, seq(
      field('title', alias(token(seq('%', /[ \t]*/, /[^\r\n]+/)), $.percent_metadata_title)),
      /\r?\n/,
      optional(seq(
        field('author', alias(token(seq('%', /[ \t]*/, /[^\r\n]+/)), $.percent_metadata_author)),
        /\r?\n/,
        optional(seq(
          field('date', alias(token(seq('%', /[ \t]*/, /[^\r\n]*/)), $.percent_metadata_date)),
          /\r?\n/
        ))
      ))
    )),

    // Inline content
    inline: $ => prec.right(repeat1($._inline_element)),

    _inline_element: $ => choice(
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

    raw_inline: $ => prec.dynamic(4, prec(4, seq(
      '`',
      field('content', optional(alias(/[^`]+/, $.raw_inline_content))),
      '`',
      field('format', alias(token.immediate(/\{=[A-Za-z0-9_+-]+\}/), $.raw_format))
    ))),

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

    // DEFERRED: Line blocks require grammar restructuring to avoid conflicts with pipe tables
    // The issue is that both LINE_BLOCK_START and PIPE_TABLE_START become valid simultaneously
    // in the grammar, causing GLR parser conflicts. This requires either:
    //   1. Deep grammar restructuring (context-specific block rules)
    //   2. Alternative syntax (e.g., || instead of |)
    //   3. Advanced scanner state management
    // See OPTIONS_FOR_PROCEEDING.md and EXTERNAL_SCANNER_RESOURCES.md for details.
    //
    // line_block: $ => seq(
    //   $.line_block_start,
    //   $.line_block_line,
    //   repeat($.line_block_line)
    // ),
    //
    // line_block_line: $ => seq(
    //   field('marker', alias(token(prec(1, /\|[ \t]+/)), $.line_block_marker)),
    //   optional(field('content', $.inline)),
    //   /\r?\n/
    // ),

    pipe_table: $ => prec(1, seq(
      field('header', $.pipe_table_header),
      field('delimiter', $.pipe_table_delimiter),
      repeat1(field('row', $.pipe_table_row))
    )),

    pipe_table_header: $ => prec.right(seq(
      '|',
      $.pipe_table_start,  // Zero-width token AFTER '|' to validate this is a pipe table
      optional($.pipe_table_header_cell),
      repeat1(seq('|', optional($.pipe_table_header_cell))),
      /\r?\n/
    )),

    pipe_table_header_cell: $ => token(/[^\r\n|]+/),

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

    pipe_table_row: $ => prec.right(seq(
      '|',
      optional($.pipe_table_cell),
      repeat1(seq('|', optional($.pipe_table_cell))),
      /\r?\n/
    )),

    pipe_table_cell: $ => token(/[^\r\n|]+/),

    text: $ => prec.right(repeat1(choice(
      /[^\n\r`#<>\-\[\]{}@\^$|~=+]+/,
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

    // Raw blocks
    raw_block: $ => prec(2, seq(
      field('delimiter', alias(token(/```+/), $.raw_block_delimiter)),
      field('format', alias(token(/\{=[A-Za-z0-9_+-]+\}/), $.raw_format)),
      /\r?\n/,
      optional(field('content', alias(repeat1(seq($.raw_block_line, /\r?\n/)), $.raw_block_content))),
      field('delimiter', alias(token(/```+/), $.raw_block_delimiter)),
      /\r?\n/
    )),

    raw_block_line: $ => token(/[^\r\n]*/),

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
