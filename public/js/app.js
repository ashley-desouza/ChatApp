'use strict';

let socket = io();

const username = getQueryVariable('username') || 'Anonymous';
const room = getQueryVariable('room');

socket.on('message', data => {
	const $serverMessages = jQuery('#serverMessages');

	// http://momentjs.com/docs/#/parsing/utc/
	const momentTimeStamp = moment.utc(data.timestamp); // UNIX Timestamp as a Moment Object

	// http://momentjs.com/docs/#/manipulating/local/
	const localTimeStamp = momentTimeStamp.local(); // Local Timestamp based on browser TimeZone

	const localTimeStampFormatted = localTimeStamp.format('hh:mm a'); // Display time as 01:10 AM

	$serverMessages.append(`<p><strong>${localTimeStampFormatted} ${data.username}:</strong></p>`);
	$serverMessages.append(`<p>${data.text}</p>`);
});

document.addEventListener('submit', event => {
	event.preventDefault();

	let message = document.getElementById('messageBox').value;

	socket.emit('message', { text: message, username });

	document.getElementById('messageBox').value = '';
});
