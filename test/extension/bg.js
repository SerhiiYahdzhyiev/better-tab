import "./lib/better-tab.min.js";
import {runCases} from "./tests/core.js"

console.debug("Hello, Background!");

(async () => {
    await runCases()
})();
