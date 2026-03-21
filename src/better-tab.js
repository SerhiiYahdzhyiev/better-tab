Object.assign(globalThis, { bt_version: "0.1.0" });

function BetterTab(chromeTab) {
    Object.assign(this, chromeTab);
    Object.setPrototypeOf(this, BetterTab);

    this.removed = false;
    this.close = this.close.bind(this);
    this.remove = this.close.bind(this);
    this.detectLanguage = this.detectLanguage.bind(this);
    this.discard = this.discard.bind(this);
    this.duplicate = this.duplicate.bind(this);
    this.reload = this.reload.bind(this);
    this.update = this.update.bind(this);
    this.focus = this.focus.bind(this);
    this.mute = this.mute.bind(this);
    this.unmute = this.unmute.bind(this);
}

BetterTab.close = async function () {
    if (!this.removed) {
        await chrome.tabs.remove(this.id);
        this.removed = true;
    }
    // TODO: "Garbage collect" | nullify this, self-destruct ?
};

BetterTab.discard = function () {
    if (this.removed) return;
    return chrome.tabs.discard(this.id);
};

BetterTab.duplicate = function () {
    if (this.removed) return;
    return chrome.tabs.duplicate(this.id);
};

BetterTab.mute = async function (callback) {
    return await this.update({ muted: true }, callback);
};

BetterTab.reload = async function (payload) {
    if (this.removed) return;
    await chrome.tabs.reload(this.id, payload);
    return this;
};

BetterTab.unmute = async function (callback) {
    return await this.update({ muted: false }, callback);
};

BetterTab.update = function (payload, callback) {
    if (!this.removed) {
        if (callback) {
            chrome.tabs.update(this.id, payload, callback);
        } else {
            return chrome.tabs.update(this.id, payload);
        }
    }
};

BetterTab.detectLanguage = async function () {
    if (this.removed) return;
    return await chrome.tabs.detectLanguage(this.id);
};

BetterTab.focus = function (callback) {
    if (!this.removed) {
        return this.update({ active: true }, callback);
    }
};

Object.assign(globalThis, { BetterTab });
Object.assign(globalThis, { og_query: chrome.tabs.query });

const qp = new Proxy(chrome.tabs.query, {
    apply(fn, this_, args) {
        if (!args.length || !args[0]) args[0] = {};
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
                        res(tabs.map((t) => new BetterTab(t)));
                    }
                });
            });
        }
        return fn.apply(this_, args);
    },
});

const cp = new Proxy(chrome.tabs.create, {
    apply(fn, _, args) {
        if (!args.length || !args[0]) args[0] = {};
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
    },
});

const gp = new Proxy(chrome.tabs.get, {
    apply(fn, _, args) {
        return new Promise((res, rej) => {
            fn(...args, (tab) => {
                if (chrome.runtime && chrome.runtime.lastError) {
                    rej(chrome.runtime.lastError);
                } else {
                    res(new BetterTab(tab));
                }
            });
        });
    },
});

const gcp = new Proxy(chrome.tabs.getCurrent, {
    async apply(fn) {
        const tab = await fn();
        if (tab) return new BetterTab(tab);
        try {
            const windows = await chrome.windows.getAll();
            const visible = windows.filter(
                (w) =>
                    (w.focused || w.state !== "minimized") &&
                    w.type === "normal"
            );
            if (visible.length) {
                const candidates = await chrome.tabs.query({
                    windowId: visible[0].id,
                    active: true,
                });
                if (candidates.length) return candidates[0];
            }
        } catch (error) {
            console.error(error);
            return undefined;
        }
    },
});

const up = new Proxy(chrome.tabs.update, {
    apply(fn, _, args) {
        const lastArg = args[args.length - 1];
        const cb = typeof lastArg === "function" ? lastArg : null;
        if (cb) {
            args[args.length - 1] = (tab) => cb(new BetterTab(tab));
            fn.apply(null, args);
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
    },
});

const dp = new Proxy(chrome.tabs.duplicate, {
    apply(fn, _, args) {
        const cb = args[1];
        if (cb) {
            fn(args[0], (tab) => cb(tab ? new BetterTab(tab) : undefined));
        } else {
            return new Promise((res, rej) => {
                fn(...args, (tab) => {
                    if (chrome.runtime && chrome.runtime.lastError) {
                        rej(chrome.runtime.lastError);
                    } else {
                        res(tab ? new BetterTab(tab) : undefined);
                    }
                });
            });
        }
    },
});

const disp = new Proxy(chrome.tabs.discard, {
    apply(fn, _, args) {
        const lastArg = args[args.length - 1];
        const cb = typeof lastArg === "function" ? lastArg : null;
        if (cb) {
            args[args.length - 1] = (tab) =>
                cb(tab ? new BetterTab(tab) : undefined);
            fn.apply(null, args);
        } else {
            return new Promise((res, rej) => {
                fn(...args, (tab) => {
                    if (chrome.runtime && chrome.runtime.lastError) {
                        rej(chrome.runtime.lastError);
                    } else {
                        res(tab ? new BetterTab(tab) : undefined);
                    }
                });
            });
        }
    },
});

const mp = new Proxy(chrome.tabs.move, {
    apply(fn, _, args) {
        const wrapResult = (result) =>
            Array.isArray(result)
                ? result.map((t) => new BetterTab(t))
                : new BetterTab(result);
        const cb = args[2];
        if (cb) {
            fn(args[0], args[1], (result) => cb(wrapResult(result)));
        } else {
            return new Promise((res, rej) => {
                fn(...args, (result) => {
                    if (chrome.runtime && chrome.runtime.lastError) {
                        rej(chrome.runtime.lastError);
                    } else {
                        res(wrapResult(result));
                    }
                });
            });
        }
    },
});

chrome.tabs.create = cp;
chrome.tabs.discard = disp;
chrome.tabs.duplicate = dp;
chrome.tabs.get = gp;
chrome.tabs.getCurrent = gcp;
chrome.tabs.move = mp;
chrome.tabs.query = qp;
chrome.tabs.update = up;

console.debug("Better Tab initalized!");
