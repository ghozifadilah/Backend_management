
const information = document.getElementById('info')
information.innerText = error;


// const { require, ipcRenderer } = window.electron;



// const remote = '';

// try {
//     remote = require('electron').remote;
// } catch (error) {
//     console.log(error);
// }

// const win = remote.getCurrentWindow();
// const Tray = remote.Tray;
// const Menu = remote.Menu;
// //  tray is declared out to prevent garbage collection
// //  https://www.electronjs.org/docs/faq#my-apps-windowtray-disappeared-after-a-few-minutes
// let tray = null;
// win.on('minimize', () => {
//     if (tray) { return win.hide(); }
//     //  tray documentation at - https://github.com/electron/electron/blob/main/docs/api/menu-item.md
//     tray = new Tray('assets/icon.png');
//     const template = [
//         {
//             label: 'CodeSpeedy',
//             icon: 'assets/icon.png',
//             enabled: false,
//         },
//         {
//             type: 'separator',
//         },
//         {
//             label: 'Show App', click: function () {
//                 win.show();
//             },
//         },
//         {
//             label: 'Quit', click: function () {
//                 win.close();
//             },
//         },
//     ];
//     const contextMenu = Menu.buildFromTemplate(template);
//     tray.setContextMenu(contextMenu);
//     tray.setToolTip('CodeSpeedy');
//     win.hide();
// })