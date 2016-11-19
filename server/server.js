var app = require('../app');
var http = require('http').Server(app);
var io = require('socket.io')(http);


var fullRooms = [];
io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('clientCreateNewRoomEvent', function(roomName) {
		if(io.sockets.adapter.rooms.hasOwnProperty(roomName)){
			console.log('### this name exist');
		}else{
			socket.join(roomName);
			console.log('### create room success');
		}
	})
	socket.on('disconnect', function(){
		console.log('user disconnected');
	})
});

module.exports=http;
