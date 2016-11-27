/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var room_system_1 = __webpack_require__(1);
	var socket = io();
	room_system_1.default(socket);
	socket.on('gameInit', function (data) {
	    console.log(data.sockets);
	    console.log(socket.id);
	    console.log('hello webpack');
	});


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	function startRoomSystem(socket) {
	    var roomSystem = {
	        init: function () {
	            this.cacheDom();
	            this.bindEvents();
	        },
	        cacheDom: function () {
	            this.mainDiv = document.getElementById('main-div');
	            this.waitingDiv = document.getElementById('waiting-div');
	            this.messageDiv = document.getElementById('message-div');
	            this.createNewRoomInput = document.getElementById('create-new-room-input');
	            this.createNewRoomBtn = document.getElementById('create-new-room-btn');
	            this.roomsDiv = document.getElementById('rooms-div');
	        },
	        bindEvents: function () {
	            this.createNewRoomBtn.onclick = this.createNewRoomEvent.bind(this);
	            this.createNewRoomInput.onkeypress = function (event) {
	                if (event.keyCode === 13 || event.which === 13) {
	                    roomSystem.createNewRoomEvent();
	                }
	            };
	            for (var i = 0; i < this.roomsDiv.childElementCount; i++) {
	                var room = this.roomsDiv.children[i];
	                if (room.lastChild.className === 'join-room-btn') {
	                    room.lastChild.onclick = roomSystem.joinRoomEvent.bind(roomSystem, room.firstChild.textContent);
	                }
	            }
	        },
	        joinRoomEvent: function (roomName) {
	            socket.emit('joinRoomEvent', roomName);
	            this.showWaitingDivAndHideMainDiv(true);
	            this.waitingDiv.lastChild.onclick = this.cancelCreateNewRoomEvent.bind(this, roomName);
	        },
	        createNewRoomEvent: function () {
	            var roomName = this.createNewRoomInput.value;
	            this.hideMessageDiv();
	            if (roomName === '') {
	                this.showMessageDiv('please Enter the name!');
	            }
	            else if (roomName.length > 18) {
	                this.showMessageDiv('Name must shorter than 18!');
	            }
	            else {
	                socket.emit('clientCreateNewRoomEvent', roomName);
	                this.waitingDiv.lastChild.onclick = this.cancelCreateNewRoomEvent.bind(this, roomName);
	            }
	        },
	        cancelCreateNewRoomEvent: function (roomName) {
	            this.hideWaitingDivAndShowMainDiv();
	            socket.emit('cancelCreateNewRoomEvent', roomName);
	        },
	        resetRooms: function (rooms) {
	            while (roomSystem.roomsDiv.firstChild) {
	                roomSystem.roomsDiv.removeChild(roomSystem.roomsDiv.firstChild);
	            }
	            for (var room in rooms) {
	                roomSystem.appendNewRoom(room, rooms[room]);
	            }
	            roomSystem.bindEvents();
	        },
	        appendNewRoom: function (roomName, isFull) {
	            var roomDiv = document.createElement('div');
	            roomDiv.setAttribute('class', 'room-div');
	            var span = document.createElement('span');
	            span.textContent = roomName;
	            var button = document.createElement('button');
	            var icon = document.createElement('i');
	            if (isFull) {
	                button.setAttribute('class', 'full-room-btn');
	                icon.setAttribute('class', 'fa fa-users');
	            }
	            else {
	                button.setAttribute('class', 'join-room-btn');
	                icon.setAttribute('class', 'fa fa-sign-in');
	            }
	            button.appendChild(icon);
	            roomDiv.appendChild(span);
	            roomDiv.appendChild(button);
	            this.roomsDiv.appendChild(roomDiv);
	        },
	        getRoomDivByName: function (roomName) {
	            for (var i = 0; i < this.roomsDiv.childElementCount; i++) {
	                if (this.roomsDiv.children[i].getElementsByTagName('span')[0].textContent === roomName) {
	                    return this.roomsDiv.children[i];
	                }
	                ;
	            }
	        },
	        removeRoomByName: function (roomName) {
	            this.getRoomDivByName(roomName).remove();
	        },
	        showMessageDiv: function (message) {
	            this.messageDiv.style.display = 'flex';
	            this.messageDiv.textContent = message;
	        },
	        hideMessageDiv: function () {
	            this.messageDiv.style.display = 'none';
	        },
	        showWaitingDivAndHideMainDiv: function (isJoinOther) {
	            this.waitingDiv.style.display = 'flex';
	            this.mainDiv.style.display = 'none';
	            if (isJoinOther) {
	                this.waitingDiv.getElementsByTagName('p')[0].textContent = 'joining room, please wait...';
	            }
	        },
	        hideWaitingDivAndShowMainDiv: function () {
	            this.waitingDiv.style.display = 'none';
	            this.mainDiv.style.display = 'flex';
	        },
	    };
	    socket.on('respondClientCreateNewRoomEvent', function (data) {
	        if (data.isHost) {
	            if (data.nameRepeat) {
	                roomSystem.showMessageDiv('this name is already used');
	            }
	            else {
	                roomSystem.showWaitingDivAndHideMainDiv();
	            }
	        }
	        else {
	            roomSystem.resetRooms(data.rooms);
	        }
	    });
	    socket.on('resetRooms', roomSystem.resetRooms);
	    socket.on('roommateDisconnect', function (roomName) {
	    });
	    roomSystem.init();
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = startRoomSystem;


/***/ }
/******/ ]);