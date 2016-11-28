declare var require: any;
declare var module: any;
var app = require('../app');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var currFullRooms = {};
io.on('connection',socketHandler);
function getRoomsData () {
	var roomsData = {};
	for(let room in io.sockets.adapter.rooms){
		if(room.length<20){
			roomsData[room] = io.sockets.adapter.rooms[room].length===2;
		}
	}
	return roomsData;
}
function socketHandler(socket){
	socket.emit('resetRooms',getRoomsData());
	// inside the room
	socket.on('joinRoomEvent',function(roomName){
		socket.join(roomName);
		io.sockets.emit('resetRooms',getRoomsData());

		var room = io.sockets.adapter.rooms[roomName];
		io.to(roomName).emit('gameInit', room, roomName);
		currFullRooms[roomName]=Object.keys(room.sockets);
	});
	socket.on('checkIfNameExist', function(roomName) {
		var nameRepeat;
		if(io.sockets.adapter.rooms.hasOwnProperty(roomName)){
			nameRepeat = true;
		}else{
			nameRepeat = false;
			socket.join(roomName);
		}
		socket.emit('respondCheckIfNameExist', nameRepeat);//true means is host
		socket.broadcast.emit('resetRooms',getRoomsData());
	});
	socket.on('leaveRoom', function(roomName){
		socket.leave(roomName);
		io.sockets.emit('resetRooms',getRoomsData());
	});
	// outside the room
	socket.on('disconnect', function(){
		for(let roomName in currFullRooms){
			if(currFullRooms[roomName].indexOf(socket.id)!==-1){
				io.to(roomName).emit('roommateDisconnect',roomName);
				break;
			}
		}
		io.sockets.emit('resetRooms',getRoomsData());
	})
}
module.exports=http;
