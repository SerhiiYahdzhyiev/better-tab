import "./lib/better-tab.js";

console.log("Hello, Background!");

chrome.tabs.query({}, (tabs) => console.log(tabs));
