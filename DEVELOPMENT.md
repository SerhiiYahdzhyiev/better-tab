# Development

## Prerequisites

- [Node.js](https://nodejs.org) 24.12.0 or newer (with npm). The repository includes `.nvmrc`.
- [GNU Make](https://gnu.org/software/make)

## Isolation

> [!warning]
> Prefer running npm commands in an isolated environment, such
> as a Docker or Podman container, instead of directly on the host.
> This limits the filesystem and user-account access available to dependency
> install scripts and other package lifecycle hooks.

## Common Tasks

Install dependencies with:

```sh
make setup
```

Run the local checks used by CI:

```sh
make check
```

Build the release bundle at the repository root:

```sh
make build
```

Build the generated bundle used by the manual Chrome extension test fixture:

```sh
make test-extension-dist
```

The test extension imports `test/extension/lib/better-tab.min.js`, but that file
is generated from `src/better-tab.js` and intentionally ignored by git. Rebuild it
with `make test-extension-dist` before loading `test/extension/` as an unpacked
extension in Chrome.

Remove generated bundles:

```sh
make clean-dist
```

## Manual Test Extension

The `test/extension/` directory is a Manifest V3 Chrome extension used as a
manual smoke-test fixture. It imports a generated copy of Better Tab from
`test/extension/lib/better-tab.min.js`, loads the test modules from
`test/extension/tests/`, and runs them from the background service worker.

Before loading the extension, build the generated test bundle:

```sh
make test-extension-dist
```

Then load the test extension in Chrome:

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Choose "Load unpacked".
4. Select the repository's `test/extension/` directory.
5. Open the extension service worker console from the extension details page.

The tests run when the background service worker starts. Reload the extension
from `chrome://extensions` to run them again. After changing `src/better-tab.js`,
run `make test-extension-dist` before reloading the extension so the fixture uses
the latest source.

These tests currently log their progress and results to the service worker
console. They are smoke tests rather than assertion-based automated tests, so
success means the flow completes without extension errors, uncaught promise
rejections, or obviously incorrect logged tab objects.

Current test modules:

- `core.js` imports and runs the test cases in sequence.
- `basic.js` exercises the Promise-style API: creates a tab, finds it through
  `chrome.tabs.query`, calls BetterTab instance methods such as `focus`,
  `update`, `detectLanguage`, `discard`, and `close`, and verifies the discarded
  tab object is usable for cleanup.
- `basic-callback.js` exercises callback-style use for `chrome.tabs.create`,
  `chrome.tabs.query`, `tab.focus`, `tab.update`, and `tab.close`.
- `proxy.js` exercises the proxied `chrome.tabs` methods directly:
  `query`, `create`, `update`, `duplicate`, `discard`, `move`, `get`, and
  `getCurrent`. It checks that returned tab objects can continue through the
  BetterTab workflow, including the changed tab ID after discard.
- `mute.js` exercises the `tab.mute()` and `tab.unmute()` instance helpers and
  then closes the test tab.
- `compatibility.js` exercises overloaded native signatures that Better Tab
  proxies must preserve, including callback-style `query`, `get`, `getCurrent`,
  no-tab-id `update`, and no-tab-id `discard`.
