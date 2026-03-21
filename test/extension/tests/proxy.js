import {sleep} from "./utils.js";

export default async function() {
    console.debug("Running test: proxy...");

    // query
    const queryTabs = await chrome.tabs.query();
    console.debug("query ->", queryTabs);

    // create / update / duplicate / discard / move
    const tab = await chrome.tabs.create({ active: false });
    console.debug("create ->", tab);

    const updated = await chrome.tabs.update(tab.id, { active: false });
    console.debug("update ->", updated);

    const duped = await chrome.tabs.duplicate(tab.id);
    console.debug("duplicate ->", duped);

    await sleep(500);
    const discarded = await chrome.tabs.discard(tab.id);
    console.debug("discard ->", discarded);

    const moved = await chrome.tabs.move(tab.id, { index: 0 });
    console.debug("move ->", moved);

    // get / getCurrent
    const fetched = await chrome.tabs.get(tab.id);
    console.debug("get ->", fetched);

    const current = await chrome.tabs.getCurrent();
    console.debug("getCurrent ->", current);

    // clean up
    await tab.close();
    if (duped) await duped.close();
}
