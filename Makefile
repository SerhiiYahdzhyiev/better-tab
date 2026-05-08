.PHONY: setup check build test-extension-dist clean-dist

setup:
	npm ci

check:
	npm run lint
	npm run format:check

build:
	npm run build

test-extension-dist:
	mkdir -p test/extension/lib
	npx --no-install terser src/better-tab.js -o test/extension/lib/better-tab.min.js --compress --mangle

clean-dist:
	rm -f better-tab.min.js test/extension/lib/better-tab.min.js

clean: clean-dist
