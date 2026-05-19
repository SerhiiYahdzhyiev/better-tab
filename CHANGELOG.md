# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.2.0] - 2026-05-19

### Added

- Instance methods for additional tab-scoped operations: `connect`,
  `sendMessage`, `goBack`, `goForward`, `getZoom`, `setZoom`,
  `getZoomSettings`, `setZoomSettings`, `group`, `ungroup`, and `highlight`
- Wrapped `chrome.tabs.onCreated` and `chrome.tabs.onUpdated` event payloads so
  listeners receive `BetterTab` instances when an event includes a full tab
- Callback support for proxied `chrome.tabs.get` and `chrome.tabs.getCurrent`
- Manual extension tests for overloaded proxy signatures, instance helper
  methods, wrapped tab events, tab constants, and newer tab fields

### Changed

- Refactored tab result wrapping through shared helper functions for more
  consistent Promise and callback behavior across proxied methods
- Preserved original event listener functions for `addListener`,
  `removeListener`, and `hasListener` when wrapping supported tab events
- Expanded documentation for proxied methods, wrapped events, and new
  `BetterTab` instance helpers

### Fixed

- Preserved native overloaded signatures for callback-style `query`, no-tab-id
  `update`, and no-tab-id `discard`
- Avoided internal Chrome URLs in manual tests so tab behaviors are exercised
  against regular web pages

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
