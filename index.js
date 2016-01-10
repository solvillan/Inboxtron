//
// The MIT License (MIT)
//
// Copyright (c) 2016 Rickard Doverfelt
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//

const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
const URL = require('url');
const shell = electron.shell;

const inject = require('./injector');

var mainWindow = null;
var splashWindow = null;

module.exports = function getWindow() {
	return mainWindow;
}

app.on('window-all-closed', function() {
	if (process.platform != 'darwin') {
		app.quit();
	}
});

app.on('ready', function() {
  // Create the browser window.
	splashWindow = new BrowserWindow({
		width: 300,
		height: 300,
		resizable: false,
		/*type: (process.platform == 'darwin') ? 'desktop' : 'splash',*/
		transparent: true,
		frame: false,
		autoHideMenuBar: true,
		skipTaskbar: true,
		useContentSize: true
	});

	splashWindow.loadURL(__dirname + "/splash.html");

  mainWindow = new BrowserWindow({
	  width: 800,
	  height: 900,
	  'min-width': 625,
	  'title-bar-style': 'hidden-inset',
	  autoHideMenuBar: true,
	  icon: __dirname + '/icon_256x256.png',
	  overlayScrollbars: true,
	  title: 'Inbox',
	  show: false
   });

	// and load the index.html of the app.
	mainWindow.loadURL('https://inbox.google.com');
	inject(mainWindow);

	mainWindow.on('page-title-updated', function () {
		splashWindow.close();
		splashWindow = null;
		mainWindow.show();
	});

	mainWindow.webContents.on('new-window', function (ev, url, name) {
		var host = URL.parse(url).host;
		if (host != 'mail.google.com' && host != 'google-mail.com') {
			ev.preventDefault();
			shell.openExternal(url);
		}
	});

	ipc.on('show-window', function () {
		mainWindow.focus();
	})

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
