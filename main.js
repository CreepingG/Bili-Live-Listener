// Modules to control application life and create native browser window
const {app, BrowserWindow, Tray, Menu} = require('electron');
const path = require('path');
const notifier = require('node-notifier');
const nodeConsole = require('console');
const console = new nodeConsole.Console(process.stdout, process.stderr);
const fs = require('fs');

// 使用浏览器打开网页
function Open(url){
	let c = require('child_process');
	c.exec('start ' + url);
}

function createWindow () {
	// Create the browser window.
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true // 允许require
		}
	});

	// and load the index.html of the app.
	win.loadFile('index.html');

	// 关闭上方菜单
	win.setMenu(null);
	
	// 覆写最小化行为
	win.on('minimize', (event) => {
		win.hide();
		win.setSkipTaskbar(true);
		event.preventDefault();
	});

	// 创建系统通知区菜单
	const tray = new Tray(path.join(__dirname, 'icon.ico'));
	tray.setToolTip('Bili开播提醒');
	tray.setContextMenu(Menu.buildFromTemplate([
		{label: '退出', click: () => {win.destroy();}},// 真正的退出
	]));
	tray.on('click', ()=>{ // 单击托盘图标时切换应用显隐
		if (win.isVisible()){
			win.hide();
			win.setSkipTaskbar(true); // 下方任务栏按钮
		}
		else{
			win.show();
			win.setSkipTaskbar(false);
		}
	});

	// 进程间通信
	const ipcMain = require('electron').ipcMain;
	ipcMain.on('asynchronous-message', function(event, arg) {
		console.log(arg);
		arg = JSON.parse(arg);
		let action = arg.action;
		if (action === 'notify'){
			let {title, body, url} = arg;
			// event.sender.send('asynchronous-reply', 'pong');
			// let notification = new Notification(title, {body});
			// notification.show();
			notifier.notify({
				title: title,
				message: body,
				sound: true,
				appID: '开播提醒'
			}, (error, type, info)=>{
				if (type !== 'timeout'){
					Open(url);
				}
			});
		}
		else if (action === 'open'){
			Open(arg.url);
		}
		else if(action === 'f12'){
			win.webContents.openDevTools();
		}
		else if(action === 'write'){
			fs.writeFile('config.txt', arg.data);
		}
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.setAppUserModelId("com.electron.bili-live-reminder");

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
