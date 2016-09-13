'use strict';

const express = require('express');
const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http); // http://socket.io/docs/

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public/'));

io.on('connection', () => console.log('Connection Established through Socket.IO'));

http.listen(PORT, () => console.log(`Listening on Port ${PORT}`));
