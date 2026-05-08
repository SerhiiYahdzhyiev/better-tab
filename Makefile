.DEFAULT_GOAL := help

.PHONY: help setup check build test-extension-dist clean-dist clean

help: ## Show available make targets.
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make <target>\n\nTargets:\n"} /^[a-zA-Z_%-]+:.*##/ {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Install npm dependencies. !!! Not recommended to do on-host without any isolation/sandboxing in place !!!
	npm ci --ignore-scripts

check: ## Run lint and formatting checks.
	npm run lint
	npm run format:check

build: ## Build the release bundle at the repository root.
	npm run build

test-extension-dist: ## Build the generated bundle used by test/extension/.
	mkdir -p test/extension/lib
	npx --no-install terser src/better-tab.js -o test/extension/lib/better-tab.min.js --compress --mangle

clean-dist: ## Remove generated bundles.
	rm -f better-tab.min.js test/extension/lib/better-tab.min.js

clean: clean-dist ## Alias for clean-dist.
