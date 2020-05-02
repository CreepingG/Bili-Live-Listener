// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.axios = require('axios');
const ipcRenderer = require('electron').ipcRenderer;
window.$send = data => ipcRenderer.send('asynchronous-message', JSON.stringify(data));

window.addEventListener('DOMContentLoaded', () => {
	const input = document.getElementById('input');
	input.oninput = function(){ /* 高度自适应 */
		this.style.height = 'auto';
		this.style.height = this.scrollHeight + 'px';
	};
	try {
		input.value = (require('fs').readFileSync('./config.txt') || '').toString();
	} catch (err) {
	}
	input.value = input.value || '59901[沃玛] 33989[泛式]';

	input.oninput();
});
