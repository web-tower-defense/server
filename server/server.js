var app = require('../app');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Player = (function () {
    function Player() {
        this.isReadyToStartGame = false;
    }
    return Player;
}());
var RoomData = (function () {
    function RoomData(roomName) {
        this.roomName = roomName;
        this.player = [];
        this.player[1] = new Player();
        this.player[2] = new Player();
    }
    RoomData.prototype.isBothPlayerReady = function () {
        return this.player[1].isReadyToStartGame && this.player[2].isReadyToStartGame;
    };
    return RoomData;
}());
var fullRooms = {};
io.on('connection', socketHandler);
function getRoomsData() {
    var roomsData = {};
    for (var room in io.sockets.adapter.rooms) {
        if (room.length < 20) {
            roomsData[room] = io.sockets.adapter.rooms[room].length === 2;
        }
    }
    return roomsData;
}
function socketHandler(socket) {
    socket.emit('resetRooms', getRoomsData());
    socket.on('joinRoomEvent', function (roomName) {
        socket.join(roomName);
        io.sockets.emit('resetRooms', getRoomsData());
        var room = io.sockets.adapter.rooms[roomName];
        var socketIds = Object.keys(room.sockets);
        io.to(roomName).emit('gameInit', room, roomName);
        fullRooms[roomName] = new RoomData(roomName);
        for (var i = 0; i < room.length; i++) {
            fullRooms[roomName].player[i + 1].socketId = socketIds[i];
        }
    });
    socket.on('checkIfNameExist', function (roomName) {
        var nameRepeat;
        if (io.sockets.adapter.rooms.hasOwnProperty(roomName)) {
            nameRepeat = true;
        }
        else {
            nameRepeat = false;
            socket.join(roomName);
        }
        socket.emit('respondCheckIfNameExist', nameRepeat);
        socket.broadcast.emit('resetRooms', getRoomsData());
    });
    socket.on('leaveRoom', function (roomName) {
        socket.leave(roomName);
        if (fullRooms.hasOwnProperty(roomName)) {
            delete fullRooms[roomName];
        }
        io.sockets.emit('resetRooms', getRoomsData());
    });
    socket.on('readyToStartGame', function (roomName, playerId) {
        fullRooms[roomName].player[playerId].isReadyToStartGame = true;
        if (fullRooms[roomName].isBothPlayerReady()) {
            fullRooms[roomName].updateTowersTimer = setInterval(function () {
                io.to(roomName).emit('updateTowers');
            }, 1500);
            io.to(roomName).emit('startGame');
        }
    });
    socket.on('updateMouseY', function (roomName, playerId, inputY) {
        io.to(roomName).emit('updateMouseY', playerId, inputY);
    });
    socket.on('fire', function (roomName, towerIdx, isFireAll, targetTowerIdx) {
        io.to(roomName).emit('fire', roomName, towerIdx, isFireAll, targetTowerIdx);
    });
    socket.on('disconnect', function () {
        for (var roomName in fullRooms) {
            for (var _i = 0, _a = fullRooms[roomName].player; _i < _a.length; _i++) {
                var player = _a[_i];
                if (player && player.socketId === socket.id) {
                    io.to(roomName).emit('roommateDisconnect', roomName);
                    clearInterval(fullRooms[roomName].updateTowersTimer);
                    delete fullRooms[roomName];
                    io.sockets.emit('resetRooms', getRoomsData());
                    return;
                }
            }
        }
        io.sockets.emit('resetRooms', getRoomsData());
        return;
    });
}
module.exports = http;
