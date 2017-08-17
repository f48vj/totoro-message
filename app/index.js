const electron = require('electron');
const {
    app,
    nativeImage,
    Tray,
    BrowserWindow,
    shell,
    ipcMain,
    Menu,
} = electron;
const path = require('path');
const isDev = require('electron-is-dev');

let tray = null;
let win = null;
let appWillQuit = false;
let count = null;

app.on('ready', () => {
    if (!isDev) {
        app.setLoginItemSettings({
            openAtLogin: true,
        });
    }
    Menu.setApplicationMenu(
        Menu.buildFromTemplate([
            {
                submenu: [
                    {
                        role: 'about',
                        label: 'About Totoro Message',
                    },
                    { type: 'separator' },
                    {
                        role: 'reload',
                    },
                    {
                        role: 'quit',
                        label: 'Quit Totoro Message',
                    },
                ],
            },
        ])
    );
    
    win = new BrowserWindow({
        title: 'Totoro Message',
        width: 820,
        height: 550,
        resizable: false,
        fullscreenable: false,
        minimizable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    win.loadURL('http://totoro.pajk-ent.com/message/topbar');
    win.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        shell.openExternal(url);
        win.webContents.send('getCount');
    });
    win.on('page-title-updated', event => {
        event.preventDefault();
    });
    win.on('close', event => {
        if (appWillQuit) return;
        event.preventDefault();
        win.hide();
    });

    const icon = nativeImage
        .createFromPath(path.join(__dirname, 'icon.png'))
        .resize({ width: 18, height: 18 });
    icon.setTemplateImage(true);
    tray = new Tray(icon);

    tray.on('click', () => {
        win.isVisible() ? win.hide() : win.show();
    });

    win.on('show', () => {
        tray.setHighlightMode('always');
        app.dock.show();
    });
    win.on('hide', () => {
        tray.setHighlightMode('never');
        app.dock.hide();
        win.webContents.reload();
    });

    ipcMain.on('changeCount', (event, newCount) => {
        console.log('changeCount', newCount);
        if (count !== null && count !== newCount && !win.isVisible()) {
            console.log('reload');
            win.webContents.reload();
        }
        count = newCount;
        tray.setTitle(count ? `${count}` : '');
    });
});

app.on('before-quit', e => {
    appWillQuit = true;
});
