const fs = require('fs');
const grammar = fs.readFileSync('grammar.js', 'utf8');

const fixed = grammar.replace(
  /emphasis: \$ => choice\(\s+\/\/ Standard single-delimiter emphasis\s+prec\.left\(1, seq\('\*', repeat1\(\$\._inline_no_star\), '\*'\)\),\s+prec\.left\(1, seq\('_', repeat1\(\$\._inline_no_underscore\), '_'\)\),\s+\/\/ Triple-delimiter: emphasis wrapping strong_emphasis\s+prec\(1, seq\('\*', \$\.strong_emphasis, '\*'\)\),\s+prec\(1, seq\('_', \$\.strong_emphasis, '_'\)\)\s+\),/,
  `emphasis: $ => choice(
      // Triple-delimiter: higher precedence to match before strong_emphasis
      prec(3, seq('*', $.strong_emphasis, '*')),
      prec(3, seq('_', $.strong_emphasis, '_')),
      // Standard single-delimiter emphasis
      prec.left(1, seq('*', repeat1($._inline_no_star), '*')),
      prec.left(1, seq('_', repeat1($._inline_no_underscore), '_'))
    ),`
);

fs.writeFileSync('grammar.js', fixed);
console.log('Fixed!');
