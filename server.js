'use strict';

const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http); // http://socket.io/docs/
const moment = require('moment');

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public/'));

io.on('connection', (socket) => {
	console.log('Connection Established through Socket.IO');

	socket.emit('message', {
		text: 'Welcome',
		timestamp: moment().valueOf(),
		username: 'System'
	});

	socket.on('message', data => {
		// socket.broadcast.emit('message', data); -- Send to all connections EXCEPT emitter

		// http://momentjs.com/docs/#/displaying/unix-timestamp-milliseconds/
		data.timestamp = moment().valueOf(); // Get UNIX TimeStamp (milliseconds)
		
		io.emit('message', data); // Send to all connections including emitter
	});
});

http.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
