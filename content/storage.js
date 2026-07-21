(() => {
    window.NovelDownloader = window.NovelDownloader || {};

    window.NovelDownloader.storage = {
        set: (data) => new Promise(resolve => chrome.storage.local.set(data, resolve)),
        get: (keys) => new Promise(resolve => chrome.storage.local.get(keys, resolve))
    };
})();
