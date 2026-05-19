Object.assign(globalThis, { bt_version: "0.2.0" });

function BetterTab(chromeTab) {
  Object.assign(this, chromeTab);
  Object.setPrototypeOf(this, BetterTab);

  this.removed = false;
  this.close = this.close.bind(this);
  this.remove = this.close.bind(this);
  this.connect = this.connect.bind(this);
  this.detectLanguage = this.detectLanguage.bind(this);
  this.discard = this.discard.bind(this);
  this.duplicate = this.duplicate.bind(this);
  this.getZoom = this.getZoom.bind(this);
  this.getZoomSettings = this.getZoomSettings.bind(this);
  this.goBack = this.goBack.bind(this);
  this.goForward = this.goForward.bind(this);
  this.group = this.group.bind(this);
  this.highlight = this.highlight.bind(this);
  this.reload = this.reload.bind(this);
  this.sendMessage = this.sendMessage.bind(this);
  this.setZoom = this.setZoom.bind(this);
  this.setZoomSettings = this.setZoomSettings.bind(this);
  this.ungroup = this.ungroup.bind(this);
  this.update = this.update.bind(this);
  this.focus = this.focus.bind(this);
  this.mute = this.mute.bind(this);
  this.unmute = this.unmute.bind(this);
}

BetterTab.prototype = BetterTab;

BetterTab.close = async function () {
  if (!this.removed) {
    await chrome.tabs.remove(this.id);
    this.removed = true;
  }
};

BetterTab.discard = function () {
  if (this.removed) return;
  return chrome.tabs.discard(this.id);
};

BetterTab.duplicate = function () {
  if (this.removed) return;
  return chrome.tabs.duplicate(this.id);
};

BetterTab.connect = function (connectInfo) {
  if (this.removed) return;
  return chrome.tabs.connect(this.id, connectInfo);
};

BetterTab.mute = async function (callback) {
  return await this.update({ muted: true }, callback);
};

BetterTab.getZoom = function (callback) {
  if (this.removed) return;
  if (callback) return chrome.tabs.getZoom(this.id, callback);
  return chrome.tabs.getZoom(this.id);
};

BetterTab.getZoomSettings = function (callback) {
  if (this.removed) return;
  if (callback) return chrome.tabs.getZoomSettings(this.id, callback);
  return chrome.tabs.getZoomSettings(this.id);
};

BetterTab.goBack = function (callback) {
  if (this.removed) return;
  if (callback) return chrome.tabs.goBack(this.id, callback);
  return chrome.tabs.goBack(this.id);
};

BetterTab.goForward = function (callback) {
  if (this.removed) return;
  if (callback) return chrome.tabs.goForward(this.id, callback);
  return chrome.tabs.goForward(this.id);
};

BetterTab.group = function (options = {}, callback) {
  if (this.removed) return;
  const groupOptions = { ...options, tabIds: this.id };
  if (callback) return chrome.tabs.group(groupOptions, callback);
  return chrome.tabs.group(groupOptions);
};

BetterTab.highlight = function (callback) {
  if (this.removed) return;
  const highlightInfo = { windowId: this.windowId, tabs: this.index };
  if (callback) return chrome.tabs.highlight(highlightInfo, callback);
  return chrome.tabs.highlight(highlightInfo);
};

BetterTab.reload = async function (payload) {
  if (this.removed) return;
  await chrome.tabs.reload(this.id, payload);
  return this;
};

BetterTab.sendMessage = function (message, options, callback) {
  if (this.removed) return;
  if (isFunction(options)) {
    return chrome.tabs.sendMessage(this.id, message, options);
  }
  if (callback) {
    return chrome.tabs.sendMessage(this.id, message, options, callback);
  }
  return chrome.tabs.sendMessage(this.id, message, options);
};

BetterTab.setZoom = function (zoomFactor, callback) {
  if (this.removed) return;
  if (callback) return chrome.tabs.setZoom(this.id, zoomFactor, callback);
  return chrome.tabs.setZoom(this.id, zoomFactor);
};

BetterTab.setZoomSettings = function (zoomSettings, callback) {
  if (this.removed) return;
  if (callback) {
    return chrome.tabs.setZoomSettings(this.id, zoomSettings, callback);
  }
  return chrome.tabs.setZoomSettings(this.id, zoomSettings);
};

BetterTab.ungroup = function (callback) {
  if (this.removed) return;
  if (callback) return chrome.tabs.ungroup(this.id, callback);
  return chrome.tabs.ungroup(this.id);
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

function isFunction(value) {
  return typeof value === "function";
}

function lastCallback(args) {
  const lastArg = args[args.length - 1];
  return isFunction(lastArg) ? lastArg : null;
}

function chromeLastError() {
  return chrome.runtime && chrome.runtime.lastError;
}

function wrapTab(tab) {
  return tab ? new BetterTab(tab) : tab;
}

function wrapTabs(tabs) {
  return tabs.map(wrapTab);
}

function wrapTabResult(result) {
  return Array.isArray(result) ? result.map(wrapTab) : wrapTab(result);
}

function callWithWrappedCallback(fn, args, callback, wrapResult) {
  const callArgs = args.slice();
  callArgs.push((result) => callback(wrapResult(result)));
  fn(...callArgs);
}

function callWithWrappedPromise(fn, args, wrapResult) {
  return new Promise((res, rej) => {
    fn(...args, (result) => {
      const error = chromeLastError();
      if (error) {
        rej(error);
      } else {
        res(wrapResult(result));
      }
    });
  });
}

function normalizeQueryArgs(args) {
  const callback = lastCallback(args);
  const queryInfo =
    isFunction(args[0]) || !args.length || !args[0] ? {} : args[0];
  return { callback, args: [queryInfo] };
}

function normalizeCreateArgs(args) {
  const callback = lastCallback(args);
  const createProperties =
    isFunction(args[0]) || !args.length || !args[0] ? {} : args[0];
  return { callback, args: [createProperties] };
}

function normalizeUpdateArgs(args) {
  const callback = lastCallback(args);
  const values = callback ? args.slice(0, -1) : args.slice();
  return { callback, args: values };
}

function normalizeOptionalTabIdArgs(args) {
  const callback = lastCallback(args);
  const values = callback ? args.slice(0, -1) : args.slice();
  return { callback, args: values };
}

function wrapEventListener(
  listenerMap,
  listener,
  wrapListener,
  create = true
) {
  if (!isFunction(listener)) return listener;
  if (create && !listenerMap.has(listener)) {
    listenerMap.set(listener, wrapListener(listener));
  }
  return listenerMap.get(listener) || listener;
}

function wrapTabEvent(event, wrapListener) {
  const listenerMap = new WeakMap();

  return new Proxy(event, {
    get(target, prop) {
      if (prop === "addListener") {
        return (listener, ...args) =>
          target.addListener(
            wrapEventListener(listenerMap, listener, wrapListener),
            ...args
          );
      }
      if (prop === "removeListener") {
        return (listener) =>
          target.removeListener(
            wrapEventListener(listenerMap, listener, wrapListener, false)
          );
      }
      if (prop === "hasListener") {
        return (listener) =>
          target.hasListener(
            wrapEventListener(listenerMap, listener, wrapListener, false)
          );
      }
      const value = target[prop];
      return isFunction(value) ? value.bind(target) : value;
    },
  });
}

const qp = new Proxy(chrome.tabs.query, {
  apply(fn, this_, args) {
    const normalized = normalizeQueryArgs(args);
    if (normalized.callback) {
      normalized.args.push((tabs) => normalized.callback(wrapTabs(tabs)));
      return fn.apply(this_, normalized.args);
    }
    return callWithWrappedPromise(fn, normalized.args, wrapTabs);
  },
});

const cp = new Proxy(chrome.tabs.create, {
  apply(fn, _, args) {
    const normalized = normalizeCreateArgs(args);
    if (normalized.callback) {
      return callWithWrappedCallback(
        fn,
        normalized.args,
        normalized.callback,
        wrapTab
      );
    }
    return callWithWrappedPromise(fn, normalized.args, wrapTab);
  },
});

const gp = new Proxy(chrome.tabs.get, {
  apply(fn, _, args) {
    const callback = lastCallback(args);
    const callArgs = callback ? args.slice(0, -1) : args;
    if (callback) {
      return callWithWrappedCallback(fn, callArgs, callback, wrapTab);
    }
    return callWithWrappedPromise(fn, callArgs, wrapTab);
  },
});

const gcp = new Proxy(chrome.tabs.getCurrent, {
  async apply(fn, _, args) {
    const callback = lastCallback(args);
    const getCurrentTab = async () => {
      const tab = await fn();
      if (tab) return wrapTab(tab);
      try {
        const windows = await chrome.windows.getAll();
        const visible = windows.filter(
          (w) => (w.focused || w.state !== "minimized") && w.type === "normal"
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
    };
    if (callback) {
      getCurrentTab().then(callback);
      return;
    }
    return getCurrentTab();
  },
});

const up = new Proxy(chrome.tabs.update, {
  apply(fn, _, args) {
    const normalized = normalizeUpdateArgs(args);
    if (normalized.callback) {
      return callWithWrappedCallback(
        fn,
        normalized.args,
        normalized.callback,
        wrapTab
      );
    }
    return callWithWrappedPromise(fn, normalized.args, wrapTab);
  },
});

const dp = new Proxy(chrome.tabs.duplicate, {
  apply(fn, _, args) {
    const callback = lastCallback(args);
    const callArgs = callback ? args.slice(0, -1) : args;
    if (callback) {
      return callWithWrappedCallback(fn, callArgs, callback, wrapTab);
    }
    return callWithWrappedPromise(fn, callArgs, wrapTab);
  },
});

const disp = new Proxy(chrome.tabs.discard, {
  apply(fn, _, args) {
    const normalized = normalizeOptionalTabIdArgs(args);
    if (normalized.callback) {
      return callWithWrappedCallback(
        fn,
        normalized.args,
        normalized.callback,
        wrapTab
      );
    }
    return callWithWrappedPromise(fn, normalized.args, wrapTab);
  },
});

const mp = new Proxy(chrome.tabs.move, {
  apply(fn, _, args) {
    const callback = lastCallback(args);
    const callArgs = callback ? args.slice(0, -1) : args;
    if (callback) {
      return callWithWrappedCallback(fn, callArgs, callback, wrapTabResult);
    }
    return callWithWrappedPromise(fn, callArgs, wrapTabResult);
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
chrome.tabs.onCreated = wrapTabEvent(
  chrome.tabs.onCreated,
  (listener) =>
    function (tab, ...args) {
      return listener(wrapTab(tab), ...args);
    }
);
chrome.tabs.onUpdated = wrapTabEvent(
  chrome.tabs.onUpdated,
  (listener) =>
    function (tabId, changeInfo, tab, ...args) {
      return listener(tabId, changeInfo, wrapTab(tab), ...args);
    }
);

console.debug("Better Tab initialized!");
