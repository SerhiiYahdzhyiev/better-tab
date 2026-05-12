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
- `tab.update(updateProperties, callback?)`
- `tab.focus(callback?)`
- `tab.mute(callback?)`
- `tab.unmute(callback?)`
- `tab.reload(reloadProperties?)`
- `tab.discard()`
- `tab.duplicate()`
- `tab.detectLanguage()`

## API Gaps

### Missing Method Proxies

These `chrome.tabs` methods are not currently proxied by the library:

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

- `detectLanguage`, `reload`, and `remove` exist as `BetterTab` instance helpers,
  but native `chrome.tabs.*` calls are not proxied.
- Most methods above do not return `tabs.Tab` objects, so proxying them is mainly
  about consistent Promise/callback behavior and preserving the patched API
  surface rather than wrapping returned tabs.
- `captureVisibleTab` is window-scoped, not tab-instance-scoped, so it may not
  need a `BetterTab` instance helper.
- `highlight` returns a `windows.Window`, not a `tabs.Tab`; wrapping the return
  value is probably out of scope unless the project expands into window helpers.

### Missing BetterTab Instance Helpers

Consider adding tab-scoped helpers for:

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

### Missing Event Coverage

Events are not currently wrapped.

Events that pass a `tabs.Tab` and should wrap it as `BetterTab`:

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

## Known Compatibility Risks

### Optional Argument Handling

Some proxied methods need stricter argument normalization to match native
Chrome behavior.

- `chrome.tabs.update({ ... })` may be forwarded incorrectly as `tabId` instead
  of `updateProperties`.
- `chrome.tabs.discard()` may be forwarded incorrectly when no `tabId` is
  provided and Promise mode is used.
- `chrome.tabs.get` is currently Promise-only in Better Tab, while the native
  API also supports callback style.
- `chrome.tabs.getCurrent` is currently Promise-only in Better Tab, while the
  native API also supports callback style.

Add regression tests for:

- `await chrome.tabs.update({ active: true })`
- `chrome.tabs.update({ active: true }, callback)`
- `await chrome.tabs.discard()`
- `chrome.tabs.discard(callback)`
- `chrome.tabs.get(tabId, callback)`
- `chrome.tabs.getCurrent(callback)`

### Undefined Tab Results

Some methods can resolve to `undefined`. Proxies should avoid calling
`new BetterTab(undefined)`.

Review and harden:

- `chrome.tabs.update`
- `chrome.tabs.getCurrent`
- Any new proxy that wraps optional tab results

## Suggested Implementation Order

1. Add shared helpers for wrapping tab results and normalizing callbacks.
2. Fix optional argument handling for existing proxies.
3. Add tests for existing proxy compatibility issues.
4. Add `BetterTab` instance helpers for messaging, navigation, zoom, grouping,
   and highlighting.
5. Add event wrapping for `onCreated` and `onUpdated`.
6. Add tests for constants and newer tab fields/query filters.
7. Decide whether to proxy non-Tab-returning native methods for complete API
   parity or keep them as instance-only helpers.

## Test Plan

Extend the manual extension tests under `test/extension/tests/`:

- Add assertion-style helpers instead of relying only on console inspection.
- Add one test module for optional argument compatibility.
- Add one test module for instance helpers.
- Add one test module for events.
- Add one test module for constants and newer tab fields.

Keep `DEVELOPMENT.md` updated with any new test module descriptions.
