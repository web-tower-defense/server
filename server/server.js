var app = require('../app');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Game_data=function(){
	this.room_command=[];
}
var game_data=new Game_data();
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
		//io.sockets.adapter.rooms[roomName]
		io.to(roomName).emit('gameInit',roomName);

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
	socket.on('gameInit', function(test){
		console.log('socket successful passed:'+test);
	})
	socket.on('game_command', function(data){
		if(data.commands.length!==0)console.log('game_command room:'+
		data.roomName+",length:"+data.commands.length);
		if(game_data.room_command[data.roomName]===undefined){
			game_data.room_command[data.roomName]=0;
		}
		if(game_data.room_command[data.roomName]===0){
			game_data.room_command[data.roomName]=data.commands;
		}else{
			game_data.room_command[data.roomName]=
				game_data.room_command[data.roomName].concat(data.commands);
			io.to(data.roomName).emit('game_command',game_data.room_command[data.roomName]);
			//console.log('sent_game_commands:'+game_data.room_command[data.roomName].length);
			game_data.room_command[data.roomName]=0;
		}
	})
});

module.exports=http;
