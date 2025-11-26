import "./lib/better-tab.js";
import {runCases} from "./tests/core.js"

console.debug("Hello, Background!");

(async () => {
    await runCases()
})();
