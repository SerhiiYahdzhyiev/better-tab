import "./lib/better-tab.js";
import {runCases} from "./tests/core.js"

console.log("Hello, Background!");

chrome.tabs.query({}, (tabs) => console.log(tabs));

(async () => {
    console.log(await chrome.tabs.query({}));
    await runCases()
})();
