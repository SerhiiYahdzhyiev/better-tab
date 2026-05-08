# Development

## Prerequisites

- [Node.js](https://nodejs.org) 24.12.0 or newer (with npm). The repository includes `.nvmrc`.
- [GNU Make](https://gnu.org/software/make)

## Isolation

> [!important] Prefer running npm commands in an isolated environment, such
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
