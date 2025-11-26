export default async function() {
    console.debug("Runnnig test: proxy...")
    console.debug(await chrome.tabs.query());
    console.debug(await chrome.tabs.create());
}
