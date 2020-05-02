// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.axios = require('axios');
const ipcRenderer = require('electron').ipcRenderer;
window.$send = data => ipcRenderer.send('asynchronous-message', JSON.stringify(data));
window.$text = require('fs').readFileSync('./config.txt').toString();

window.addEventListener('DOMContentLoaded', () => {
	const replaceText = (selector, text) => {
		const element = document.getElementById(selector);
		if (element) element.innerText = text;
	};

	for (const type of ['chrome', 'node', 'electron']) {
		replaceText(`${type}-version`, process.versions[type]);
	}
});
