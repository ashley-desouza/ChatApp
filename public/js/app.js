'use strict';

let socket = io();

socket.on('message', data => {
	const $serverMessages = jQuery('#serverMessages');

	$serverMessages.append(`<p>${data.text}</p>`);
});

document.addEventListener('submit', event => {
	event.preventDefault();

	let message = document.getElementById('messageBox').value;

	socket.emit('message', { text: message });

	document.getElementById('messageBox').value = '';
});
