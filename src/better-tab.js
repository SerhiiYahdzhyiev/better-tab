Object.assign(globalThis, { bt_version: "0.0.1" });

function BetterTab(chromeTab) {
    Object.assign(this, chromeTab);
    Object.setPrototypeOf(this, BetterTab);

    this.close = this.close.bind(this);
    this.remove = this.close.bind(this);
    this.update = this.update.bind(this);
}

BetterTab.close = async function() {
    await chrome.tabs.remove(this.id)
    // TODO: "Garbage collect" | nullify this, self-destruct
};

// TODO: Make it compatible with the original chrome.tabs.update signature:
//       handle optional callback
BetterTab.update = async function(payload) {
    await chrome.tabs.update(this.id, payload);
    Object.assign(this, payload);
}

Object.assign(globalThis, { BetterTab });
Object.assign(globalThis, { og_query: chrome.tabs.query });

const p = new Proxy(chrome.tabs.query, {
    apply(fn, this_, args) {
        const og_cb = args[1];
        if (og_cb) {
            args[1] = (tabs) => {
                const wrappedTabs = tabs.map((t) => new BetterTab(t));
                return og_cb(wrappedTabs);
            };
        } else {
            return new Promise((res, rej) => {
                fn(...args, (tabs) => {
                    if (chrome.runtime && chrome.runtime.lastError) {
                        rej(chrome.runtime.lastError);
                    } else {
                        res(tabs.map(t => new BetterTab(t)));
                    }
                });
            });
        }
        return fn.apply(this_, args);
    }
});

chrome.tabs.query = p;
