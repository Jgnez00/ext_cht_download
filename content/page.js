(() => {
    window.NovelDownloader = window.NovelDownloader || {};

    window.NovelDownloader.page = {
        initializeTitle: () => {
            const titleElement = document.querySelector('.chr-title');
            if (titleElement) {
                window.NovelDownloader.state.currentChapterTitle = titleElement.title;
            }
        },

        downloadChapter: () => {
            const { titleNovel, titleChapter, paragraphs } = window.NovelDownloader.selectors.getChapterData();
            
            if (!titleChapter) {
                console.error('No chapter title found');
                return;
            }
            
            if (!paragraphs.length) {
                console.error('No paragraphs found');
                return;
            }

            const markdownContent = `# ${titleChapter}\n${paragraphs.join('\n\n')}`;
            const chapterMatch = titleChapter.match(/\d+/);
            const chapterNumber = chapterMatch ? chapterMatch[0].padStart(3, '0') : '000';
            const fileName = `${chapterNumber}-chapter.md`;

            chrome.runtime.sendMessage({
                action: 'download',
                content: markdownContent,
                fileName,
                titleNovel
            });
        }
    };
})();
