(() => {
    window.NovelDownloader = window.NovelDownloader || {};
 
    window.NovelDownloader.ui = {
        createButton: () => {
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
 
            button.addEventListener('click', window.NovelDownloader.flow.startProcess);
            document.body.appendChild(button);
        }
    };
})();
