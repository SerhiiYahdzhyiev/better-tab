# Better Tab

Make your [chrome.tabs.Tab](https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=ru#type-Tab)
smarter.

So that it can do some neat stuff on its own.

## Overview

It's a pretty simple Proxy for `chrome.tabs.query` that wraps each
[chrome.tabs.Tab](https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=ru#type-Tab)
with a `BetterTab` "class". If you're an extension developer you could've
probably write it yourself, but with this project you can save time.

### Somehow important considerations

The author of this project is lazy, so that means:
- No out-of-the-box minification, uglifying or similar stuff
- No convenient scripts for development/testing setup
- No typescript integration
- Supporting docs are as minimal as possible

If you want to improve/add anything from above (if you really need it)
open an issue or a PR, and maybe I'll look into it.

## Add it to your extension

Currently this repo only has an example for manifest version 3 in
`test/extension`. In a nutshell it is super simple:

- place the `better-tab.js` file from `src` somewhere in your project
- attach it to your background script via `import "<path_to>/better-tab.js"`

## Now Your Tab Can

1. Close itself:

   ```javascript
   const [tab1, tab2] = await chrome.tabs.query({});

   await tab1.close();
   await tab2.remove(); // Basically the same as close (just an alias)
   ```

   TODO: Provide callback example...

2. Update itself:

   ```javascript
   const [tab1, tab2] = await chrome.tabs.query({});

   await tabs.update({active: true});

   ```

   TODO: Provide callback example...
