export default async function() {
    console.log(await chrome.tabs.query());
    console.log(await chrome.tabs.create());
}
