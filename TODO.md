# Better Tab TODO

This document tracks gaps between Better Tab and the current `chrome.tabs` API
surface. The comparison point is the Chrome Extensions `chrome.tabs` reference
last updated on 2026-03-03.

Reference: https://developer.chrome.com/docs/extensions/reference/api/tabs

## Current Coverage

Better Tab currently wraps `chrome.tabs` methods that return `tabs.Tab` objects:

- `chrome.tabs.query`
- `chrome.tabs.create`
- `chrome.tabs.get`
- `chrome.tabs.getCurrent`
- `chrome.tabs.update`
- `chrome.tabs.duplicate`
- `chrome.tabs.discard`
- `chrome.tabs.move`

Current `BetterTab` instance helpers:

- `tab.close()` / `tab.remove()`
- `tab.connect(connectInfo?)`
- `tab.update(updateProperties, callback?)`
- `tab.focus(callback?)`
- `tab.mute(callback?)`
- `tab.unmute(callback?)`
- `tab.reload(reloadProperties?)`
- `tab.discard()`
- `tab.duplicate()`
- `tab.detectLanguage()`
- `tab.sendMessage(message, options?, callback?)`
- `tab.goBack(callback?)`
- `tab.goForward(callback?)`
- `tab.getZoom(callback?)`
- `tab.setZoom(zoomFactor, callback?)`
- `tab.getZoomSettings(callback?)`
- `tab.setZoomSettings(zoomSettings, callback?)`
- `tab.group(options?, callback?)`
- `tab.ungroup(callback?)`
- `tab.highlight(callback?)`

Wrapped `chrome.tabs` events:

- `chrome.tabs.onCreated`
- `chrome.tabs.onUpdated`

## API Gaps

### Native Method Proxy Scope

Decision: native `chrome.tabs` methods that do not return `tabs.Tab` objects
remain unproxied. Better Tab's proxy layer focuses on wrapping returned
`tabs.Tab` objects and full-tab event payloads. Tab-scoped convenience for these
operations is provided through `BetterTab` instance helpers instead.

Native methods intentionally left unproxied:

- `chrome.tabs.captureVisibleTab`
- `chrome.tabs.connect`
- `chrome.tabs.detectLanguage`
- `chrome.tabs.getZoom`
- `chrome.tabs.getZoomSettings`
- `chrome.tabs.goBack`
- `chrome.tabs.goForward`
- `chrome.tabs.group`
- `chrome.tabs.highlight`
- `chrome.tabs.reload`
- `chrome.tabs.remove`
- `chrome.tabs.sendMessage`
- `chrome.tabs.setZoom`
- `chrome.tabs.setZoomSettings`
- `chrome.tabs.ungroup`

Notes:

- `detectLanguage`, `reload`, and `remove` exist as `BetterTab` instance helpers.
- Most methods above do not return `tabs.Tab` objects, so proxying them would not
  add BetterTab wrapping behavior.
- `captureVisibleTab` is window-scoped, not tab-instance-scoped, so it may not
  need a `BetterTab` instance helper.
- `highlight` returns a `windows.Window`, not a `tabs.Tab`; wrapping the return
  value is probably out of scope unless the project expands into window helpers.

### BetterTab Instance Helpers

Done:

- `tab.connect(connectInfo?)`
- `tab.sendMessage(message, options?)`
- `tab.goBack()`
- `tab.goForward()`
- `tab.getZoom()`
- `tab.setZoom(zoomFactor)`
- `tab.getZoomSettings()`
- `tab.setZoomSettings(zoomSettings)`
- `tab.group(options?)`
- `tab.ungroup()`
- `tab.highlight()`

Potential helper behavior:

- All helpers should no-op or return `undefined` if `tab.removed` is true,
  matching the existing style.
- `tab.group(options?)` can call `chrome.tabs.group({ ...options, tabIds: this.id })`.
- `tab.ungroup()` can call `chrome.tabs.ungroup(this.id)`.
- `tab.highlight()` should use `this.index` and `this.windowId`, because
  `chrome.tabs.highlight` takes tab indexes, not tab IDs.

### Event Coverage

Done:

- `chrome.tabs.onCreated`
- `chrome.tabs.onUpdated`

Events that do not pass a full tab object but may still be useful to document
or test for compatibility:

- `chrome.tabs.onActivated`
- `chrome.tabs.onAttached`
- `chrome.tabs.onDetached`
- `chrome.tabs.onHighlighted`
- `chrome.tabs.onMoved`
- `chrome.tabs.onRemoved`
- `chrome.tabs.onReplaced`
- `chrome.tabs.onZoomChange`

Implementation note:

- Event wrapping should preserve the native event API shape:
  `addListener`, `removeListener`, `hasListener`, and `hasListeners`.
- If listener functions are wrapped, keep a listener mapping so
  `removeListener(originalListener)` still works.

### Constants And Static Properties

No explicit work is currently done for `chrome.tabs` constants:

- `chrome.tabs.MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND`
- `chrome.tabs.SPLIT_VIEW_ID_NONE`
- `chrome.tabs.TAB_ID_NONE`
- `chrome.tabs.TAB_INDEX_NONE`

These are probably already preserved because the library replaces individual
methods rather than replacing the whole `chrome.tabs` object. Add tests to
confirm they remain accessible after Better Tab initializes.

### Newer Tab Fields And Query Filters

The constructor copies all native tab fields with `Object.assign`, so newer
fields are passively preserved, but they are not tested and have no convenience
helpers.

Fields/query filters to cover in tests:

- `autoDiscardable`
- `discarded`
- `frozen`
- `groupId`
- `highlighted`
- `lastAccessed`
- `openerTabId`
- `pinned`
- `splitViewId`

Update-property coverage to test:

- `active`
- `autoDiscardable`
- `highlighted`
- `muted`
- `openerTabId`
- `pinned`
- `selected` deprecated, but still part of the API
- `url`

## Addressed Compatibility Risks

### Optional Argument Handling

Done: proxied methods now normalize overloaded signatures before forwarding to
Chrome.

Covered signatures:

- `await chrome.tabs.update({ ... })`
- `chrome.tabs.update({ ... }, callback)`
- `await chrome.tabs.discard()`
- `chrome.tabs.discard(callback)`
- `chrome.tabs.get(tabId, callback)`
- `chrome.tabs.getCurrent(callback)`

### Undefined Tab Results

Done: tab wrapping now preserves `undefined` instead of calling
`new BetterTab(undefined)`.

- `chrome.tabs.update`
- `chrome.tabs.getCurrent`
- Optional tab results from `duplicate`, `discard`, and future tab wrappers

## Suggested Implementation Order

1. Done: Add shared helpers for wrapping tab results and normalizing callbacks.
2. Done: Fix optional argument handling for existing proxies.
3. Done: Add tests for existing proxy compatibility issues.
4. Done: Add `BetterTab` instance helpers for messaging, navigation, zoom, grouping,
   and highlighting.
5. Done: Add event wrapping for `onCreated` and `onUpdated`.
6. Done: Add tests for constants and newer tab fields/query filters.
7. Done: Decide whether to proxy non-Tab-returning native methods for complete API
   parity or keep them as instance-only helpers.

## Test Plan

Extend the manual extension tests under `test/extension/tests/`:

- Add assertion-style helpers instead of relying only on console inspection.
- Add one test module for optional argument compatibility.
- Add one test module for instance helpers.
- Done: Add one test module for events.
- Done: Add one test module for constants and newer tab fields.

Keep `DEVELOPMENT.md` updated with any new test module descriptions.
