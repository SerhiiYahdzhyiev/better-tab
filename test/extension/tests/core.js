import basicTest from "./basic.js";
import basicCallbackTest from "./basic-callback.js";
import proxyTest from "./proxy.js";
import muteTest from "./mute.js";
import compatibilityTest from "./compatibility.js";


export async function runCases() {
    await basicTest();
    await basicCallbackTest();
    await proxyTest();
    await muteTest();
    await compatibilityTest();
};
