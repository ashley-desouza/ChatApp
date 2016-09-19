'use strict';

const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http); // http://socket.io/docs/
const moment = require('moment');

const PORT = process.env.PORT || 3000;
let clientInfo = {};

app.use(express.static(__dirname + '/public/'));

io.on('connection', (socket) => {
	console.log('Connection Established through Socket.IO');

	socket.on('joinRoom', user => {
		socket.join(user.room);

		clientInfo[socket.id] = user;

		socket.broadcast.to(clientInfo[socket.id].room).emit('message', {
			text: `${clientInfo[socket.id].username} has joined! Say Hi!`,
			username: 'System',
			timestamp: moment().valueOf()
		});
	});

	socket.emit('message', {
		text: 'Welcome',
		timestamp: moment().valueOf(),
		username: 'System'
	});

	socket.on('message', data => {
		// socket.broadcast.emit('message', data); -- Send to all connections EXCEPT emitter

		// http://momentjs.com/docs/#/displaying/unix-timestamp-milliseconds/
		data.timestamp = moment().valueOf(); // Get UNIX TimeStamp (milliseconds)

		// io.emit('message', data); // Send to all connections including emitter

		io.to(clientInfo[socket.id].room).emit('message', data); // Send to all connections including emitter
	});
});

http.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
