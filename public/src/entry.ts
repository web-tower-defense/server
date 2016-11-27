import startRoomSystem from "./room-system";

declare var io : SocketIOClientStatic;

var socket = io();
startRoomSystem(socket);
socket.on('gameInit', function(data){
	// var playerId = data.id;
	console.log(data.sockets);
	console.log(socket.id);
	console.log('hello webpack');
})
