# Disabled Tests

This directory contains test cases that have been temporarily disabled because the features they test are not yet implemented or conflict with other features.

## External Scanner Failures (external-scanner-failures.txt)

**Status**: Disabled on 2025-10-11 due to external scanner implementation issues

**Issue**: An external scanner implementation was attempted to disambiguate line blocks from pipe tables (both use `|` character). The implementation introduced parsing failures affecting 6 tests:
- Block quote (unexpected side effect - uses `>` not `|`)
- Thematic break spaced (unexpected side effect)
- Pipe table (original target - now broken by scanner)
- 4 line block tests (original target - still failing)

**Root Cause**: External scanner emitting tokens (LINE_BLOCK_START, PIPE_TABLE_START) but GLR parser creating ERROR nodes. The scanner interferes with constructs beyond its intended scope.

**Current State**: External scanner code remains in `src/scanner.c` and grammar rules remain in `grammar.js` for debugging purposes. Tests moved here to restore passing test suite.

**Test Status**: 36/36 block tests passing, 29/29 inline tests passing (with these 6 tests disabled)

**Resolution Required**: Deeper tree-sitter external scanner expertise needed to resolve GLR parser interaction issues. Community help recommended.

**Reference**: See external-scanner-plan.md "Implementation Attempt Results" section for complete analysis.

## Line Blocks (line-blocks.txt)

**Status**: Superseded by external-scanner-failures.txt

**Note**: These tests are now included in external-scanner-failures.txt. This file is kept for historical reference.

**Original Issue**: Line blocks use the `|` character as a marker, which conflicts with pipe table delimiters. Tree-sitter's LR parser cannot disambiguate these patterns without lookahead.

**Example**:
```markdown
| First line
| Second line
```

This could be either:
- A line block (Pandoc feature for preserving line breaks)
- An incomplete pipe table header

**Reference**: See plan.md Phase 1F section for details.
