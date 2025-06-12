import "./lib/better-tab.js";

console.log("Hello, Background!");

chrome.tabs.query({}, (tabs) => console.log(tabs));

(async () => {
    console.log(await chrome.tabs.query({}));
})();
