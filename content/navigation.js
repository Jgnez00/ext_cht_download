(() => {
    window.NovelDownloader = window.NovelDownloader || {};
    const { sleep } = window.NovelDownloader.helpers;
    const state = window.NovelDownloader.state;
    
    window.NovelDownloader.navigation = {
        waitTranslation: async () => await sleep(8000),

        autoScroll: () => new Promise(resolve => {
            let totalHeight = 0;
            const distance = 500;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 900);
        }),

        goForNextAndWait: async () => {
            const next = document.querySelector('button[aria-label="Siguiente capítulo"]');
            if (!next) {
                await window.NovelDownloader.flow.stopProcess();
                return false;
            }

            const oldTitle = state.currentChapterTitle;
            next.click();

            let attempts = 0;
            const maxAttempts = 50;

            while (attempts < maxAttempts) {
                await sleep(200);
                const newTitleElement = document.querySelector('.chr-title');
                const newTitle = newTitleElement ? newTitleElement.title : '';

                if (newTitle && newTitle !== oldTitle) {
                    state.currentChapterTitle = newTitle;
                    await sleep(1000);
                    return true;
                }
                attempts++;
            }

            console.error("Timeout esperando el siguiente capítulo");
            return false;
        },

        setupWatcher: () => {
            if (state.observer) {
                state.observer.disconnect();
            }

            state.observer = new MutationObserver(async () => {
                const titleElement = document.querySelector('.chr-title');
                if (!titleElement) return;

                const newTitle = titleElement.title;
                if (newTitle && newTitle !== state.currentChapterTitle) {
                    state.currentChapterTitle = newTitle;
                    const data = await window.NovelDownloader.storage.get(['active']);
                    if (data.active && !state.isProcessing) {
                        await sleep(500);
                        await window.NovelDownloader.flow.executeAuto();
                    }
                }
            });

            state.observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    };
})();
