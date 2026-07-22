(() => {
    window.NovelDownloader = window.NovelDownloader || {};

    const { storage, state, page, ui, navigation } = window.NovelDownloader;

    window.NovelDownloader.flow = {
        stopProcess: async () => {
            await storage.set({ active: false, remaining: 0 });
            state.isProcessing = false;
            alert("Process completed");
        },

        executeAuto: async () => {
            if (state.isProcessing) {
                console.log("Ya hay un proceso en ejecución, ignorando...");
                return;
            }

            let data = await storage.get(['active', 'remaining']);
            if (!data.active || data.remaining <= 0) return;

            state.isProcessing = true;

            try {
                while (data.remaining > 0) {
                    const contentReady = await navigation.waitForContent();
                    if (!contentReady) {
                        console.error('No se pudo cargar el contenido del capitulo');
                        break;
                    };

                    await navigation.autoScroll();
                    await window.NovelDownloader.helpers.sleep(1000);

                    const downloaded = page.downloadChapter();
                    if (!downloaded) {
                        console.error('No se pudo descargar el capitulo');
                        break;
                    }
                    
                    const navigated = await navigation.goForNextAndWait();
                    if (!navigated) {
                        console.error('No se pudo navegar al siguiente capitulo');
                        await window.NovelDownloader.flow.stopProcess();
                        break;
                    }
                    
                    const newRemaining = data.remaining - 1;
                    await storage.set({ remaining: newRemaining });
                    if (newRemaining <= 0) {
                        await window.NovelDownloader.flow.stopProcess();
                        return;
                    }

                    data.remaining = newRemaining;
                }
            } catch (error) {
                console.error("Error en executeAuto:", error);
            } finally {
                state.isProcessing = false;
            }
        },

        startProcess: async () => {
            const amount = parseInt(prompt("Cantidad de capítulos"));
            if (!amount || amount <= 0) return;

            state.isProcessing = false;

            await storage.set({ active: true, remaining: amount });
            await window.NovelDownloader.flow.executeAuto();
        }
    };

    // ---- Inicialización ----
    ui.createButton();

    (async () => {
        const data = await storage.get(['active']);
        if (data.active) {
            await window.NovelDownloader.flow.executeAuto();
        }
    })();
})();
