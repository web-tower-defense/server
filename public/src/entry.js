"use strict";
var room_system_1 = require("./room-system");
var socket = io();
room_system_1.default(socket);
socket.on('gameInit', function (data) {
    console.log(data.sockets);
    console.log(socket.id);
    console.log('hello webpack');
});
