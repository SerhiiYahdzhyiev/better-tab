import {assert, assertBetterTab, sleep} from "./utils.js";

const TAB_CONSTANTS = [
    "MAX_CAPTURE_VISIBLE_TAB_CALLS_PER_SECOND",
    "SPLIT_VIEW_ID_NONE",
    "TAB_ID_NONE",
    "TAB_INDEX_NONE",
];

function assertOptionalBoolean(tab, field) {
    if (field in tab) {
        assert(typeof tab[field] === "boolean", `${field} should be boolean`);
    } else {
        console.warn(`${field} is not exposed by this Chrome version`);
    }
}

function assertOptionalNumber(tab, field) {
    if (field in tab) {
        assert(typeof tab[field] === "number", `${field} should be number`);
    } else {
        console.warn(`${field} is not exposed by this Chrome version`);
    }
}

function includesTab(tabs, tabId) {
    return tabs.some((tab) => tab.id === tabId);
}

async function closeIfOpen(tab) {
    if (!tab || tab.removed) return;
    try {
        await tab.close();
    } catch (error) {
        console.warn("cleanup skipped:", error);
    }
}

export default async function() {
    console.debug("Running test: constants-fields...");

    for (const constant of TAB_CONSTANTS) {
        if (constant in chrome.tabs) {
            assert(
                typeof chrome.tabs[constant] === "number",
                `${constant} should remain accessible`
            );
        } else {
            console.warn(`${constant} is not exposed by this Chrome version`);
        }
    }

    let tab;
    let openerTab;

    try {
        tab = await chrome.tabs.create({
            active: false,
            url: "https://example.com",
        });
        await sleep(500);
        assertBetterTab(tab, "field test tab should be BetterTab");

        assertOptionalBoolean(tab, "autoDiscardable");
        assertOptionalBoolean(tab, "discarded");
        assertOptionalBoolean(tab, "frozen");
        assertOptionalBoolean(tab, "highlighted");
        assertOptionalBoolean(tab, "pinned");
        assertOptionalNumber(tab, "groupId");
        assertOptionalNumber(tab, "lastAccessed");
        assertOptionalNumber(tab, "splitViewId");

        const pinned = await tab.update({pinned: true});
        assert(pinned.pinned, "pinned update should be reflected");
        const pinnedTabs = await chrome.tabs.query({pinned: true});
        assert(includesTab(pinnedTabs, pinned.id), "pinned query should find tab");

        if ("autoDiscardable" in pinned) {
            const autoDiscardable = await pinned.update({autoDiscardable: false});
            assert(
                !autoDiscardable.autoDiscardable,
                "autoDiscardable update should be reflected"
            );
            const autoDiscardableTabs = await chrome.tabs.query({
                autoDiscardable: false,
            });
            assert(
                includesTab(autoDiscardableTabs, autoDiscardable.id),
                "autoDiscardable query should find tab"
            );
        }

        const highlighted = await tab.update({highlighted: true});
        assert(highlighted.highlighted, "highlighted update should be reflected");
        const highlightedTabs = await chrome.tabs.query({highlighted: true});
        assert(
            includesTab(highlightedTabs, highlighted.id),
            "highlighted query should find tab"
        );

        const groupId = await tab.group();
        const groupedTabs = await chrome.tabs.query({groupId});
        assert(includesTab(groupedTabs, tab.id), "groupId query should find tab");
        await tab.ungroup();

        openerTab = await chrome.tabs.create({
            active: false,
            openerTabId: tab.id,
            url: "https://example.com",
        });
        if ("openerTabId" in openerTab) {
            assert(
                openerTab.openerTabId === tab.id,
                "openerTabId should be reflected"
            );
            const openerTabs = await chrome.tabs.query({openerTabId: tab.id});
            assert(
                includesTab(openerTabs, openerTab.id),
                "openerTabId query should find tab"
            );
        }

        if ("splitViewId" in tab) {
            const splitViewTabs = await chrome.tabs.query({
                splitViewId: tab.splitViewId,
            });
            assert(
                includesTab(splitViewTabs, tab.id),
                "splitViewId query should find tab"
            );
        }

        if ("frozen" in tab) {
            const frozenTabs = await chrome.tabs.query({frozen: tab.frozen});
            assert(
                includesTab(frozenTabs, tab.id),
                "frozen query should find tab"
            );
        }
    } finally {
        await closeIfOpen(openerTab);
        await closeIfOpen(tab);
    }
}
