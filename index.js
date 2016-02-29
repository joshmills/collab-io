var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

var numUsers = 0;
var connectedUsers = {};

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html'); 
});

io.on('connection', function(socket) {
	
	// Connect with new username
	socket.username = Math.random().toString(36).slice(2);
	++numUsers;
	connectedUsers[socket.username] = {};
	connectedUsers
	socket.emit('login', {
		you: socket.username,
		connectedUsers: connectedUsers
	});

	socket.broadcast.emit('connected', {
		username: socket.username
	});

	socket.on('disconnect', function(data) {

		--numUsers;
		delete connectedUsers[socket.username]

		io.emit('disconnected', {
			username: socket.username
		});
	});

	socket.on('text_change', function(data) {
		socket.broadcast.emit('text_update', data);
	});
});

http.listen(3000, function() {
	console.log('listening on *:3000');
});
