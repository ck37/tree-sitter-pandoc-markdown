# Key Insights from Academic Papers

This document summarizes the most relevant insights from academic papers that inform the design and implementation of tree-sitter-pandoc-markdown.

---

## Table of Contents

- [Two-Phase Parsing Strategy (CommonMark)](#two-phase-parsing-strategy-commonmark)
- [Incremental Parsing Principles (Wagner & Graham)](#incremental-parsing-principles-wagner--graham)
- [Document Parsing Techniques (Modern Approaches)](#document-parsing-techniques-modern-approaches)
- [GLR Parsing Optimization](#glr-parsing-optimization)
- [Application to This Project](#application-to-this-project)

---

## Two-Phase Parsing Strategy (CommonMark)

**Source:** CommonMark Specification v0.31.2 (Appendix: A parsing strategy)

### Core Concept

The CommonMark specification defines a **two-phase parsing approach** that fundamentally influences this project's architecture.

### Phase 1: Block Structure

**Process:**
- Parse the document line by line
- Identify block-level elements sequentially
- Determine the overall document structure

**Block Elements Include:**
- Paragraphs
- Headings (ATX and Setext)
- Code blocks
- Lists
- Block quotes
- Tables
- Thematic breaks

**Characteristics:**
- **Sequential processing** - Lines must be processed in order
- **Structure first** - Block structure determines parsing context
- **Precedence** - Block-level structure always takes precedence over inline

### Phase 2: Inline Structure

**Process:**
- After block structure is established, parse contents of each block
- Process inline elements within the block context
- Use information collected in Phase 1 (e.g., link reference definitions)

**Inline Elements Include:**
- Links (reference and inline)
- Emphasis (*, _, **, __)
- Code spans
- Images
- HTML tags

**Characteristics:**
- **Parallelizable** - Different blocks can be parsed independently
- **Context-dependent** - Parsing rules depend on containing block type
- **Deferred** - Requires link reference definitions from Phase 1

### Why This Matters for tree-sitter-pandoc-markdown

1. **Separate Grammars Justified**
   - Block grammar handles Phase 1 (document structure)
   - Inline grammar handles Phase 2 (content formatting)
   - This mirrors the specification's parsing strategy

2. **Parse Order Significance**
   - Block structure must be determined before inline parsing
   - Code blocks disable inline parsing entirely
   - List indentation affects inline parsing rules

3. **Example Demonstrating Necessity**

```markdown
> # Heading in *block* quote
>
> - List item with **emphasis**
>
>   Paragraph in list with `code`
```

**Why two phases are required:**
- The `*` in heading must be recognized as emphasis, not list marker
- The `**` in list must be strong emphasis, not two list markers
- Indentation rules differ inside lists vs top-level
- Block structure determines these contexts

---

## Incremental Parsing Principles (Wagner & Graham)

**Source:** "Efficient and Flexible Incremental Parsing" (1997)

### Core Problem

Previous LR(k) incremental parsing algorithms were:
- Inefficient (required full re-parsing)
- Unnecessarily restrictive (limited grammar types)
- Sometimes incorrect (failed on edge cases)

### Key Solutions

1. **Parse Tree Maintenance**
   - Maintain parse tree across edits
   - Only re-parse affected regions
   - Preserve unaffected subtrees

2. **Efficient Change Propagation**
   - Detect minimal region affected by edit
   - Re-parse only necessary portions
   - Update parent nodes efficiently

3. **Error Recovery**
   - Gracefully handle syntax errors
   - Continue parsing after errors
   - Construct valid parse tree even with errors

### Application to tree-sitter

Tree-sitter implements these principles:

**Incremental Re-parsing:**
- Tracks document changes (insertions, deletions, edits)
- Identifies affected parse tree regions
- Re-parses only changed portions
- Maintains parse tree across edits

**Performance Benefits:**
- Real-time parsing in editors
- Minimal latency on edits
- Efficient for large documents

**Relevance to This Project:**
- Pandoc markdown documents can be large (academic papers, books)
- Incremental parsing essential for editor responsiveness
- Error recovery important for partial/in-progress documents

---

## Document Parsing Techniques (Modern Approaches)

**Source:** "Document Parsing Unveiled: Techniques, Challenges, and Prospects" (2024)

### Modular Pipeline Systems

**Architecture:**
1. **Layout Detection** - Identify document structure visually
2. **Content Extraction** - Extract text, tables, figures
3. **Structured Output** - Generate machine-readable format

**Relevance to Markdown Parsing:**
- Markdown is already semi-structured (markup-based)
- Parser converts markup → structured AST
- Similar to extracting structure from visual layout

### Key Insights

1. **Multi-Modal Integration**
   - Documents contain text, images, tables, math
   - Parser must handle multiple content types
   - Pandoc markdown supports all of these

2. **Complex Layout Handling**
   - Nested structures (lists in quotes in lists)
   - Tables with complex formatting
   - Math equations with special syntax

3. **High-Density Text Challenges**
   - Code blocks with special characters
   - Inline code with backticks
   - Escaped characters and entities

### Application to This Project

**Content Type Handling:**
- **Text blocks** → Paragraphs with inline formatting
- **Tables** → Pipe tables, simple tables, grid tables
- **Math** → Inline `$...$` and display `$$...$$`
- **Code** → Fenced blocks with language/options
- **Images** → Inline and reference-style

**Structured Output:**
- Tree-sitter produces AST (Abstract Syntax Tree)
- AST is machine-readable, queryable structure
- Enables syntax highlighting, code folding, language injection

---

## GLR Parsing Optimization

**Source:** "Faster Generalized LR Parsing" (Aycock & Horspool, 2002)

### Core Concept

GLR (Generalized LR) parsers handle **ambiguous grammars** by:
- Using LR parsing when grammar is deterministic
- Forking parse stack when ambiguity detected
- Exploring multiple parse paths simultaneously

### Optimization Strategies

1. **Minimize Forking**
   - Use LR parsing as long as possible
   - Only fork on actual ambiguity
   - Merge compatible paths

2. **Efficient Parse Forest**
   - Represent multiple parse trees compactly
   - Share common subtrees
   - Reduce memory overhead

3. **Conflict Resolution**
   - Use precedence rules
   - Apply associativity
   - Declare explicit conflicts

### Tree-sitter's GLR Implementation

Tree-sitter uses GLR-based algorithm for:

**Ambiguity Handling:**
- Local ambiguity (limited lookahead)
- Multiple valid interpretations
- Conflict resolution via precedence

**Error Recovery:**
- When parse fails, fork to try alternatives
- Insert error nodes in parse tree
- Continue parsing after errors

**Example in This Project:**

```javascript
conflicts: $ => [
  [$._inline_element, $._link_text_element],
  // Declares: inline elements and link text can be ambiguous
]
```

### Practical Impact

1. **Grammar Design**
   - Minimize conflicts for performance
   - Use `prec()`, `prec.left()`, `prec.right()` for disambiguation
   - Only use `conflicts` array when necessary

2. **External Scanner**
   - Reduces ambiguity by providing context
   - Helps parser choose correct path
   - Minimal scanner = fewer GLR forks

3. **Performance**
   - Fewer conflicts = faster parsing
   - Grammar-first approach reduces GLR overhead
   - Clean separation improves efficiency

---

## Application to This Project

### Architecture Decisions Informed by Research

1. **Two-Grammar Architecture** (CommonMark Strategy)
   ```
   Block Grammar (Phase 1) → Inline Grammar (Phase 2)
   ```
   - Mirrors CommonMark's two-phase parsing
   - Block structure determines inline context
   - Proven approach, follows specification

2. **Incremental Parsing** (Wagner & Graham)
   - Tree-sitter provides incremental re-parsing
   - Essential for editor performance
   - Handles large Pandoc documents efficiently

3. **Grammar-First Approach** (GLR Optimization)
   - Minimize external scanner usage
   - Reduce GLR conflicts
   - Better performance, easier maintenance

4. **Conflict Management** (GLR Best Practices)
   - Use precedence rules before conflicts array
   - Minimal conflicts declaration
   - Clear disambiguation strategy

### Parsing Challenges Addressed

1. **Ambiguous Constructs**

   **Problem:** `|` can start line block OR pipe table

   **Solution from Research:**
   - External scanner for disambiguation (GLR paper)
   - Context-aware tokenization
   - Status: Deferred line blocks to Phase 2

2. **Nested Structures**

   **Problem:** Lists in block quotes in lists

   **Solution from Research:**
   - Two-phase parsing handles nesting naturally
   - Block structure first, then inline
   - Grammar rules handle recursion

3. **Complex Inline Formatting**

   **Problem:** Emphasis, links, math, citations can overlap

   **Solution from Research:**
   - Separate inline grammar (Phase 2)
   - Precedence rules for disambiguation
   - Conflicts array for genuine ambiguity

### Performance Optimizations

Based on research findings:

1. **Parser Size Reduction**
   - Block: 78k lines (39% reduction vs upstream)
   - Inline: 82k lines (41% reduction vs upstream)
   - Achieved by grammar-first approach

2. **Efficient Incremental Parsing**
   - Tree-sitter's Wagner & Graham principles
   - Real-time editor performance
   - Minimal re-parsing on edits

3. **Reduced GLR Overhead**
   - Minimal conflicts array (only 1 declared)
   - Grammar handles most disambiguation
   - Scanner only for pipe tables

---

## Future Work Informed by Research

### External Scanner Enhancement (Phase 2)

**Research Basis:** GLR optimization, context-aware parsing

**Planned Features:**
1. **Line Blocks**
   - Scanner distinguishes `|` context (line block vs pipe table)
   - Context-aware tokenization
   - Requires scanner state management

2. **Definition Lists**
   - Scanner validates `:` in definition context
   - Disambiguates from paragraph colons
   - Needs lookahead capability

3. **Simple/Grid Tables**
   - Scanner recognizes table patterns
   - Complex border syntax handling
   - Multi-line structure tracking

### Advanced Parsing Techniques

**Research Basis:** Document parsing survey (2024)

**Potential Enhancements:**
1. **Better Math Handling**
   - LaTeX syntax within `$...$`
   - Nested braces and commands
   - Language injection for math

2. **Enhanced Table Parsing**
   - Complex cell alignment
   - Multi-line cells
   - Nested formatting in cells

3. **Improved Error Recovery**
   - Better partial document handling
   - Graceful degradation
   - Useful errors for users

---

## Key Takeaways

### What the Research Tells Us

1. **Two-Phase Parsing is Correct**
   - CommonMark specification explicitly recommends it
   - Block structure must precede inline parsing
   - Proven approach, should not be unified

2. **Incremental Parsing is Essential**
   - Real-time editor performance requires it
   - Tree-sitter implements proven algorithms
   - Critical for large Pandoc documents

3. **GLR Requires Careful Management**
   - Minimize conflicts for performance
   - Use precedence rules first
   - External scanner for true ambiguity

4. **Grammar-First Approach Works**
   - Reduces parser complexity
   - Better performance than scanner-heavy
   - Easier to maintain and debug

### How This Informs Our Implementation

✅ **Validated Decisions:**
- Two-grammar architecture (CommonMark)
- Minimal external scanner (GLR optimization)
- Grammar-first approach (performance)
- Incremental parsing support (editor integration)

✅ **Future Direction:**
- External scanner for Phase 2 features
- Context-aware tokenization for ambiguous constructs
- Enhanced error recovery
- Continued grammar-first philosophy

✅ **Performance Goals:**
- Maintain minimal conflicts
- Optimize for incremental re-parsing
- Keep parser size small
- Fast test execution

---

## References

1. **CommonMark Specification v0.31.2**
   - URL: https://spec.commonmark.org/0.31.2/
   - Section: Appendix A - Parsing Strategy
   - Key Insight: Two-phase parsing (blocks then inlines)

2. **Efficient and Flexible Incremental Parsing** (Wagner & Graham, 1997)
   - PDF: https://harmonia.cs.berkeley.edu/papers/twagner-parsing.pdf
   - Key Insight: Parse tree maintenance across edits

3. **Document Parsing Unveiled** (Zhang et al., 2024)
   - ArXiv: https://arxiv.org/abs/2410.21169
   - Key Insight: Modular parsing pipelines, multi-modal content

4. **Faster Generalized LR Parsing** (Aycock & Horspool, 2002)
   - Key Insight: GLR optimization, conflict minimization

5. **Pandoc User's Guide** (MacFarlane, 2025)
   - URL: https://pandoc.org/MANUAL.html
   - Key Insight: Pandoc markdown extension syntax

---

## Related Project Documentation

- **[architecture.md](../architecture.md)** - Complete architecture overview
- **[architecture-rationale.md](../architecture-rationale.md)** - Why separate grammars
- **[scanner-research.md](../scanner-research.md)** - External scanner patterns
- **[plan.md](../plan.md)** - Implementation roadmap
- **[readme.md](readme.md)** - Complete paper references and citations

---

**Document Purpose:** Distill academic research into actionable insights for tree-sitter-pandoc-markdown development.

**Last Updated:** 2025-10-12
**Based On:** 5 academic papers and technical documents
