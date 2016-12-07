var app = require('../app');
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Game_data=function(){
	this.room_command=[];
}
var game_data=new Game_data();
var waitingRooms = {};
var fullRooms = [];
io.on('connection', function(socket){
	function getRoomsData () {
		var roomsData = {};
		for(room in io.sockets.adapter.rooms){
			if(room.length<20){
				roomsData[room] = io.sockets.adapter.rooms[room].length===waitingRooms[room].maxPlayer;
			}
		}
		return roomsData;
	}
	fs.readdir(__dirname+"/../public/maps", (err,files)=>{
		socket.emit('resetMapImg', files)
	})
	socket.emit('resetRooms',getRoomsData());

	socket.on('joinRoomEvent',function(roomName, playerName){
		var data = io.sockets.adapter.rooms[roomName];
		data.name = roomName;
		socket.join(roomName);
		waitingRooms[roomName].playerNames.push(playerName);
		//io.sockets.adapter.rooms[roomName]

		// trans form follow function other place
		if(io.sockets.adapter.rooms[roomName].length===waitingRooms[roomName].maxPlayer){
			io.to(roomName).emit('gameInit', data);
			io.sockets.emit('resetRooms',getRoomsData());
			room_init(roomName);
			delete waitingRooms[roomName];
		}else{
			io.to(roomName).emit('newJoiner', waitingRooms[roomName].playerNames);

		}
	});
	socket.on('clientCreateNewRoomEvent', function(roomName, mapName, playerName, maxPlayer) {
		console.log(maxPlayer);
		var data = {};
		data.roomName = roomName;
		data.isHost = true;
		if(io.sockets.adapter.rooms.hasOwnProperty(roomName)){
			data.nameRepeat=true;
		}else{
			waitingRooms[roomName] = {};
			waitingRooms[roomName].playerNames = [];
			waitingRooms[roomName].playerNames[0] = playerName;
			waitingRooms[roomName].mapName = mapName;
			waitingRooms[roomName].maxPlayer=maxPlayer;

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
	function room_init(name){
		console.log("room_init:"+name);
		game_data.room_command[name]=0;
	}
	socket.on('game_command', function(data){
		//console.log('game_command room:'+
		//data.roomName+",loop_times:"+data.loop_times+",unit_length:"+data.unit_length);
		//console.log('game_command room:'+
		//data.roomName+",loop_times:"+data.loop_times);

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
