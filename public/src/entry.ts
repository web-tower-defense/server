import startRoomSystem from "./room-system";

declare var io : SocketIOClientStatic;
var socket = io();

startRoomSystem(socket);
