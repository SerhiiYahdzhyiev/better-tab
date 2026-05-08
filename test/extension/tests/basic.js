import {sleep} from "./utils.js";

export default async function() {
    console.debug("Running test: basic...")
    const targetTab = await chrome.tabs.create({active:false});
    const getTargetTab = (tab) => tab.id === targetTab.id;
    const [testTab] = await chrome.tabs.query({active:false})
        .then(tabs => tabs.filter(getTargetTab));
    await testTab.focus();
    let updatedTab = await chrome.tabs.get(targetTab.id)
    console.log(updatedTab);
    await testTab.update({url:'https://google.com'});
    await sleep(2000);
    updatedTab = await chrome.tabs.get(updatedTab.id)
    await sleep(2000);
    console.log((await updatedTab.detectLanguage()));
    updatedTab = await updatedTab.discard();
    await sleep(1000);
    console.log(updatedTab.discarded);
    await updatedTab.close();
};
