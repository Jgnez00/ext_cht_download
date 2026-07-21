(() => {
    window.NovelDownloader = window.NovelDownloader || {};

    window.NovelDownloader.selectors = {
        getTitleNovel: () => {
            const url = new URL(window.location.href);
            const parts = url.pathname.split('/');
            return parts[2] || null;
        },
        
        getTitleChapter: () => {
            const titleElement = document.querySelector('h2 span.hidden.sm\\:inline');
            return titleElement ? titleElement?.textContent.trim() : null;
        },

        getParagraphs: () => {
            const elements = Array.from(document.querySelectorAll('article p'));
            return elements.map(el => el.textContent.trim()).filter(Boolean);
        },

        getChapterData: () => {
            const titleNovel = window.NovelDownloader.selectors.getTitleNovel();
            const titleChapter = window.NovelDownloader.selectors.getTitleChapter();
            const paragraphs = window.NovelDownloader.selectors.getParagraphs();
            return { titleNovel, titleChapter, paragraphs };
        }
    };
})();
