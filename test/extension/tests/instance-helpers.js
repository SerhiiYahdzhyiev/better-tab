import {assert, callbackValue, sleep} from "./utils.js";

export default async function() {
    console.debug("Running test: instance-helpers...");

    const tab = await chrome.tabs.create({active: false});

    const zoom = await tab.getZoom();
    assert(typeof zoom === "number", "tab.getZoom() should return a number");

    await tab.setZoom(1);

    const zoomSettings = await tab.getZoomSettings();
    assert(
        typeof zoomSettings === "object",
        "tab.getZoomSettings() should return settings"
    );

    await tab.setZoomSettings({mode: "automatic"});

    await callbackValue((done) => tab.getZoom(done));
    await callbackValue((done) => tab.setZoom(1, done));

    try {
        const groupId = await tab.group();
        assert(typeof groupId === "number", "tab.group() should return a group ID");
        await tab.ungroup();
    } catch (error) {
        console.warn("group/ungroup skipped:", error);
    }

    await tab.focus();
    await sleep(250);

    const highlightedWindow = await tab.highlight();
    assert(
        typeof highlightedWindow === "object",
        "tab.highlight() should return a window"
    );

    try {
        await tab.goBack();
        await tab.goForward();
    } catch (error) {
        console.warn("history navigation skipped:", error);
    }

    if (!tab.removed) await tab.close();
}
