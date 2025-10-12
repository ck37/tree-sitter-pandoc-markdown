# Documentation Index

This directory contains comprehensive documentation for the tree-sitter-pandoc-markdown project.

## Architecture & Design

- **[architecture-rationale.md](architecture-rationale.md)** - Why we use separate block and inline grammars (and why they shouldn't be unified)
- **[plan.md](plan.md)** - Implementation roadmap, phases, and current status
- **[improvements.md](improvements.md)** - Complete changelog of all improvements made in this branch vs upstream repository

## External Scanner Research

- **[scanner-research.md](scanner-research.md)** - Comprehensive analysis of external scanner patterns across 6 tree-sitter grammars (Markdown, Python, Ruby, TypeScript, Bash, Org-mode) with experiment results
- **[external-scanner-plan.md](external-scanner-plan.md)** - Original line block implementation attempt and findings
- **[external-scanner-resources.md](external-scanner-resources.md)** - Research resources and references for external scanner implementation
- **[options-for-proceeding.md](options-for-proceeding.md)** - Analysis of approaches to resolve line block/pipe table conflicts

## Academic Papers

- **[papers/](papers/)** - Curated collection of academic papers on incremental parsing, GLR parsing, markdown specifications, and document parsing (5 key papers with citations)

## Quick Navigation

### New to the Project?
Start with [improvements.md](improvements.md) to see what's been accomplished in this branch compared to the upstream repository.

### Understanding the Architecture
Read [architecture-rationale.md](architecture-rationale.md) to understand why the project uses separate grammars.

### Contributing Features
1. Read [plan.md](plan.md) to see what's implemented and what's planned
2. For external scanner features, review [scanner-research.md](scanner-research.md)
3. Check [options-for-proceeding.md](options-for-proceeding.md) for known challenges

### Implementing External Scanner Features
1. Start with [scanner-research.md](scanner-research.md) for patterns and best practices
2. Review [external-scanner-plan.md](external-scanner-plan.md) for previous attempts
3. Consult [external-scanner-resources.md](external-scanner-resources.md) for references

### Academic Research
Read [papers/](papers/) for foundational academic papers on incremental parsing, GLR parsing, and markdown specifications

## Related Files

Project-level documentation in the root directory:
- `README.md` - Main project overview and usage
- `CONTRIBUTING.md` - Contribution guidelines
- `CLAUDE.md` - Instructions for Claude Code AI assistant

## Summary

The documentation is organized by topic:
- **Architecture** - Design decisions and rationale
- **Implementation** - Roadmap and current progress
- **External Scanners** - Deep research and implementation guidance
- **Challenges** - Known issues and solution analysis

Start with the architecture docs to understand the project structure, then move to implementation docs for building features.
