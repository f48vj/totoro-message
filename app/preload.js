const { ipcRenderer, webFrame } = require('electron');

webFrame.setZoomLevelLimits(1, 1);

function getCount() {
    console.log('getCount');
    fetch('http://totoro.pajk-ent.com/message/count', {
        credentials: 'same-origin',
    })
        .then(res => res.json())
        .then(data => {
            const { result, success } = data;
            if (success && result) {
                console.log(result.count);
                ipcRenderer.send('changeCount', result.count);
            }
        })
        .catch(err => console.error(err));
}

ipcRenderer.on('getCount', getCount);

getCount();
setInterval(getCount, 1000 * 60);
