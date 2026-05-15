import {assert, assertBetterTab} from "./utils.js";

function waitForEvent(register, trigger, timeout = 5000) {
    return new Promise((resolve, reject) => {
        let timeoutId;

        const cleanup = register((...args) => {
            clearTimeout(timeoutId);
            cleanup();
            resolve(args);
        });

        timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error("Timed out waiting for tab event"));
        }, timeout);

        trigger().catch((error) => {
            clearTimeout(timeoutId);
            cleanup();
            reject(error);
        });
    });
}

export default async function() {
    console.debug("Running test: events...");

    function createdListener() {}
    chrome.tabs.onCreated.addListener(createdListener);
    assert(
        chrome.tabs.onCreated.hasListener(createdListener),
        "onCreated should report wrapped listener"
    );
    chrome.tabs.onCreated.removeListener(createdListener);
    assert(
        !chrome.tabs.onCreated.hasListener(createdListener),
        "onCreated should remove wrapped listener"
    );

    const [createdTab] = await waitForEvent(
        (done) => {
            chrome.tabs.onCreated.addListener(done);
            return () => chrome.tabs.onCreated.removeListener(done);
        },
        () => chrome.tabs.create({active: false, url: "https://example.com"})
    );
    assertBetterTab(createdTab, "onCreated should wrap the created tab");
    await createdTab.close();

    let updatedTarget;
    function updatedListener() {}
    chrome.tabs.onUpdated.addListener(updatedListener);
    assert(
        chrome.tabs.onUpdated.hasListener(updatedListener),
        "onUpdated should report wrapped listener"
    );
    chrome.tabs.onUpdated.removeListener(updatedListener);
    assert(
        !chrome.tabs.onUpdated.hasListener(updatedListener),
        "onUpdated should remove wrapped listener"
    );

    try {
        updatedTarget = await chrome.tabs.create({
            active: false,
            url: "https://example.com",
        });
        const [, , updatedTab] = await waitForEvent(
            (done) => {
                const listener = (tabId, changeInfo, tab) => {
                    if (tabId === updatedTarget.id) done(tabId, changeInfo, tab);
                };
                chrome.tabs.onUpdated.addListener(listener);
                return () => chrome.tabs.onUpdated.removeListener(listener);
            },
            () => updatedTarget.update({url: "https://example.org"})
        );
        assertBetterTab(updatedTab, "onUpdated should wrap the updated tab");
    } finally {
        if (updatedTarget && !updatedTarget.removed) await updatedTarget.close();
    }
}
