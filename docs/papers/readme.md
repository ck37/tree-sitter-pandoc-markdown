# Academic Papers Related to tree-sitter-pandoc-markdown

This directory contains references to academic papers and technical documents relevant to the development of tree-sitter-pandoc-markdown. Papers cover topics including incremental parsing, GLR parsing algorithms, markdown specifications, and document parsing.

## 📖 Quick Start

**[Read key-insights.md](key-insights.md)** for a comprehensive summary of the most relevant insights from all papers, organized by topic and application to this project.

---

## 1. Efficient and Flexible Incremental Parsing (1997)

**Authors:** Tim A. Wagner and Susan L. Graham
**Institution:** University of California, Berkeley
**Year:** 1997

**Abstract:**
Previous LR(k) incremental parsing algorithms have been inefficient, unnecessarily restrictive, or in some cases incorrect. This paper addresses these shortcomings by presenting a correct and efficient algorithm for incremental parsing. The algorithm handles arbitrary LR(k) grammars and provides flexibility in how modifications are presented.

**Relevance to Project:**
- Foundational work on incremental parsing, which tree-sitter implements
- Describes LR parsing challenges that tree-sitter addresses
- Explains error recovery mechanisms in LR parsers

**PDF:** https://harmonia.cs.berkeley.edu/papers/twagner-parsing.pdf

**Key Concepts:**
- LR(k) parsing algorithms
- Incremental parsing techniques
- Parse tree maintenance during edits
- Error recovery in incremental parsers

**Citation:**
```bibtex
@article{wagner1997efficient,
  title={Efficient and flexible incremental parsing},
  author={Wagner, Tim A and Graham, Susan L},
  journal={ACM Transactions on Programming Languages and Systems (TOPLAS)},
  volume={20},
  number={5},
  pages={980--1013},
  year={1997},
  publisher={ACM}
}
```

---

## 2. Document Parsing Unveiled: Techniques, Challenges, and Prospects (2024)

**Authors:** Qintong Zhang, Bin Wang, Victor Shea-Jay Huang, Junyuan Zhang, Zhengren Wang, Hao Liang, Conghui He, Wentao Zhang
**Year:** 2024
**Conference:** ArXiv preprint

**Abstract:**
Document parsing is essential for converting unstructured and semi-structured documents—such as contracts, academic papers, and invoices—into structured, machine-readable data. This survey provides a comprehensive review of document parsing methodologies, covering modular pipeline systems to end-to-end models driven by Large Language Models.

**Relevance to Project:**
- Modern approaches to document structure extraction
- Techniques for handling semi-structured markup (like markdown)
- Evaluation metrics for parser quality
- Discussion of modular vs end-to-end parsing approaches

**ArXiv:** https://arxiv.org/abs/2410.21169
**PDF:** https://arxiv.org/pdf/2410.21169

**Key Topics:**
- Document structure extraction
- Modular parsing pipelines
- OCR and layout analysis
- Table and figure extraction
- Evaluation benchmarks

**Citation:**
```bibtex
@article{zhang2024document,
  title={Document Parsing Unveiled: Techniques, Challenges, and Prospects for Structured Information Extraction},
  author={Zhang, Qintong and Wang, Bin and Huang, Victor Shea-Jay and Zhang, Junyuan and Wang, Zhengren and Liang, Hao and He, Conghui and Zhang, Wentao},
  journal={arXiv preprint arXiv:2410.21169},
  year={2024}
}
```

---

## 3. CommonMark Specification (2024)

**Author:** John MacFarlane
**Version:** 0.31.2 (current as of 2024)
**License:** Creative Commons Attribution-ShareAlike 4.0 International

**Introduction:**
CommonMark is a standard, unambiguous syntax specification for Markdown, along with a suite of comprehensive tests to validate Markdown implementations against this specification. The specification addresses the problem that John Gruber's canonical description of Markdown's syntax does not specify the syntax unambiguously.

**Relevance to Project:**
- Defines the two-phase parsing strategy (block then inline) that this project follows
- Provides formal specification for markdown constructs
- Explains ambiguities in original markdown specification
- Foundation for Pandoc's markdown extensions

**Specification:** https://spec.commonmark.org/
**PDF:** https://spec.commonmark.org/0.31.2/CommonMark.pdf

**Key Concepts:**
- Two-phase parsing (blocks, then inlines)
- Formal grammar for markdown constructs
- Precedence rules for ambiguous patterns
- Reference test suite

**Parsing Algorithm:**
The CommonMark spec describes a two-phase approach:
1. **Phase 1:** Parse block structure (paragraphs, lists, code blocks, etc.)
2. **Phase 2:** Parse inline content within blocks (emphasis, links, etc.)

This approach is mirrored in tree-sitter-pandoc-markdown's architecture with separate block and inline grammars.

**Citation:**
```bibtex
@manual{commonmark2024,
  title={CommonMark Specification},
  author={MacFarlane, John},
  year={2024},
  version={0.31.2},
  url={https://spec.commonmark.org/0.31.2/}
}
```

---

## 4. Pandoc User's Guide (2025)

**Author:** John MacFarlane
**Institution:** University of California, Berkeley
**Year:** 2025 (continuously updated)

**Description:**
Comprehensive documentation of Pandoc, a universal document converter that extends markdown with scholarly features including citations, footnotes, math, tables, and more. Documents the Pandoc markdown dialect that this project aims to parse.

**Relevance to Project:**
- Defines all Pandoc markdown extensions this project implements
- Explains syntax for fenced divs, attributes, citations, etc.
- Provides examples of complex nested constructs
- Documents inline and block-level extension syntax

**PDF:** https://pandoc.org/MANUAL.pdf
**HTML:** https://pandoc.org/MANUAL.html

**Key Pandoc Extensions:**
- Fenced divs (`:::`)
- Attribute syntax (`{.class #id key=val}`)
- Citations (`@key`, `[@key]`)
- Footnotes (inline and reference-style)
- Math (inline `$...$` and display `$$...$$`)
- Pipe tables with alignment
- Definition lists
- Line blocks
- YAML metadata blocks
- Raw inline and blocks

**Citation:**
```bibtex
@manual{pandoc2025,
  title={Pandoc User's Guide},
  author={MacFarlane, John},
  year={2025},
  url={https://pandoc.org/MANUAL.html}
}
```

---

## 5. Faster Generalized LR Parsing (2002)

**Authors:** John Aycock and R. Nigel Horspool
**Institution:** University of Victoria
**Year:** 2002

**Abstract:**
This paper presents optimizations to Generalized LR (GLR) parsing that make it practical for ambiguous grammars. GLR parsers use linear-time LR parsing techniques as long as possible, falling back on more expensive general techniques only when necessary to handle ambiguity or local ambiguity.

**Relevance to Project:**
- Tree-sitter uses GLR-based parsing for ambiguity resolution
- Explains how GLR handles conflicts in grammar rules
- Performance optimizations relevant to parser implementation
- Error recovery in GLR parsers

**Semantic Scholar:** https://www.semanticscholar.org/paper/Faster-Generalized-LR-Parsing-Aycock-Horspool/5cd6257ca11cdb79a06946c987c6a68b086e745b

**Key Concepts:**
- GLR parser optimization techniques
- Handling ambiguous grammars efficiently
- Parse forest construction
- Conflict resolution strategies

**Citation:**
```bibtex
@inproceedings{aycock2002faster,
  title={Faster generalized LR parsing},
  author={Aycock, John and Horspool, R Nigel},
  booktitle={International Conference on Compiler Construction},
  pages={32--46},
  year={2002},
  organization={Springer}
}
```

---

## Additional Relevant Papers

### MDEval: Evaluating Markdown Awareness in LLMs (2025)

**Authors:** Various
**Year:** 2025
**ArXiv:** https://arxiv.org/abs/2501.15000

**Abstract:** Focuses on evaluating large language models' ability to generate well-structured markdown output, highlighting the importance of markdown parsers.

**Relevance:** Demonstrates increasing importance of accurate markdown parsing in modern AI applications.

---

### ReaderLM-v2: HTML to Markdown Conversion (2025)

**Authors:** Various
**Year:** 2025
**ArXiv:** https://arxiv.org/abs/2503.01151

**Abstract:** Small language model for transforming HTML content into structured markdown format, outperforming GPT-4o by 15-20% on benchmarks.

**Relevance:** Shows modern approaches to markup transformation and structured document generation.

---

### Practical Proofs of Parsing for Context-Free Grammars (2024)

**Year:** 2024
**PDF:** https://eprint.iacr.org/2024/562.pdf

**Abstract:** Recent work on formal verification of parsing algorithms for context-free grammars.

**Relevance:** Formal methods for verifying parser correctness, applicable to tree-sitter grammar verification.

---

## Topics Covered

The papers above cover these key areas relevant to tree-sitter-pandoc-markdown:

1. **Incremental Parsing**
   - Wagner & Graham (1997): LR incremental parsing foundations
   - Tree-sitter's core capability

2. **GLR Parsing**
   - Aycock & Horspool (2002): GLR optimizations
   - Handling ambiguous grammars
   - Conflict resolution strategies

3. **Markdown Specifications**
   - CommonMark (2024): Formal markdown specification
   - Pandoc User's Guide (2025): Extended markdown syntax
   - Two-phase parsing architecture

4. **Document Parsing**
   - Zhang et al. (2024): Modern document extraction techniques
   - Structured data extraction from semi-structured documents

5. **Context-Free Grammars**
   - Various: CFG parsing algorithms and optimizations
   - Formal grammar theory

---

## How These Papers Inform This Project

### Architecture Decisions

**Two-Grammar Architecture:**
- CommonMark spec explicitly recommends two-phase parsing (blocks then inlines)
- Rationale documented in `docs/architecture-rationale.md`
- Proven approach used by all major markdown parsers

**Grammar-First Approach:**
- Minimize external scanner usage based on parsing algorithm research
- Keep scanner for disambiguation only (pipe tables)
- Grammar handles all other constructs

**Incremental Parsing:**
- Wagner & Graham's work on LR incremental parsing informs tree-sitter's design
- Parse tree maintenance during edits
- Efficient re-parsing of modified regions

### Implementation Challenges

**GLR Parsing Conflicts:**
- Papers on GLR parsing explain how tree-sitter handles ambiguous constructs
- Conflicts array declarations for explicit ambiguity handling
- Precedence rules to prefer certain interpretations

**Error Recovery:**
- GLR error recovery mechanisms
- Valid parse tree construction even with syntax errors
- Graceful degradation

### Future Work

**External Scanner Features:**
- Line blocks, definition lists require deeper scanner integration
- Research on context-aware tokenization
- State management patterns from Python indent/dedent scanner

---

## How to Access Papers

Most papers are freely available:

1. **ArXiv Papers:** Download PDFs directly from arxiv.org
2. **CommonMark/Pandoc:** Freely available documentation
3. **ACM Digital Library:** May require institutional access or purchase
4. **ResearchGate/Semantic Scholar:** Often have author-uploaded versions

---

## Contributing Additional Papers

If you find additional papers relevant to this project, please add them following this format:

```markdown
## Paper Title (Year)

**Authors:** [authors]
**Institution:** [if applicable]
**Year:** [year]

**Abstract:** [brief summary]

**Relevance to Project:** [why this paper matters]

**Links:** [PDF/ArXiv/DOI links]

**Key Concepts:** [bullet points]

**Citation:** [BibTeX format]
```

---

## References Format

All papers are cited in BibTeX format for easy integration into academic documents. See individual paper sections above for complete citations.

---

---

## PDF Downloads

All papers have been downloaded to `docs/papers/pdfs/`:

- `wagner-parsing.pdf` - Efficient and Flexible Incremental Parsing (140KB)
- `document-parsing-arxiv.pdf` - Document Parsing Unveiled (2.6MB)
- `commonmark-spec.pdf` - CommonMark Specification v0.31.2 (9.2KB)
- `pandoc-manual.pdf` - Pandoc User's Guide (515KB)
- `pandoc-texnicians.pdf` - Pandoc for TeXnicians presentation (519KB)

### Converting PDFs to Markdown

To convert the PDFs to markdown, use the `marker-pdf` tool:

```bash
# Install marker-pdf (requires Python)
pip3 install marker-pdf psutil --user

# Convert all PDFs in the pdfs/ directory
cd docs/papers
marker pdfs --output_format markdown

# Or convert a single PDF
marker pdfs/wagner-parsing.pdf --output_format markdown
```

**Note:** Marker uses ML models for high-quality conversion and may take several minutes on first run while downloading models (~2GB). Subsequent conversions are faster.

Markdown output will be placed in `pdfs/` directory alongside the original PDFs by default.

---

**Last Updated:** 2025-10-12
**Maintained By:** tree-sitter-pandoc-markdown project contributors
