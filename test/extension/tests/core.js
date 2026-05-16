import basicTest from "./basic.js";
import basicCallbackTest from "./basic-callback.js";
import proxyTest from "./proxy.js";
import muteTest from "./mute.js";
import compatibilityTest from "./compatibility.js";
import instanceHelpersTest from "./instance-helpers.js";
import eventsTest from "./events.js";
import constantsFieldsTest from "./constants-fields.js";


export async function runCases() {
    await basicTest();
    await basicCallbackTest();
    await proxyTest();
    await muteTest();
    await compatibilityTest();
    await instanceHelpersTest();
    await eventsTest();
    await constantsFieldsTest();
};
