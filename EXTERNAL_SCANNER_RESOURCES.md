# External Scanner Learning Resources

Compiled: 2025-10-11

## Academic Papers & Foundational Work

### Primary Source: Tim Wagner's Dissertation (1997)
- **Title**: "Practical Algorithms for Incremental Software Development Environments"
- **Institution**: UC Berkeley (CSD-97-946)
- **URL**: https://www2.eecs.berkeley.edu/Pubs/TechRpts/1997/CSD-97-946.pdf
- **Relevance**: This is the foundational work that Tree-sitter is based on. Contains three main algorithms: incremental lexing, incremental LR parsing, and incremental GLR parsing.
- **Key Concepts**:
  - Dynamic disambiguation techniques
  - Context-free syntax handling for C, C++, FORTRAN, COBOL
  - First known method for handling these languages in incremental framework
  - General language model

### Related Paper: Wagner & Graham (ACM TOPLAS)
- **Title**: "Efficient and Flexible Incremental Parsing"
- **Authors**: Tim A. Wagner and Susan L. Graham
- **URL**: https://harmonia.cs.berkeley.edu/papers/twagner-parsing.pdf
- **Note**: PDF format, may require special tools to extract text

### GLR Parsing Literature
- **GLR Basics**: Wikipedia - https://en.wikipedia.org/wiki/GLR_parser
- **Purely Functional GLL Parsing**: ScienceDirect paper on modern GLR variants
- **Faster, Practical GLL Parsing**: Springer - https://link.springer.com/chapter/10.1007/978-3-662-46663-6_5

## Tree-sitter Specific Resources

### Official Documentation
- **External Scanners Guide**: https://tree-sitter.github.io/tree-sitter/creating-parsers/4-external-scanners.html
- **Creating Parsers**: https://tree-sitter.github.io/tree-sitter/creating-parsers/

### Talks & Presentations
- **Strange Loop 2018**: "Tree-sitter - a new parsing system for programming tools" by Max Brunsfeld
- **Video**: Search YouTube for "Tree-sitter Max Brunsfeld Strange Loop"
- **Context**: Max Brunsfeld is the creator of Tree-sitter, now working at Zed

### Blog Posts & Articles
- **"A Comprehensive Introduction to Tree-sitter"** by Derek Stride
  - URL: https://derek.stride.host/posts/comprehensive-introduction-to-tree-sitter
- **"Structured Editing and Incremental Parsing"** by Laurence Tratt
  - URL: https://tratt.net/laurie/blog/2024/structured_editing_and_incremental_parsing.html
- **"Tree-sitter: Revolutionizing Parsing"** (Deus in Machina)
  - URL: https://www.deusinmachina.net/p/tree-sitter-revolutionizing-parsing

## Complex Scanner Implementations to Study

### 1. tree-sitter-python
- **URL**: https://github.com/tree-sitter/tree-sitter-python/blob/master/src/scanner.c
- **Complexity Level**: High
- **Key Features**:
  - Indent/dedent tracking with stack
  - String interpolation handling
  - Multiple string types (raw, bytes, f-strings)
  - Excellent example of valid_symbols usage
- **Study Focus**: How indent/dedent tokens work without conflicts

### 2. tree-sitter-ruby
- **URL**: https://github.com/tree-sitter/tree-sitter-ruby/blob/master/src/scanner.c
- **Complexity Level**: Very High
- **Key Features**:
  - Sophisticated token disambiguation (e.g., different minus operators)
  - Literal struct for nested delimited literals
  - Heredoc struct for complex heredoc parsing
  - Context-sensitive operator handling
  - Whitespace-sensitive parsing
- **Study Focus**: Context-sensitive disambiguation patterns

### 3. tree-sitter-yaml
- **URL**: https://github.com/ikatyang/tree-sitter-yaml/blob/master/src/scanner.cc
- **Complexity Level**: Very High
- **Key Features**:
  - Stack-based indentation tracking (`ind_typ_stk`, `ind_len_stk`)
  - Zero-width token implementation
  - Complex lookahead strategies
  - Nested context management
  - **CRITICAL**: Demonstrates how to prevent token interference
- **Study Focus**: How to keep external tokens from leaking into unrelated constructs

### 4. tree-sitter-bash
- **URL**: https://github.com/tree-sitter/tree-sitter-bash/blob/master/src/scanner.c
- **Complexity Level**: Very High
- **Key Features**:
  - Heredoc state tracking
  - Sophisticated lookahead
  - Complex state management for nested structures
  - Multiple ambiguous constructs starting with same character
- **Study Focus**: Disambiguating similar start patterns

### 5. tree-sitter-haskell
- **URL**: https://github.com/tree-sitter/tree-sitter-haskell
- **Complexity Level**: High
- **Key Features**:
  - Indentation-sensitive parsing
  - Layout rules
- **Study Focus**: Another approach to indentation handling

## Critical GitHub Issues

### Issue #1259: External Scanner Called with All Symbols Valid
- **URL**: https://github.com/tree-sitter/tree-sitter/issues/1259
- **Problem**: During GLR error recovery, external scanner is called with all symbols marked valid
- **Solution**: Add early detection and return false:
  ```c
  // Check if all symbols are valid (error recovery mode)
  bool all_valid = true;
  for (int i = 0; i < NUM_EXTERNAL_TOKENS; i++) {
    if (!valid_symbols[i]) {
      all_valid = false;
      break;
    }
  }
  if (all_valid) {
    return false;  // Bail out during error recovery
  }
  ```
- **Key Insight**: This is normal during error recovery, not a bug in your scanner

### Issue #316: Zero-Width External Tokens
- **URL**: https://github.com/tree-sitter/tree-sitter/issues/316
- **Problem**: External scanners couldn't produce zero-width tokens without calling advance()
- **Status**: Fixed by maintainers
- **Key Insight**: Zero-width tokens are now supported; use `mark_end()` immediately without advancing

## Tree-sitter Source Code

### Key Files to Study
1. **lib/src/lexer.c**: Lexer infrastructure, position tracking
2. **lib/src/parser.c**: How external tokens interact with parse table, GLR handling
3. **lib/src/stack.c**: Parse stack management (relevant for understanding GLR forks)

### What to Look For
- How `valid_symbols` array is populated based on parser state
- When external scanner is called vs. regular lexer
- How zero-width tokens affect parsing
- GLR fork creation with external tokens

## Key Insights from Research

### 1. Error Recovery Behavior
- Tree-sitter may call external scanner with all valid_symbols true during error recovery
- **Action**: Always check for this condition and return false immediately
- This prevents external tokens from being emitted inappropriately

### 2. valid_symbols is State-Based
- The valid_symbols array reflects the **current parser state**, not grammar structure
- During GLR parsing, different branches may have different valid_symbols
- **Action**: Trust valid_symbols - if both conflicting tokens are valid, there's a grammar problem

### 3. Zero-Width Token Pattern
- Call `mark_end()` **immediately** after entering scan function
- All subsequent `advance()` calls are for lookahead only
- Restore any state before returning
- YAML scanner demonstrates this perfectly

### 4. State Isolation
- Each scanner function should be completely independent
- Use simulate mode or save/restore state for lookahead
- Never assume lexer position will be preserved between calls
- **Critical**: Even with simulate mode, returning true "commits" the scan

### 5. Token Interference Prevention (from YAML)
- Strict validation rules for each token type
- Context-specific validation functions
- Careful state management prevents inappropriate token generation
- **Example from YAML**:
  ```c
  // Only emit token if ALL conditions met
  if (context_valid && pattern_matches && no_conflicts) {
    lexer->result_symbol = TOKEN;
    return true;
  }
  return false;
  ```

### 6. Grammar-First Approach
- External scanners cannot fix poor grammar structure
- If two tokens with same start are both valid simultaneously = grammar bug
- **Solution**: Restructure grammar to make tokens mutually exclusive at grammar level
- External scanner is for **disambiguation**, not **conflict resolution**

## Debugging Strategies

### 1. Printf Debugging in Scanner
```c
#ifdef DEBUG_SCANNER
  fprintf(stderr, "parse_pipe_table: valid_symbols[LINE_BLOCK]=%d, valid_symbols[PIPE_TABLE]=%d\n",
          valid_symbols[LINE_BLOCK_START], valid_symbols[PIPE_TABLE_START]);
#endif
```

Compile with `-DDEBUG_SCANNER` to enable logging.

### 2. tree-sitter parse --debug
```bash
tree-sitter parse file.md --debug 2>&1 | grep -A5 "external"
```

Shows when external scanner is called and what symbols are valid.

### 3. Minimal Test Cases
Create minimal files that test ONE construct at a time:
- test-line-block-only.md (single line block)
- test-pipe-table-only.md (single table)
- test-mixed.md (both, sequential)

### 4. Incremental Isolation
1. Test with both tokens disabled → baseline
2. Enable only LINE_BLOCK_START → test line blocks
3. Enable only PIPE_TABLE_START → test pipe tables
4. Enable both → test interaction

### 5. Check Generated Parser
```bash
grep -n "PIPE_TABLE_START\|LINE_BLOCK_START" src/parser.c | head -20
```

See how tokens are used in parse table.

## Books & General Parsing Literature

### Compiler Construction Texts
1. **"Engineering a Compiler" (2nd ed.)** by Cooper & Torczon
   - Chapter on scanning and parsing
   - GLR parsing coverage

2. **"Modern Compiler Implementation in C"** by Andrew Appel
   - LR parsing fundamentals
   - Scanner-parser interaction

3. **"Parsing Techniques: A Practical Guide" (2nd ed.)** by Grune & Jacobs
   - Comprehensive parsing survey
   - GLR and GLL parsing details
   - **Highly recommended** for deep understanding

### Online Courses
- **CS164: Programming Languages and Compilers** (UC Berkeley)
  - Often covers incremental parsing
  - May reference Wagner's work

## Common Patterns & Best Practices

### Pattern 1: Stack-Based Context Tracking (from YAML)
```c
typedef struct {
  Array(IndentType) indent_types;
  Array(uint16_t) indent_lengths;
} Scanner;

// Push new context
array_push(&scanner->indent_types, BLOCK_SEQUENCE);
array_push(&scanner->indent_lengths, current_indent);

// Pop context
array_pop(&scanner->indent_types);
array_pop(&scanner->indent_lengths);
```

### Pattern 2: Lookahead Without State Corruption (from Ruby)
```c
// Save state
bool was_simulate = scanner->simulate;
scanner->simulate = true;

// Do lookahead
while (lookahead_condition) {
  advance(scanner, lexer);
}

// Check result
bool matches = /* condition */;

// Restore state
scanner->simulate = was_simulate;
return matches;
```

### Pattern 3: Early Validation (from all scanners)
```c
// Check valid_symbols FIRST
if (!valid_symbols[MY_TOKEN]) {
  return false;
}

// Check basic pattern
if (lexer->lookahead != expected_char) {
  return false;
}

// Only then do expensive lookahead
// ...
```

### Pattern 4: Mutual Exclusivity Check
```c
// Detect grammar bugs
if (valid_symbols[TOKEN_A] && valid_symbols[TOKEN_B]) {
  // These should never both be valid!
  // Log warning or choose preferred one
  return false; // or handle gracefully
}
```

## Next Steps for Our Implementation

### Immediate Actions
1. Add error recovery check (Issue #1259 pattern)
2. Study YAML scanner's token interference prevention
3. Add comprehensive logging to understand valid_symbols behavior
4. Create minimal test cases for isolated testing

### Medium-term
1. Consider restructuring grammar (grammar-first approach)
2. Implement stack-based state tracking if needed
3. Add strict validation rules per token type
4. Improve serialization/deserialization

### Long-term
1. Contribute findings back to tree-sitter community
2. Write blog post about complex external scanner patterns
3. Consider creating a scanner library for common patterns

## Conclusion

The key insight from all this research: **External scanners are powerful but require perfect coordination with grammar structure**. The grammar must ensure mutual exclusivity of conflicting tokens. The scanner's job is disambiguation within valid contexts, not conflict resolution across invalid states.

Our specific issue (line_block vs pipe_table) requires:
1. Grammar restructuring to prevent both tokens being valid simultaneously
2. Strict validation in each scanner function
3. Proper error recovery handling
4. Possibly: different syntax or additional context requirements

The YAML and Ruby scanners show this is solvable, but requires meticulous attention to state management and grammar design.
