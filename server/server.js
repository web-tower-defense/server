var app = require('../app');
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);
Game_data=function(){
	this.room_command=[];
	this.room_command_num=[];
	this.room_max_player=[];
	this.room_map_name=[];
}
var game_data=new Game_data();
var waitingRooms = {};
var fullRooms = [];
io.on('connection', function(socket){
	function getRoomsData () {
		var roomsData = {};
		for(room in io.sockets.adapter.rooms){
			if(room.length<20){
				roomsData[room] =
					io.sockets.adapter.rooms[room].length===game_data.room_max_player[room];
			}
		}
		return roomsData;
	}
	fs.readdir(__dirname+"/../public/maps", (err,files)=>{
		socket.emit('resetMapImg', files)
	})
	socket.emit('resetRooms',getRoomsData());

	socket.on('joinRoomEvent',function(roomName, playerName){
		console.log("playerName is"+playerName);
		var data = io.sockets.adapter.rooms[roomName];
		data.name = roomName;
		data.map_name=game_data.room_map_name[roomName];
		socket.join(roomName);
		//io.sockets.adapter.rooms[roomName]
		console.log("join_room:"+roomName+",cur_player_num:"+game_data.room_max_player[roomName]);
		if(io.sockets.adapter.rooms[roomName].length===game_data.room_max_player[roomName]){
			io.to(roomName).emit('gameInit', data);
		}
	});
	socket.on('clientCreateNewRoomEvent', function(roomName, mapName, playerName, maxPlayer) {

		var data = {};
		data.roomName = roomName;
		data.isHost = true;
		if(io.sockets.adapter.rooms.hasOwnProperty(roomName)){
			data.nameRepeat=true;
		}else{
			var map_name=mapName.split('(')[0]+".json";
			waitingRooms[roomName] = {};
			waitingRooms[roomName].playerNames = [];
			waitingRooms[roomName].playerNames[0] = playerName;
			waitingRooms[roomName].mapName = mapName;
			waitingRooms[roomName].maxPlayer=maxPlayer;

			console.log(waitingRooms[roomName]);
			data.nameRepeat=false;
			socket.join(roomName);
			room_init(roomName,maxPlayer,map_name);
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
	function room_init(name,maxPlayer,map_name){

		game_data.room_command[name]=0;
		game_data.room_max_player[name]=maxPlayer;
		game_data.room_map_name[name]=map_name;
		console.log("room_init:"+name+",max_player:"+game_data.room_max_player[name]);
	}
	socket.on('game_command', function(data){
		//console.log('game_command room:'+
		//data.roomName+",loop_times:"+data.loop_times+",unit_length:"+data.unit_length);
		//console.log('game_command room:'+
		//data.roomName+",loop_times:"+data.loop_times);

		if(game_data.room_command[data.roomName]===undefined){
			game_data.room_command[data.roomName]=0;
			game_data.room_command_num[data.roomName]=0;
		}
		if(game_data.room_command[data.roomName]===0){
			game_data.room_command[data.roomName]=data.commands;
			game_data.room_command_num[data.roomName]=1;
		}else{
			game_data.room_command[data.roomName]=
				game_data.room_command[data.roomName].concat(data.commands);
			game_data.room_command_num[data.roomName]++;
		}

		if(game_data.room_command_num[data.roomName]===game_data.room_max_player[data.roomName]){
			io.to(data.roomName).emit('game_command',game_data.room_command[data.roomName]);
			//console.log('sent_game_commands:'+game_data.room_command[data.roomName].length);
			game_data.room_command[data.roomName]=0;
		}
	})
});

module.exports=http;
