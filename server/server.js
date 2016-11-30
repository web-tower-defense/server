var app = require('../app');
var http = require('http').Server(app);
var io = require('socket.io')(http);


var fullRooms = [];
io.on('connection', function(socket){
	function getRoomsData () {
		var roomsData = {};
		for(room in io.sockets.adapter.rooms){
			if(room.length<20){
				roomsData[room] = io.sockets.adapter.rooms[room].length===2;
			}
		}
		return roomsData;
	}
	socket.emit('resetRooms',getRoomsData());
	socket.on('joinRoomEvent',function(roomName){
		socket.join(roomName);
		io.sockets.emit('resetRooms',getRoomsData());
		io.to(roomName).emit('gameInit', io.sockets.adapter.rooms[roomName]);
	});
	socket.on('clientCreateNewRoomEvent', function(roomName) {
		var data = {};
		data.roomName = roomName;
		data.isHost = true;
		if(io.sockets.adapter.rooms.hasOwnProperty(roomName)){
			data.nameRepeat=true;
		}else{
			data.nameRepeat=false;
			socket.join(roomName);
		}
		socket.emit('respondClientCreateNewRoomEvent', data);
		data.isHost = false;
		data.rooms = getRoomsData();
		socket.broadcast.emit('respondClientCreateNewRoomEvent', data);
		});
	socket.on('cancelCreateNewRoomEvent',function(roomName){
		socket.leave(roomName);
		io.sockets.emit('resetRooms',getRoomsData());
	});
	socket.on('disconnect', function(){
		io.sockets.emit('resetRooms',getRoomsData());
	})
	socket.on('gameInit', function(){
		console.log('socket successful passed');
	})
});

module.exports=http;
