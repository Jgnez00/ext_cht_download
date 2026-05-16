(async () => {
    // ---- Variables de control para SPA ----
    let isProcessing = false;           // Evita ejecuciones múltiples simultáneas
    let currentChapterTitle = '';       // Guarda el título actual para detectar cambios
    let observer = null;                // Referencia al MutationObserver

    // ---- Funciones Auxiliares ----
    const sleep = (ms) => new Promise(res => setTimeout(res, ms));
    const waitTranslation = async () => await sleep(8000);
    const autoScroll = () => new Promise(res => {
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
    })

    // ---- Storage helpers (Promises) ----
    const setStorage = (data) => new Promise(res => chrome.storage.local.set(data, res));
    const getStorage = (keys) => new Promise(res => chrome.storage.local.get(keys, res));

    // ---- Funciones Principales ----
    const stopProcess = async () => {
        // Detener el observer cuando el proceso termina
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        await setStorage({ active: false, remaining: 0 });
        isProcessing = false;
        alert("Process completed");
    }

    // NUEVA: Función mejorada para navegar y esperar el cambio de DOM
    const goForNextAndWait = async () => {
        const next = document.querySelector('.js-chapter-nav[data-chapter-nav="next"]');
        if (!next) {
            await stopProcess();
            return false;
        }

        // Guardar el título actual ANTES de navegar
        const oldTitle = currentChapterTitle;

        // Hacer clic para navegar (la SPA cambia el DOM)
        next.click();

        // Esperar activamente a que el título cambie (nuevo capítulo cargado)
        let attempts = 0;
        const maxAttempts = 50; // 10 segundos máximo (50 * 200ms)

        while (attempts < maxAttempts) {
            await sleep(200);
            const newTitleElement = document.querySelector('.chr-title');
            const newTitle = newTitleElement ? newTitleElement.title : '';

            // Si el título cambió, el nuevo capítulo está cargado
            if (newTitle && newTitle !== oldTitle) {
                // Actualizar el título actual
                currentChapterTitle = newTitle;
                // Esperar adicional para que el DOM se estabilice
                await sleep(1000);
                return true;
            }
            attempts++;
        }

        console.error("Timeout esperando el siguiente capítulo");
        return false;
    }

    // MODIFICADA: Ahora es recursiva y maneja el flujo SPA
    async function executeAuto() {
        // Evitar ejecuciones simultáneas
        if (isProcessing) {
            console.log("Ya hay un proceso en ejecución, ignorando...");
            return;
        }

        const data = await getStorage(['active', 'remaining']);
        if (!data.active || data.remaining <= 0) {
            return;
        }

        isProcessing = true;

        try {
            await waitTranslation();
            await autoScroll();
            await sleep(1000);
            downloadChapter();

            const newRemaining = data.remaining - 1;
            if (newRemaining <= 0) {
                await stopProcess();
                return;
            }

            await setStorage({ remaining: newRemaining });
            await sleep(4000);

            // Navegar al siguiente capítulo y esperar a que cargue
            const navigated = await goForNextAndWait();

            if (navigated) {
                // IMPORTANTE: Liberar el flag ANTES de la llamada recursiva
                isProcessing = false;
                // Continuar con el siguiente capítulo
                await executeAuto();
            } else {
                await stopProcess();
            }
        } catch (error) {
            console.error("Error en executeAuto:", error);
            isProcessing = false;
        }
    }

    // NUEVA: Observador de mutaciones para detectar cambios de capítulo
    function setupChapterWatcher() {
        if (observer) {
            observer.disconnect();
        }

        observer = new MutationObserver(async (mutations) => {
            // Verificar si el título del capítulo ha cambiado
            const titleElement = document.querySelector('.chr-title');
            if (titleElement) {
                const newTitle = titleElement.title;

                // Si el título cambió y el proceso está activo
                if (newTitle && newTitle !== currentChapterTitle) {
                    currentChapterTitle = newTitle;

                    const data = await getStorage(['active']);
                    if (data.active && !isProcessing) {
                        // Pequeña pausa para asegurar que todo el DOM está listo
                        await sleep(500);
                        await executeAuto();
                    }
                }
            }
        });

        // Observar cambios en el cuerpo del documento
        observer.observe(document.body, {
            childList: true,      // Cambios en los hijos directos
            subtree: true,        // Cambios en toda la jerarquía
            characterData: true   // Cambios en el texto
        });
    }

    // MODIFICADA: Ahora también descarga el contenido correctamente
    function downloadChapter() {
        const elements = Array.from(document.querySelectorAll('#chr-content h4, #chr-content p'));
        let titleElement = document.querySelector('.chr-title');

        if (!titleElement) {
            console.error("No se encontró el título del capítulo");
            return;
        }

        let title = titleElement.title;
        if (!title) return;

        const paragraphs = elements.map(el => el.innerText.trim()).filter(Boolean);

        const markdownContent = `# ${title}\n${paragraphs.join('\n\n')}`
        const chapterMatch = title.match(/\d+/);
        const chapterNumber = chapterMatch ? chapterMatch[0].padStart(3, '0') : '000';
        const fileName = `${chapterNumber}-chapter.md`;

        chrome.runtime.sendMessage({
            action: 'download',
            content: markdownContent,
            fileName
        });
    }

    // NUEVA: Inicialización del título actual
    function initializeCurrentTitle() {
        const titleElement = document.querySelector('.chr-title');
        if (titleElement) {
            currentChapterTitle = titleElement.title;
        }
    }

    // MODIFICADA: Creación del botón (sin cambios funcionales)
    function createButton(onclick) {
        if (document.getElementById('descargar-capitulo-btn')) return;

        const button = document.createElement('button');
        button.id = 'descargar-capitulo-btn';
        button.innerText = 'DW';

        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.zIndex = '9999';
        button.style.padding = '10px 15px';
        button.style.background = '#111';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '8px';
        button.style.cursor = 'pointer';

        button.addEventListener('click', startProcess);
        document.body.appendChild(button);
    }

    // MODIFICADA: startProcess con reinicio del observer
    async function startProcess() {
        const amount = parseInt(prompt("Cantidad de capítulos"));
        if (!amount || amount <= 0) return;

        // Detener proceso anterior si existe
        if (observer) {
            observer.disconnect();
        }

        // Reiniciar estado
        isProcessing = false;
        initializeCurrentTitle();

        await setStorage({ active: true, remaining: amount });

        // Configurar el watcher para nuevos capítulos
        setupChapterWatcher();

        // Iniciar con el capítulo actual
        await executeAuto();
    }

    // ---- Inicialización ----
    createButton();
    initializeCurrentTitle();
    setupChapterWatcher();

    // Verificar si hay un proceso activo al cargar la página
    const data = await getStorage(['active']);
    if (data.active) {
        await executeAuto();
    }
})();