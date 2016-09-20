'use strict';

const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http); // http://socket.io/docs/
const moment = require('moment');

const PORT = process.env.PORT || 3000;

// An Object to contain each connection (having an unique socket id).
// The key is the socket id and the value is another object that contains the username and room
// of the socket.
let clientInfo = {};

app.use(express.static(__dirname + '/public/'));

// Function to generate System messages
const sendSysMessage = message => ({
	text: message,
	username: 'System',
	timestamp: moment().valueOf()
});

const sendCurrentConnectedUsers = socket => {
	const userInfo = clientInfo[socket.id];
	let users = [];

	// Check if the socket belongs to any chatrooms
	if (typeof clientInfo[socket.id] !== 'undefined') {
		users = Object.keys(clientInfo).reduce((acc, item) => {
			if (clientInfo[item].room === userInfo.room) {
				acc.push(clientInfo[item].username);
			}
			return acc;
		}, []);
	}

	return users.join(', ');
};

io.on('connection', (socket) => {
	console.log('Connection Established through Socket.IO');

	// A request to join a specific chat room
	socket.on('joinRoom', user => {
		// Join a room - http://socket.io/docs/rooms-and-namespaces/#rooms
		socket.join(user.room);

		// Populate the client Object with the socket connection information
		clientInfo[socket.id] = user;

		// Joining Message
		const joiningMessage = `${clientInfo[socket.id].username} has joined! Say Hi!`		

		// Notify all other clients belonging to the specified chat room that a new socket has joined
		// http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving
		socket.broadcast.to(clientInfo[socket.id].room).emit('message', sendSysMessage(joiningMessage));
	});

	// Socket Disconnect
	// http://socket.io/docs/rooms-and-namespaces/#default-namespace
	socket.on('disconnect', () => {
		const userData = clientInfo[socket.id];
		// Confirm that this socket was part of a chatroom
		// It is entirely possible to use the Chat App without joining a chatroom
		if (typeof userData !== 'undefined') {
			// Remove the socket from the specified chatroom
			// http://socket.io/docs/rooms-and-namespaces/#rooms
			socket.leave(userData.room);

			// Leaving Message
			const leaveMessage = `${clientInfo[socket.id].username} has left`;

			io.to(clientInfo[socket.id].room).emit('message', sendSysMessage(leaveMessage));

			delete clientInfo[socket.id];			
		}

	});

	socket.emit('message', sendSysMessage('Welcome new traveller!'));

	socket.on('message', data => {
		// socket.broadcast.emit('message', data); -- Send to all connections EXCEPT emitter

		// http://momentjs.com/docs/#/displaying/unix-timestamp-milliseconds/
		data.timestamp = moment().valueOf(); // Get UNIX TimeStamp (milliseconds)

		if (data.text === '@currentUsers') {
			data.text = sendCurrentConnectedUsers(socket);

			socket.emit('message', data);
		} else {
			// io.emit('message', data); // Send to all connections including emitter

			// -- Send to all connections (belonging to the same room) including emitter
			io.to(clientInfo[socket.id].room).emit('message', data); 
		}
	});
});

http.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
