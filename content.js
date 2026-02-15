(() => {
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

        button.addEventListener('click', onclick);
        document.body.appendChild(button);
    }


    function downloadChapter () {
        const elements = Array.from(document.querySelectorAll('#chr-content h4, #chr-content p'));
        let title = document.querySelector('.chr-title').title;
        const paragraphs = [];
        elements.forEach(el => {
            const text = el.innerText.trim();
            if (!text) return;
            paragraphs.push(text);
        });
        if (!title) {
            alert('No se encontro titulo');
            return;
        }
        const markdownContent = `## ${title}:\n\n${paragraphs.join('\n\n')}`
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


    createButton(downloadChapter);
})()