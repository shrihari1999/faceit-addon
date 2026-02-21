const audio = document.getElementById('audio');

chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'play-audio') {
        audio.src = request.dataUrl;
        audio.onended = () => {
            chrome.runtime.sendMessage({'type': 'alert', 'data': 'close'});
        };
        audio.play();
    }
});
