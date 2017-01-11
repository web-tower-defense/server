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
					(waitingRooms[room].allPlayer===game_data.room_max_player[room]);
					//(io.sockets.adapter.rooms[room].length===game_data.room_max_player[room]);
			}
		}
		return roomsData;
	}
	fs.readdir(__dirname+"/../public/maps", (err,files)=>{
		socket.emit('resetMapImg', files)
	})
	socket.emit('resetRooms',getRoomsData());

	function game_init(roomName){
		var data = io.sockets.adapter.rooms[roomName];
		data.name = roomName;
		data.map_name=game_data.room_map_name[roomName];
		data.max_player=game_data.room_max_player[roomName];
		game_data.room_max_player[roomName] -= waitingRooms[roomName].AInum;
		io.to(roomName).emit('gameInit', data);
	}

	function getCurrentRoomData(roomName){
		var data = {};
		data.mapName = waitingRooms[roomName].mapName;
		data.maxPlayer = waitingRooms[roomName].maxPlayer;
		data.allPlayer = waitingRooms[roomName].allPlayer;
		data.readyPlayer = waitingRooms[roomName].readyPlayer;
		data.players = [];
		waitingRooms[roomName].playerNames.forEach(function(player_name, key){
			var player = {};
			player.name = player_name;
			player.status = waitingRooms[roomName].playerStatus[key];
			player.ID = key+1;
			data.players.push(player);
		});
		return data;
	}
	socket.on('joinRoomEvent',function(roomName, playerName){
		socket.join(roomName);
		game_data.socket_ids[roomName].push(socket.id);
		for(var i=0; i<waitingRooms[roomName].maxPlayer; i++){
			if(waitingRooms[roomName].playerNames[i] === null){
				waitingRooms[roomName].playerNames[i] = playerName;
				waitingRooms[roomName].playerStatus[i] = 'waiting';
				waitingRooms[roomName].allPlayer++;
				break;
			}
		}
		//io.sockets.adapter.rooms[roomName]
		var data = getCurrentRoomData(roomName)
		socket.emit('respondJoinRoomEvent', data);
		io.to(roomName).emit('updateRoom', data); //update room with new player

		if(io.sockets.adapter.rooms[roomName].length===game_data.room_max_player[roomName]){
			//game_init(roomName);
		}
		io.sockets.emit('resetRooms',getRoomsData());
	});

	socket.on('clientCreateNewRoomEvent', function(roomName, mapName, playerName, maxPlayer) {
		var data = {};
		var nameRepeat = false;
		if(io.sockets.adapter.rooms.hasOwnProperty(roomName)){
			nameRepeat = true;
		}else{
			var map_name=mapName.split('(')[0]+".json";
			waitingRooms[roomName] = {};
			waitingRooms[roomName].playerNames = [];
			waitingRooms[roomName].playerNames[0] = playerName;
			waitingRooms[roomName].playerStatus = [];
			waitingRooms[roomName].playerStatus[0] = 'waiting';
			waitingRooms[roomName].mapName = mapName;
			waitingRooms[roomName].maxPlayer = maxPlayer;
			waitingRooms[roomName].allPlayer = 1;
			waitingRooms[roomName].readyPlayer = 0;
			waitingRooms[roomName].AInum = 0;

			for(var i=1; i<maxPlayer; i++){
				waitingRooms[roomName].playerNames.push(null);
				waitingRooms[roomName].playerStatus.push(null);
			}

			socket.join(roomName);
			room_init(roomName,maxPlayer,map_name,socket.id);
			data = getCurrentRoomData(roomName);
		}
		data.isHost = true;
		data.nameRepeat = nameRepeat;
		socket.emit('respondClientCreateNewRoomEvent', data);
		data.isHost = false;
		data.rooms = getRoomsData();
		socket.broadcast.emit('respondClientCreateNewRoomEvent', data);
		if(io.sockets.adapter.rooms[roomName].length===game_data.room_max_player[roomName]){
			//game_init(roomName);
		}

	});
	socket.on('cancelCreateNewRoomEvent',function(data){
		//console.log('cancel~'+data.roomName+data.playerName);
		/*for(var i=0; i<waitingRooms[data.roomName].maxPlayer; i++){
			console.log('player : '+waitingRooms[data.roomName].playerNames[i]);
			if(waitingRooms[data.roomName].playerNames[i] === data.playerName){
				console.log('find~');
				waitingRooms[data.roomName].playerNames[i] = null;
				if(waitingRooms[data.roomName].playerStatus[i] === 'ready'){
					waitingRooms[data.roomName].readyPlayer--;
				}
				waitingRooms[data.roomName].playerStatus[i] = null;
				waitingRooms[data.roomName].allPlayer--;
				break;
			}
		}*/
		waitingRooms[data.roomName].playerNames[data.playerID-1] = null;
		if(waitingRooms[data.roomName].playerStatus[data.playerID-1] === 'ready'){
			waitingRooms[data.roomName].readyPlayer--;
		}
		waitingRooms[data.roomName].playerStatus[data.playerID-1] = null;
		waitingRooms[data.roomName].allPlayer--;

		io.to(data.roomName).emit('updateRoom', getCurrentRoomData(data.roomName));
		socket.leave(data.roomName);
		io.sockets.emit('resetRooms',getRoomsData());
	});
	socket.on('disconnect', function(){
		io.sockets.emit('resetRooms',getRoomsData());
		for(var roomName in game_data.socket_ids){
			if(game_data.socket_ids[roomName].indexOf(socket.id)!==-1){
				io.to(roomName).emit('roommateDisconnect');
			}
		}
	})
	socket.on('playerReadyEvent', function(data){

		waitingRooms[data.roomName].playerNames.forEach(function(playerName, key){
			if(data.playerID === key+1){
				if(waitingRooms[data.roomName].playerStatus[key] === 'waiting'){
					waitingRooms[data.roomName].playerStatus[key] = 'ready';
					waitingRooms[data.roomName].readyPlayer++;
				}
				else{
					waitingRooms[data.roomName].playerStatus[key] = 'waiting';
					waitingRooms[data.roomName].readyPlayer--;
				}
			}
		});
		var out = getCurrentRoomData(data.roomName);
		io.to(data.roomName).emit('updateRoom', out);

		if(waitingRooms[data.roomName].readyPlayer === waitingRooms[data.roomName].maxPlayer){
			//game_init(data.roomName);
		}
	})
	socket.on('gameStartEvent', function(roomName){
		console.log('start : '+roomName);
		game_init(roomName);
	})
	socket.on('addAiEvent', function(data){
		console.log('room : '+data.roomName+' add ai : '+data.key);
		waitingRooms[data.roomName].playerNames[data.key] = 'AI';
		waitingRooms[data.roomName].playerStatus[data.key] = 'ready(AI)';
		waitingRooms[data.roomName].readyPlayer++;
		waitingRooms[data.roomName].allPlayer++;
		waitingRooms[data.roomName].AInum++;
		var out = getCurrentRoomData(data.roomName);
		io.to(data.roomName).emit('updateRoom', out);
		io.sockets.emit('resetRooms',getRoomsData());
	})
	socket.on('kickAiEvent', function(data){
		console.log('room : '+data.roomName+' add ai : '+data.key);
		waitingRooms[data.roomName].playerNames[data.key] = null;
		waitingRooms[data.roomName].playerStatus[data.key] = null;
		waitingRooms[data.roomName].readyPlayer--;
		waitingRooms[data.roomName].allPlayer--;
		waitingRooms[data.roomName].AInum--;
		var out = getCurrentRoomData(data.roomName);
		io.to(data.roomName).emit('updateRoom', out);
		io.sockets.emit('resetRooms',getRoomsData());
	})
	socket.on('gameInit', function(test){
		//game init
	})
	socket.on('createNameEvent', function(playerName){
		//do nothing currently
	})
	function room_init(name,maxPlayer,map_name,socketId){
		console.log('init name : '+name);
		game_data.room_command[name]=0;
		game_data.room_max_player[name]=maxPlayer;
		game_data.room_map_name[name]=map_name;
		game_data.socket_ids = {};
		game_data.socket_ids[name] = [];
		game_data.socket_ids[name].push(socketId);

	}
	socket.on('game_command', function(data){

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

		if(game_data.room_command_num[data.roomName]===
				game_data.room_max_player[data.roomName]){
			io.to(data.roomName).emit('game_command',game_data.room_command[data.roomName]);
			game_data.room_command[data.roomName]=0;
		}
	})
});

module.exports=http;
