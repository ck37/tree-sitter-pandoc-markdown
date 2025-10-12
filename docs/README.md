# Documentation Index

This directory contains comprehensive documentation for the tree-sitter-pandoc-markdown project.

## Architecture & Design

- **[ARCHITECTURE_RATIONALE.md](ARCHITECTURE_RATIONALE.md)** - Why we use separate block and inline grammars (and why they shouldn't be unified)
- **[plan.md](plan.md)** - Implementation roadmap, phases, and current status

## External Scanner Research

- **[SCANNER_RESEARCH.md](SCANNER_RESEARCH.md)** - Comprehensive analysis of external scanner patterns across 6 tree-sitter grammars (Markdown, Python, Ruby, TypeScript, Bash, Org-mode) with experiment results
- **[EXTERNAL_SCANNER_PLAN.md](EXTERNAL_SCANNER_PLAN.md)** - Original line block implementation attempt and findings
- **[EXTERNAL_SCANNER_RESOURCES.md](EXTERNAL_SCANNER_RESOURCES.md)** - Research resources and references for external scanner implementation
- **[OPTIONS_FOR_PROCEEDING.md](OPTIONS_FOR_PROCEEDING.md)** - Analysis of approaches to resolve line block/pipe table conflicts

## Quick Navigation

### Understanding the Architecture
Start with [ARCHITECTURE_RATIONALE.md](ARCHITECTURE_RATIONALE.md) to understand why the project uses separate grammars.

### Contributing Features
1. Read [plan.md](plan.md) to see what's implemented and what's planned
2. For external scanner features, review [SCANNER_RESEARCH.md](SCANNER_RESEARCH.md)
3. Check [OPTIONS_FOR_PROCEEDING.md](OPTIONS_FOR_PROCEEDING.md) for known challenges

### Implementing External Scanner Features
1. Start with [SCANNER_RESEARCH.md](SCANNER_RESEARCH.md) for patterns and best practices
2. Review [EXTERNAL_SCANNER_PLAN.md](EXTERNAL_SCANNER_PLAN.md) for previous attempts
3. Consult [EXTERNAL_SCANNER_RESOURCES.md](EXTERNAL_SCANNER_RESOURCES.md) for references

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
