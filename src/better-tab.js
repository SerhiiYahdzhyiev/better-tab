Object.assign(globalThis, { bt_version: "0.0.1" });

function BetterTab(chromeTab) {
    Object.assign(this, chromeTab);
    Object.setPrototypeOf(this, BetterTab);

    this.removed = false;
    this.close = this.close.bind(this);
    this.remove = this.close.bind(this);
    this.update = this.update.bind(this);
    this.focus = this.focus.bind(this);
};

BetterTab.close = async function() {
    if (!this.removed) {
        await chrome.tabs.remove(this.id);
        this.removed = true;
    }
    // TODO: "Garbage collect" | nullify this, self-destruct ?
};

BetterTab.update = function(payload, callback) {
    if (!this.removed) {
        if (callback) {
            chrome.tabs.update(
                this.id, payload, (tab) => callback(new BetterTab(tab))
            );
        } else {
            return new Promise(resolve => {
                chrome.tabs.update(this.id, payload, tab => {
                    resolve(new BetterTab(tab))
                });
            });
        }
    }
};

BetterTab.focus = function(callback) {
    if (!this.removed) {
        if (callback) {
            this.update(
                {active:true}, (tab) => callback(new BetterTab(tab))
            );
        } else {
            return new Promise(resolve => {
                this.update({active:true}, tab => {
                    resolve(new BetterTab(tab))
                });
            });
        }
    }
};

Object.assign(globalThis, { BetterTab });
Object.assign(globalThis, { og_query: chrome.tabs.query });

const qp = new Proxy(chrome.tabs.query, {
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

const cp = new Proxy(chrome.tabs.create, {
    apply(fn, _, args) {
        const cb = args[1];
        if (cb) {
            fn(args[0], (tab) => cb(new BetterTab(tab)));
        } else {
            return new Promise((res, rej) => {
                fn(...args, (tab) => {
                    if (chrome.runtime && chrome.runtime.lastError) {
                        rej(chrome.runtime.lastError);
                    } else {
                        res(new BetterTab(tab));
                    }
                });
            });
        }
    }
});

chrome.tabs.query = qp;
chrome.tabs.create = cp;
