#!/usr/bin/make -f

OK_COLOUR=\x1b[32;01m
ERROR_COLOUR=\x1b[31;01m
WARN_COLOUR=\x1b[33;01m
RESET_COLOUR=\x1b[0m
OK_STRING=$(OK_COLOUR)[OK]$(RESET_COLOUR)
ERROR_STRING=$(ERROR_COLOUR)[ERRORS]$(RESET_COLOUR)
WARN_STRING=$(WARN_COLOUR)[WARNINGS]$(RESET_COLOUR)

check:
	@brew list shellcheck &>/dev/null || brew install shellcheck
	@for file in $(shell find ./bin -type f \( ! -iname ".DS_Store" \)); do printf "$(ERROR_COLOUR)"; shellcheck --format=gcc $$file && echo "$(OK_STRING) $$file"; done || true

.PHONY: check
