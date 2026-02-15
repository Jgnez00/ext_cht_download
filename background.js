chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'download') {
        const dataURL = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(message.content);
        chrome.downloads.download({
            url: dataURL,
            filename: `name/${message.fileName}`,
            saveAs: false
        }, () => {
            console.log('kd');
        });
    }
});
