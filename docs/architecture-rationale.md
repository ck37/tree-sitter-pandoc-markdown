# Why Separate Block and Inline Grammars?

**Date:** 2025-10-12
**Question:** What is the rationale for separate block and inline grammars? Could we unify them into a single grammar?

## TL;DR

**No, we should not unify them.** The split architecture follows the CommonMark specification's parsing strategy and is necessary to work within tree-sitter's parsing constraints. A unified grammar would face significant technical challenges and performance issues.

---

## The Split Architecture

Our project has two separate grammars:

1. **Block Grammar** (`tree-sitter-pandoc-markdown/`): Document structure
   - Headings, lists, code blocks, tables, block quotes, etc.
   - Produces nodes like `paragraph`, `heading`, `list_item`

2. **Inline Grammar** (`tree-sitter-pandoc-markdown-inline/`): Inline formatting
   - Emphasis, links, citations, math, strikethrough, etc.
   - Produces nodes like `emphasis`, `link`, `code_span`

### How They Work Together

**Two-Pass Parsing:**
1. First pass: Parse entire document with **block grammar**
2. Identify inline content regions (paragraph content, heading content, etc.)
3. Second pass: Parse those specific ranges with **inline grammar** using `ts_parser_set_included_ranges()`

---

## Rationale: CommonMark Specification

The split architecture mirrors the [CommonMark Spec's parsing strategy](https://spec.commonmark.org/0.31.2/#appendix-a-parsing-strategy):

> "We can divide the parsing process into two phases... In the first phase, we divide the input into a sequence of blocks... In the second phase, we parse the text inside each block for inline structure."

**Why CommonMark uses this approach:**
1. Block structure determines context for inline parsing
2. List indentation affects inline parsing rules
3. Code blocks disable inline parsing entirely
4. Block quotes can contain other blocks, creating nested contexts

**Example showing necessity:**

```markdown
> # Heading in *block* quote
>
> - List item with **emphasis**
>
>   Paragraph in list with `code`
```

The block structure (block quote → heading, list → list item → paragraph) must be determined BEFORE parsing inline content, because:
- The heading `*block*` uses `*` for emphasis, not list marker
- The list `**emphasis**` uses `**` for strong, not two list markers
- Indentation rules differ inside lists vs top-level

---

## Tree-sitter Constraints

Tree-sitter has specific parsing limitations that make unified grammars problematic:

### 1. LR Parsing Constraints

Tree-sitter uses GLR (Generalized LR) parsing, which:
- Requires unambiguous or explicitly-declared ambiguous rules
- Struggles with highly context-dependent syntax
- Can't easily handle "parse this differently based on containing block type"

**Problem with unified grammar:**
```
| This is a pipe table |
| with *emphasis*      |
```

vs

```
This is a paragraph with `|` characters
| but not a table because no second row |
```

A unified grammar would need to decide:
- Is '|' starting a table or inline content?
- Should `*emphasis*` be parsed differently in table vs paragraph?
- How to handle nested contexts like lists containing code blocks containing `*`?

### 2. Performance Issues

**Current split approach:**
- Block grammar: ~500 lines, processes structure only
- Inline grammar: ~300 lines, processes formatting only
- Total parsing: O(n) + O(m) where m = inline content regions

**Unified grammar would:**
- Need all rules available at all times
- Create exponentially more parse states
- Increase conflicts requiring GLR exploration
- Slow down significantly on large documents

### 3. Conflict Explosion

Our current inline grammar has 1 conflict:
```javascript
conflicts: $ => [
  [$._inline_element, $._link_text_element]
]
```

A unified grammar would need conflicts for:
- Every block construct vs inline construct
- Nested block contexts affecting inline parsing
- Code blocks vs inline code spans
- List markers vs emphasis markers
- Pipe tables vs pipe characters in text
- And many more...

---

## Real-World Evidence

### tree-sitter-markdown (upstream)

Uses split architecture with **extensive commentary**:

> "To use the two grammars, first parse the document with the block grammar. Then perform a second parse with the inline grammar using `ts_parser_set_included_ranges` to specify which parts are inline content."

> "Even though this parser has existed for some while and obvious issues are mostly solved, there are still lots of inaccuracies in the output. These stem from restricting a complex format such as markdown to the quite restricting tree-sitter parsing rules."

**Their experience:** Even WITH split grammars, markdown is challenging for tree-sitter. A unified grammar would be even harder.

### tree-sitter-markdown-2 (alternative approach)

GitHub user mattmassicotte created [tree-sitter-markdown-2](https://github.com/mattmassicotte/tree-sitter-markdown-2), which attempts different parsing strategies. **Still uses split architecture.**

### Other Grammars

**Languages with unified grammars:**
- Python: Clear syntax distinction (indentation vs expressions)
- Ruby: Unambiguous delimiters
- TypeScript: Structured syntax with well-defined operator precedence

**Languages that COULD benefit from split but don't need it:**
- They have unambiguous syntax
- Context doesn't dramatically change parsing rules
- No "inline vs block" concept

---

## Current Architecture Benefits

### 1. Separation of Concerns

**Block grammar responsibilities:**
- Document structure
- Nesting and hierarchy
- Block-level attributes

**Inline grammar responsibilities:**
- Text formatting
- Links and images
- Citations and math

Clear separation = easier maintenance.

### 2. Testing Isolation

We have:
- 38 block grammar tests (all passing)
- 29 inline grammar tests (all passing)
- Clean separation of test concerns

A unified grammar would need:
- 67+ combined tests covering all interactions
- Tests for every block type × every inline type combination
- Much harder to debug failures

### 3. Modularity

**Current:** Can update inline formatting without touching block structure.

**Example:** Adding new inline construct like `:emoji:` only requires:
- Update inline grammar
- Add inline tests
- Block grammar unaffected

**Unified:** Every change potentially affects everything.

### 4. Language Injection

Editors using tree-sitter can inject the inline grammar into specific languages:

```markdown
```python
# This is Python, not inline markdown
print("Hello *World*")  # <- no emphasis parsing
\```

- But this list has *emphasis* <- inline grammar applied
```

**Current architecture:** Editor queries block grammar for code_block nodes, excludes them from inline parsing.

**Unified grammar:** Harder to identify safe injection boundaries.

---

## Why Current Block Grammar Has Inline Rules

**Question:** If they're separate, why does `tree-sitter-pandoc-markdown/grammar.js` define inline elements?

**Answer:** For **integration convenience** in editors that don't implement two-pass parsing.

The block grammar includes basic inline rules so it can produce a usable (if not perfect) parse tree in single-pass mode. This:
- Provides fallback for simpler editors
- Enables basic syntax highlighting without two-pass setup
- Maintains compatibility with tools expecting a single grammar

However, for **full correctness**, the two-pass approach with separate inline grammar should be used.

---

## Could We Unify Them?

**Technically possible? Yes.**
**Advisable? No.**

### What It Would Require

1. **Massive conflicts array**
   - Declare every block/inline ambiguity
   - Likely 50+ conflict rules
   - Complex to maintain

2. **Performance degradation**
   - GLR would explore many more paths
   - Parse time could 10x on large documents
   - Memory usage would increase significantly

3. **Loss of modularity**
   - Can't update inline without recompiling everything
   - Tests become intertwined
   - Harder to debug issues

4. **Editor integration complexity**
   - Two-pass still recommended for correctness
   - But now forced to use heavy unified grammar
   - Language injection becomes error-prone

### Theoretical Advantages

The only potential advantage:
- Single grammar file to maintain

But this is vastly outweighed by:
- Increased complexity (unified grammar would be larger than both current grammars combined)
- Performance issues
- Debugging difficulties
- Maintenance nightmares

---

## Alternatives Considered

### Option A: Single Unified Grammar
**Status:** Not recommended for reasons above.

### Option B: Current Split Architecture
**Status:** ✅ Adopted - follows best practices.

### Option C: Three Grammars (Block, Inline, Integrated)
**Status:** Overkill - no additional benefit.

### Option D: Scanner-Heavy Approach
**Status:** Rejected - see scanner-research.md. We want grammar-first approach.

---

## Recommendation

**Keep the split architecture.**

It's not a limitation to work around—it's the correct design for markdown parsing:
1. ✅ Follows CommonMark specification
2. ✅ Works within tree-sitter constraints
3. ✅ Proven approach (tree-sitter-markdown uses it)
4. ✅ Better performance
5. ✅ Easier maintenance
6. ✅ Cleaner testing
7. ✅ Enables language injection

---

## For the Future

If someone wants to attempt a unified grammar:

**Prerequisites:**
1. Deep tree-sitter expertise (conflicts, dynamic precedence, etc.)
2. Willingness to debug complex parse failures
3. Benchmark suite to measure performance impact
4. Time to handle likely 100+ edge cases

**Expected result:**
- Significantly more complex than current approach
- Slower parsing
- More bugs
- No meaningful advantages

**Better investment of time:**
- Improve existing grammars
- Add missing Pandoc features
- Enhance external scanner for tables
- Better editor integration

---

## References

- [CommonMark Parsing Strategy](https://spec.commonmark.org/0.31.2/#appendix-a-parsing-strategy)
- [tree-sitter-markdown Architecture](https://github.com/tree-sitter-grammars/tree-sitter-markdown)
- [Tree-sitter Advanced Parsing](https://tree-sitter.github.io/tree-sitter/using-parsers/3-advanced-parsing.html)
- [Tree-sitter Included Ranges API](https://tree-sitter.github.io/tree-sitter/using-parsers/3-advanced-parsing.html#setting-included-ranges)

---

## Conclusion

The split block/inline architecture is **intentional, well-founded, and should be preserved**. It's not a workaround or legacy design—it's the correct approach for parsing markdown with tree-sitter.

Any attempt to unify would trade minor convenience for major complexity, performance issues, and maintenance headaches.

**Verdict: Do not unify the grammars.**
