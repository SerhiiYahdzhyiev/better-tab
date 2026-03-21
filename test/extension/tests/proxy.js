import {sleep} from "./utils.js";

export default async function() {
    console.debug("Running test: proxy...");

    // INFO: query
    const queryTabs = await chrome.tabs.query();
    console.debug("query ->", queryTabs);

    // INFO: create / update / duplicate / discard / move
    const tab = await chrome.tabs.create({ active: false });
    console.debug("create ->", tab);

    const updated = await chrome.tabs.update(tab.id, { active: false });
    console.debug("update ->", updated);

    const duped = await chrome.tabs.duplicate(tab.id);
    console.debug("duplicate ->", duped);

    await sleep(500);
    const discarded = await chrome.tabs.discard(tab.id);
    console.debug("discard ->", discarded);

    // INFO: Chrome assigns a new tab ID after discarding, so use
    //       discarded.id from here on
    const moved = await chrome.tabs.move(discarded.id, { index: 0 });
    console.debug("move ->", moved);

    // INFO: get / getCurrent
    const fetched = await chrome.tabs.get(discarded.id);
    console.debug("get ->", fetched);

    const current = await chrome.tabs.getCurrent();
    console.debug("getCurrent ->", current);

    // INFO: clean up
    await discarded.close();
    if (duped) await duped.close();
}
