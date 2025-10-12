# Makefile for converting PDFs to markdown using marker-pdf
# This configuration uses marker-config.json to control conversion settings

.PHONY: help convert convert-single clean list

# Default target
help:
	@echo "Makefile for PDF to Markdown conversion using marker-pdf"
	@echo ""
	@echo "Targets:"
	@echo "  convert        - Convert all PDFs in pdfs/ directory to markdown"
	@echo "  convert-single - Convert a single PDF (usage: make convert-single PDF=filename.pdf)"
	@echo "  clean          - Remove generated markdown files"
	@echo "  list           - List all PDF files"
	@echo ""
	@echo "Configuration:"
	@echo "  - Uses marker-config.json for settings"
	@echo "  - force_table: false (avoids MPS backend warnings on Apple Silicon)"
	@echo "  - disable_multiprocessing: true (better compatibility)"
	@echo "  - Output format: markdown"

# Convert all PDFs to markdown
# Uses marker-config.json for configuration
convert:
	@echo "Converting PDFs to markdown..."
	@echo "Note: This may take several minutes on first run while downloading models (~2GB)"
	marker pdfs \
		--config_json marker-config.json
	@echo "Conversion complete. Markdown files are in pdfs/"

# Convert a single PDF
# Usage: make convert-single PDF=wagner-parsing.pdf
convert-single:
	@if [ -z "$(PDF)" ]; then \
		echo "Error: Please specify PDF file. Usage: make convert-single PDF=filename.pdf"; \
		exit 1; \
	fi
	@echo "Converting $(PDF) to markdown..."
	marker pdfs/$(PDF) \
		--config_json marker-config.json
	@echo "Conversion complete. Markdown file is in pdfs/"

# List all available PDF files
list:
	@echo "Available PDF files in pdfs/:"
	@ls -1 pdfs/*.pdf 2>/dev/null || echo "No PDF files found"

# Clean generated markdown files
clean:
	@echo "Removing generated markdown files..."
	@rm -f pdfs/*.md
	@rm -rf pdfs/*_images
	@echo "Cleanup complete"

# Clean everything including downloaded models (use with caution)
clean-all: clean
	@echo "Warning: This will remove downloaded models (~2GB)"
	@echo "Press Ctrl+C to cancel, or wait 5 seconds to continue..."
	@sleep 5
	@rm -rf ~/.cache/marker
	@echo "All marker cache removed"
