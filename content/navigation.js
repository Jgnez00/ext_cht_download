(() => {
    window.NovelDownloader = window.NovelDownloader || {};
    const { sleep } = window.NovelDownloader.helpers;
    const selectors = window.NovelDownloader.selectors;

    const waitForUrlChange = async (oldUrl) => {
        let attempts = 0;
        while (window.location.pathname === oldUrl && attempts < 100) {
            await sleep(200);
            attempts++;
        }

        return window.location.pathname !== oldUrl;
    }
    
    window.NovelDownloader.navigation = {
        waitForContent: async () => {
            let attempts = 0;
            while (attempts < 50) {
                const { titleChapter, paragraphs } = selectors.getChapterData();
                if (titleChapter && paragraphs.length > 0) {
                    return true;
                }
                await sleep(200);
                attempts++;
            }
            return false;
        },

        autoScroll: () => new Promise(res => {
            let totalHeight = 0;
            const distance = 500;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(timer);
                    res();
                }
            }, 900);
        }),

        goForNextAndWait: async () => {
            const next = document.querySelector('button[aria-label="Siguiente capítulo"]');
            if (!next) {
                console.error("No se encontró el botón siguiente");
                // await window.NovelDownloader.flow.stopProcess();
                return false;
            }

            const oldUrl = window.location.pathname;
            next.click();

            const urlChange = await waitForUrlChange(oldUrl);
            if (!urlChange) {
                console.error("La URL no cambió después de hacer clic en siguiente");
                return false;
            }

            await sleep(1500);
            return true;
        },
    };
})();
