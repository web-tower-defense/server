declare var require: any;
declare var module: any;
var app = require('../app');
var http = require('http').Server(app);
var io = require('socket.io')(http);

class Player{
	socketId: string;
	isReadyToStartGame: boolean = false;
}
class RoomData{
	public player: Array<Player> = [];
	public constructor(public roomName:string){
		this.player[1] = new Player();
		this.player[2] = new Player();
	}
	public isBothPlayerReady(){
		return this.player[1].isReadyToStartGame&&this.player[2].isReadyToStartGame;
	}

}
var fullRooms :
{
    [roomName: string]: RoomData;
} = {};
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
	// build room
	socket.on('joinRoomEvent',function(roomName){
		socket.join(roomName);
		io.sockets.emit('resetRooms',getRoomsData());

		var room = io.sockets.adapter.rooms[roomName];
		let socketIds = Object.keys(room.sockets);
		io.to(roomName).emit('gameInit', room, roomName);

		fullRooms[roomName] = new RoomData(roomName);
		for(let i=0; i<room.length; i++){
			fullRooms[roomName].player[i+1].socketId = socketIds[i];
		}
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
		if(fullRooms.hasOwnProperty(roomName)){
			delete fullRooms[roomName];
		}
		io.sockets.emit('resetRooms',getRoomsData());
	});
	// during game
	socket.on('readyToStartGame', (roomName, playerId)=>{
		fullRooms[roomName].player[playerId].isReadyToStartGame = true;
		if(fullRooms[roomName].isBothPlayerReady()){

			io.to(roomName).emit('startGame');
		}
	})
	socket.on('updateMouseY', (roomName, playerId, inputY)=>{
		io.to(roomName).emit('updateMouseY', playerId, inputY);
	})
  socket.on('fire', (roomName, towerIdx,isFireAll,targetTowerIdx)=>{
    io.to(roomName).emit('fire', roomName, towerIdx,isFireAll,targetTowerIdx);
  })
  // outside the room
	socket.on('disconnect', function(){
		for(let roomName in fullRooms){
			for(let player of fullRooms[roomName].player){
				if(player&&player.socketId === socket.id){
					io.to(roomName).emit('roommateDisconnect',roomName);
					io.sockets.emit('resetRooms',getRoomsData());
					return;
				}
			}
		}
		io.sockets.emit('resetRooms',getRoomsData());
		return;

	})
}
module.exports=http;
