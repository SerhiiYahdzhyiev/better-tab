import {sleep} from "./utils.js"

export default async function() {
    let testTabId;
    chrome.tabs.create({active:false}, (tab) => testTabId = tab.id)
    console.log(testTabId)
    const getTargetTab = (tab) => tab.id === testTabId;
    chrome.tabs.query({active:false}, (tabs) => {
        const [tab] = tabs.filter(getTargetTab)
        console.log(testTabId, tab)
        tab.update({active:true}, (tab) => {
            console.log(tab)
            sleep(2000).then(() => tab.close())
        })
    })
}
