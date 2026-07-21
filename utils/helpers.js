(() => {
    window.NovelDownloader = window.NovelDownloader || {};

    window.NovelDownloader.helpers = {
        sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
    };
})();
