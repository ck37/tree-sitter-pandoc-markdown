# Disabled Tests

This directory contains test cases that have been temporarily disabled because the features they test are not yet implemented or conflict with other features.

## Line Blocks (line-blocks.txt)

**Status**: Disabled due to pattern conflict with pipe tables

**Issue**: Line blocks use the `|` character as a marker, which conflicts with pipe table delimiters. Tree-sitter's LR parser cannot disambiguate these patterns without lookahead.

**Example**:
```markdown
| First line
| Second line
```

This could be either:
- A line block (Pandoc feature for preserving line breaks)
- An incomplete pipe table header

**Resolution Required**: External scanner (C code) needed to perform context-aware lexing by looking ahead to determine if the pattern represents a table structure or line block.

**Restoration**: These tests can be moved back to `test/corpus/foundation.txt` once the external scanner is implemented and the `line_block` grammar rules are restored.

**Reference**: See plan.md Phase 1F section for details on this known issue.
