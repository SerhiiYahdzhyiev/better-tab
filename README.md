# Better Tab

Make your [chrome.tabs.Tab](https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=ru#type-Tab)
smarter.

So that it can do some neat stuff on its own.

## Add it to your extension

TODO: Write this sections

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
