import {assert, assertBetterTab, callbackValue, sleep} from "./utils.js";

export default async function() {
    console.debug("Running test: compatibility...");

    const tab = await chrome.tabs.create({active: false});
    assertBetterTab(tab, "create() should return BetterTab");

    const queried = await callbackValue((done) => chrome.tabs.query((tabs) => done(tabs)));
    assert(Array.isArray(queried), "query(callback) should return an array");
    assertBetterTab(queried[0], "query(callback) should wrap tabs");

    const fetched = await callbackValue((done) => chrome.tabs.get(tab.id, done));
    assertBetterTab(fetched, "get(tabId, callback) should return BetterTab");

    await tab.focus();
    const updatedWithoutId = await chrome.tabs.update({pinned: true});
    assertBetterTab(updatedWithoutId, "update(updateProperties) should return BetterTab");
    assert(updatedWithoutId.pinned, "update(updateProperties) should apply properties");

    const callbackUpdatedWithoutId = await callbackValue((done) =>
        chrome.tabs.update({pinned: false}, done)
    );
    assertBetterTab(
        callbackUpdatedWithoutId,
        "update(updateProperties, callback) should return BetterTab"
    );
    assert(!callbackUpdatedWithoutId.pinned, "callback update should apply properties");

    const current = await callbackValue((done) => chrome.tabs.getCurrent(done));
    if (current) assertBetterTab(current, "getCurrent(callback) should return BetterTab");

    const discardCandidate = await chrome.tabs.create({active: false});
    await sleep(500);

    try {
        const discarded = await chrome.tabs.discard();
        if (discarded) {
            assertBetterTab(discarded, "discard() should return BetterTab when a tab is discarded");
            await discarded.close();
        }
    } catch (error) {
        console.warn("discard() skipped:", error);
    }

    const callbackDiscardCandidate = await chrome.tabs.create({active: false});
    await sleep(500);
    const callbackDiscarded = await callbackValue((done) => chrome.tabs.discard(done));
    if (callbackDiscarded) {
        assertBetterTab(
            callbackDiscarded,
            "discard(callback) should return BetterTab when a tab is discarded"
        );
        await callbackDiscarded.close();
    }

    if (!discardCandidate.removed) await discardCandidate.close();
    if (!callbackDiscardCandidate.removed) await callbackDiscardCandidate.close();
    if (!tab.removed) await tab.close();
}
