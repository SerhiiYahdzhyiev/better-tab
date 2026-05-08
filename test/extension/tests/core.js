import basicTest from "./basic.js";
import basicCallbackTest from "./basic-callback.js";
import proxyTest from "./proxy.js";
import muteTest from "./mute.js";


export async function runCases() {
    await basicTest();
    await basicCallbackTest();
    await proxyTest();
    await muteTest();
};
