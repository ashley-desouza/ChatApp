'use strict';

var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http); // http://socket.io/docs/
var moment = require('moment');

var PORT = process.env.PORT || 3000;

// An Object to contain each connection (having an unique socket id).
// The key is the socket id and the value is another object that contains the username and room
// of the socket.
var clientInfo = {};

app.use(express.static(__dirname + './../public/'));

// Function to generate System messages
var sendSysMessage = function sendSysMessage(message) {
	return {
		text: message,
		username: 'System',
		timestamp: moment().valueOf()
	};
};

var sendCurrentConnectedUsers = function sendCurrentConnectedUsers(socket) {
	var userInfo = clientInfo[socket.id];
	var users = [];

	// Check if the socket belongs to any chatrooms
	if (typeof clientInfo[socket.id] !== 'undefined') {
		users = Object.keys(clientInfo).reduce(function (acc, item) {
			if (clientInfo[item].room === userInfo.room) {
				acc.push(clientInfo[item].username);
			}
			return acc;
		}, []);
	}

	return users.join(', ');
};

io.on('connection', function (socket) {
	console.log('Connection Established through Socket.IO');

	// A request to join a specific chat room
	socket.on('joinRoom', function (user) {
		// Join a room - http://socket.io/docs/rooms-and-namespaces/#rooms
		socket.join(user.room);

		// Populate the client Object with the socket connection information
		clientInfo[socket.id] = user;

		// Joining Message
		var joiningMessage = clientInfo[socket.id].username + ' has joined! Say Hi!';

		// Notify all other clients belonging to the specified chat room that a new socket has joined
		// http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving
		socket.broadcast.to(clientInfo[socket.id].room).emit('message', sendSysMessage(joiningMessage));
	});

	// Socket Disconnect
	// http://socket.io/docs/rooms-and-namespaces/#default-namespace
	socket.on('disconnect', function () {
		var userData = clientInfo[socket.id];
		// Confirm that this socket was part of a chatroom
		// It is entirely possible to use the Chat App without joining a chatroom
		if (typeof userData !== 'undefined') {
			// Remove the socket from the specified chatroom
			// http://socket.io/docs/rooms-and-namespaces/#rooms
			socket.leave(userData.room);

			// Leaving Message
			var leaveMessage = clientInfo[socket.id].username + ' has left';

			io.to(clientInfo[socket.id].room).emit('message', sendSysMessage(leaveMessage));

			delete clientInfo[socket.id];
		}
	});

	socket.emit('message', sendSysMessage('Welcome new traveller!'));

	socket.on('message', function (data) {
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

http.listen(PORT, function () {
	return console.log('Listening on Port ' + PORT);
});