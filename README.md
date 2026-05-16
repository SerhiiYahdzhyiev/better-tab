# Better Tab

Make your [chrome.tabs.Tab](https://developer.chrome.com/docs/extensions/reference/api/tabs#type-Tab)
smarter.

## Overview

Better Tab is a small library for Chrome extension developers. It wraps the most
useful `chrome.tabs` methods with Proxies so that any `Tab` object they return
is automatically a `BetterTab` — an enhanced version of the native tab that
can perform operations on itself directly.

## Installation

1. Download `better-tab.min.js` from the [Releases](../../releases) page
   (or build it yourself with `npm run build`) and place it somewhere in your
   extension project.

2. Import it at the top of your background script:

```javascript
import "./path/to/better-tab.js";
```

That's it. The library patches `chrome.tabs` automatically on import - no manual
setup required.

> Manifest V3 is required. See `test/extension/` for a working example. Run
> `make test-extension-dist` before loading the test extension locally.

## How It Works

When loaded, Better Tab replaces several `chrome.tabs` methods with Proxy wrappers.
These wrappers intercept results and wrap any returned `Tab` objects in `BetterTab`,
which extends the native tab with its own instance methods. Your existing code that
calls `chrome.tabs.query()`, etc. keeps working — it just gets smarter tabs back.

Native `chrome.tabs` methods that do not return `Tab` objects remain native.
Better Tab exposes tab-scoped convenience methods for the most useful of those
operations, such as `tab.getZoom()`, `tab.group()`, and `tab.sendMessage()`.

## Proxied Methods

The following `chrome.tabs` methods are replaced. Their signatures are identical to
the originals — the only difference is that returned `Tab` objects are `BetterTab`
instances.

### `chrome.tabs.query(queryInfo?, callback?)`

```javascript
// Promise
const tabs = await chrome.tabs.query({ active: true });

// Callback
chrome.tabs.query({ active: true }, (tabs) => {
    console.log(tabs); // BetterTab[]
});
```

### `chrome.tabs.create(createProperties?, callback?)`

```javascript
// Promise
const tab = await chrome.tabs.create({ url: "https://example.com" });

// Callback
chrome.tabs.create({ url: "https://example.com" }, (tab) => {
    console.log(tab); // BetterTab
});
```

### `chrome.tabs.get(tabId)`

Promise only.

```javascript
const tab = await chrome.tabs.get(tabId); // BetterTab
```

### `chrome.tabs.getCurrent()`

Returns the tab for the current script context. Falls back to querying the
active tab in the first visible window if the native call returns nothing
(e.g. in a service worker context where `getCurrent` may not behave as
expected).

Promise only.

```javascript
const tab = await chrome.tabs.getCurrent(); // BetterTab | undefined
```

### `chrome.tabs.update(tabId?, updateProperties, callback?)`

```javascript
// Promise
const tab = await chrome.tabs.update(tabId, { muted: true });

// Callback
chrome.tabs.update(tabId, { muted: true }, (tab) => {
    console.log(tab); // BetterTab
});
```

### `chrome.tabs.duplicate(tabId, callback?)`

```javascript
// Promise
const copy = await chrome.tabs.duplicate(tabId); // BetterTab | undefined

// Callback
chrome.tabs.duplicate(tabId, (copy) => {
    console.log(copy); // BetterTab | undefined
});
```

### `chrome.tabs.discard(tabId?, callback?)`

```javascript
// Promise
const tab = await chrome.tabs.discard(tabId); // BetterTab | undefined

// Callback
chrome.tabs.discard(tabId, (tab) => {
    console.log(tab); // BetterTab | undefined
});
```

### `chrome.tabs.move(tabIds, moveProperties, callback?)`

`tabIds` can be a single tab ID or an array of IDs. Returns a `BetterTab` or
`BetterTab[]` accordingly.

```javascript
// Promise
const moved = await chrome.tabs.move(tabId, { index: 0 });

// Callback
chrome.tabs.move([tab1.id, tab2.id], { index: -1 }, (tabs) => {
    console.log(tabs); // BetterTab[]
});
```

## Wrapped Events

The following `chrome.tabs` events are patched so full `Tab` payloads are
delivered as `BetterTab` instances. Listener management methods such as
`removeListener` and `hasListener` continue to use your original listener
function.

### `chrome.tabs.onCreated`

```javascript
chrome.tabs.onCreated.addListener((tab) => {
    console.log(tab); // BetterTab
});
```

### `chrome.tabs.onUpdated`

```javascript
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    console.log(tab); // BetterTab
});
```

## BetterTab Instance Methods

All methods are no-ops if `tab.removed` is `true`.

### `tab.close()` / `tab.remove()`

Closes the tab. Sets `tab.removed = true` on success. `remove` is an alias.

```javascript
await tab.close();
```

### `tab.update(updateProperties, callback?)`

Updates the tab. Returns a new `BetterTab` reflecting the updated state.

```javascript
// Promise
const updated = await tab.update({ url: "https://example.com" });

// Callback
tab.update({ url: "https://example.com" }, (updated) => {
    console.log(updated.url);
});
```

### `tab.focus(callback?)`

Makes the tab active. Shorthand for `tab.update({ active: true })`.

```javascript
// Promise
const focused = await tab.focus();

// Callback
tab.focus((focused) => console.log(focused.active)); // true
```

### `tab.mute(callback?)`

Mutes the tab. Shorthand for `tab.update({ muted: true })`.

```javascript
// Promise
await tab.mute();

// Callback
tab.mute((updated) => console.log(updated.mutedInfo));
```

### `tab.unmute(callback?)`

Unmutes the tab. Shorthand for `tab.update({ muted: false })`.

```javascript
await tab.unmute();
```

### `tab.reload(reloadProperties?)`

Reloads the tab. Returns `this` for chaining.

```javascript
await tab.reload();
await tab.reload({ bypassCache: true });
```

### `tab.discard()`

Discards the tab to free memory. Returns a new `BetterTab` (or `undefined`
if discarding failed).

> [!note]
> Chrome assigns the discarded tab a new ID. The returned `BetterTab`
> has the updated ID — the original instance becomes stale and should no longer
> be used.

```javascript
const discarded = await tab.discard();
console.log(discarded.discarded); // true
// Use `discarded` going forward — tab.id is now stale
```

### `tab.duplicate()`

Creates a duplicate of the tab. Returns a new `BetterTab` (or `undefined` if
duplication failed).

```javascript
const copy = await tab.duplicate();
```

### `tab.detectLanguage()`

Detects the primary language of the tab's content.

```javascript
const lang = await tab.detectLanguage();
console.log(lang); // e.g. "en"
```

### `tab.connect(connectInfo?)`

Opens a long-lived port to content scripts in the tab.

```javascript
const port = tab.connect({ name: "panel" });
```

### `tab.sendMessage(message, options?, callback?)`

Sends a message to content scripts in the tab.

```javascript
const response = await tab.sendMessage({ type: "ping" });
```

### `tab.goBack()` / `tab.goForward()`

Navigates the tab through its history.

```javascript
await tab.goBack();
await tab.goForward();
```

### `tab.getZoom()` / `tab.setZoom(zoomFactor)`

Reads or changes the tab's zoom factor.

```javascript
const zoom = await tab.getZoom();
await tab.setZoom(zoom + 0.1);
```

### `tab.getZoomSettings()` / `tab.setZoomSettings(zoomSettings)`

Reads or changes the tab's zoom settings.

```javascript
const settings = await tab.getZoomSettings();
await tab.setZoomSettings({ ...settings, scope: "per-tab" });
```

### `tab.group(options?)` / `tab.ungroup()`

Adds the tab to a group or removes it from its current group.

```javascript
const groupId = await tab.group();
await tab.ungroup();
```

### `tab.highlight()`

Highlights the tab in its current window.

```javascript
const window = await tab.highlight();
console.log(window.id);
```

## Properties

### `tab.removed`

`Boolean`. Set to `true` after `tab.close()` completes. Methods that modify
the tab check this flag and silently no-op if it is set, preventing errors
from operating on a closed tab.

```javascript
await tab.close();
console.log(tab.removed); // true
await tab.reload();        // no-op, safe to call
```
