import {sleep} from "./utils.js"

export default async function() {
    const {id: testTabId} = await chrome.tabs.create({active:false})
    const getTargetTab = (tab) => tab.id === testTabId;
    const [testTab] = await chrome.tabs.query({active:false})
        .then(tabs => tabs.filter(getTargetTab) )
    await testTab.focus()
    const [updatedTab] = await chrome.tabs.query({})
        .then(tabs => tabs.filter(getTargetTab))
    console.log(updatedTab)
    await sleep(2000)
    await updatedTab.close()
    await updatedTab.close()
}
