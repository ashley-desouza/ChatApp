'use strict';

const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http); // http://socket.io/docs/

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public/'));

io.on('connection', (socket) => {
	console.log('Connection Established through Socket.IO');

	socket.emit('message', { text: 'Welcome' });

	socket.on('message', data => {
		// socket.broadcast.emit('message', data); -- Send to all connections EXCEPT emitter
		io.emit('message', data); // Send to all connections including emitter
	});
});

http.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
