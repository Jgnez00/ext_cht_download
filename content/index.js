(() => {
    window.NovelDownloader = window.NovelDownloader || {};

    const { storage, state, page, ui, navigation } = window.NovelDownloader;

    window.NovelDownloader.flow = {
        stopProcess: async () => {
            if (state.observer) {
                state.observer.disconnect();
                state.observer = null;
            }
            await storage.set({ active: false, remaining: 0 });
            state.isProcessing = false;
            alert("Process completed");
        },

        executeAuto: async () => {
            if (state.isProcessing) {
                console.log("Ya hay un proceso en ejecución, ignorando...");
                return;
            }

            const data = await storage.get(['active', 'remaining']);
            if (!data.active || data.remaining <= 0) return;

            state.isProcessing = true;

            try {
                await navigation.waitTranslation();
                await navigation.autoScroll();
                await window.NovelDownloader.helpers.sleep(1000);
                page.downloadChapter();

                const newRemaining = data.remaining - 1;
                if (newRemaining <= 0) {
                    await window.NovelDownloader.flow.stopProcess();
                    return;
                }

                await storage.set({ remaining: newRemaining });
                await window.NovelDownloader.helpers.sleep(4000);

                const navigated = await navigation.goForNextAndWait();
                if (navigated) {
                    state.isProcessing = false;
                    await window.NovelDownloader.flow.executeAuto();
                } else {
                    await window.NovelDownloader.flow.stopProcess();
                }
            } catch (error) {
                console.error("Error en executeAuto:", error);
                state.isProcessing = false;
            }
        },

        startProcess: async () => {
            const amount = parseInt(prompt("Cantidad de capítulos"));
            if (!amount || amount <= 0) return;

            if (state.observer) {
                state.observer.disconnect();
            }

            state.isProcessing = false;
            page.initializeTitle();

            await storage.set({ active: true, remaining: amount });
            navigation.setupWatcher();
            await window.NovelDownloader.flow.executeAuto();
        }
    };

    // ---- Inicialización ----
    ui.createButton();
    page.initializeTitle();
    navigation.setupWatcher();

    (async () => {
        const data = await storage.get(['active']);
        if (data.active) {
            await window.NovelDownloader.flow.executeAuto();
        }
    })();
})();
