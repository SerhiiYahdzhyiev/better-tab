export async function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay))
}

export function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

export function assertBetterTab(tab, message = "Expected BetterTab") {
    assert(tab instanceof BetterTab, message);
}

export function callbackValue(run) {
    return new Promise((resolve, reject) => {
        try {
            run(resolve);
        } catch (error) {
            reject(error);
        }
    });
}
