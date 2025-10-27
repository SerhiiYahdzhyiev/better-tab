import basicTest from "./basic.js"
import basicCallbackTest from "./basic-callback.js"

export async function runCases() {
    await basicTest();
    await basicCallbackTest();
}
