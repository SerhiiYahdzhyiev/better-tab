# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.1.0] - 2026-05-08

### Added

- `BetterTab` wrapper class for `chrome.tabs.Tab`
- Instance methods: `close` / `remove`, `update`, `focus`, `mute`, `unmute`,
  `reload`, `discard`, `duplicate`, `detectLanguage`
- `tab.removed` flag — set to `true` after `close()` to prevent double
  operations
- Proxies for `chrome.tabs`: `query`, `create`, `get`, `getCurrent`, `update`,
  `duplicate`, `discard`, `move`
- Both Promise (async/await) and callback API styles supported for `query`,
  `create`, `update`, `duplicate`, `discard`, and `move`; `get` and `getCurrent`
  support Promise only
- Fallback logic in `getCurrent` proxy for deprecated API contexts
- Manifest V3 manual test extension covering Promise and callback flows
- `Makefile` targets for setup, checks, release bundle builds, test-extension
  bundle generation, and cleanup
- Development documentation for local checks, isolated npm usage, and manual
  extension testing
- GitHub Actions workflows for CI and tagged release artifacts
- WTFPL license and package metadata for the first release
