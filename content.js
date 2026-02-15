(async () => {
    // ---- Funciones Auxiliares ----
    const sleep = (ms) => new Promise(res => setTimeout(res, ms));
    const waitTranslation = async () => await sleep(4000);
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
        }, 500);
    })


    // ---- Storage helpers (Promises) ----
    const setStorage = (data) => new Promise(res => chrome.storage.local.set(data, res));
    const getStorage = (keys) => new Promise(res => chrome.storage.local.get(keys, res));


    // ---- Funciones Principales ----
    const stopProcess = async () => {
        await setStorage({ active: false,remaining: 0 });
        alert("Process completed");
    }


    const goForNext = async () => {
        const next = document.querySelector('.chr-nav #next_chap');
        if (next) next.click();
        else await stopProcess();
    }


    async function startProcess () {
        const amount = parseInt(prompt("Cantidad de capitulos"));
        if (!amount || amount <= 0) return;
        await setStorage({ active: true,remaining: amount });
        location.reload();
    }


    function createButton (onclick) {
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


    function downloadChapter () {
        const elements = Array.from(document.querySelectorAll('#chr-content h4, #chr-content p'));
        let title = document.querySelector('.chr-title').title;
        if (!title) return;
        const paragraphs = [];
        elements.forEach(el => {
            const text = el.innerText.trim();
            paragraphs.push(text);
        });
        const markdownContent = `# ${title}\n${paragraphs.join('\n\n')}`
        const chapterMatch = title.match(/\d+/);
        const chapterNumber = chapterMatch ? chapterMatch[0].padStart(3, '0') : '000';
        const fileName = `${chapterNumber}-chapter.md`;
        // const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
        // const url = URL.createObjectURL(blob);
        chrome.runtime.sendMessage({
            action: 'download',
            content: markdownContent,
            fileName
        });
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = fileName;
        // a.click();
        // document.body.removeChild(a);
        // URL.revokeObjectURL(url);
    }


    // ---- Flujo automático de capítulos ----
    async function executeAuto () {
        const data = await getStorage(['active', 'remaining']);
        if (!data.active || data.remaining <= 0) return;

        await waitTranslation();
        await autoScroll();
        await sleep(1000);
        downloadChapter();

        const newRemaining = data.remaining - 1;
        if (newRemaining <= 0) {
            await stopProcess();
            return;
        }

        await setStorage({remaining: newRemaining});
        await sleep(4000);
        await goForNext();
    }


    // ---- Inicialización ----
    createButton();
    await executeAuto();
})()