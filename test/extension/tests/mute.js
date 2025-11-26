export default async function() {
    console.debug("Runnnig test: mute... ")
    let tab = await chrome.tabs.create()
    tab = await tab.mute()
    console.debug("Muted", tab)
    tab = await tab.unmute()
    console.debug("Unmuted", tab)
    await tab.close()
}
