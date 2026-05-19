export default async function() {
    console.debug("Running test: mute... ")
    let tab = await chrome.tabs.create({url: "https://example.com"})
    tab = await tab.mute()
    console.debug("Muted", tab)
    tab = await tab.unmute()
    console.debug("Unmuted", tab)
    await tab.close()
}
