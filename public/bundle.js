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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var game_init_1 = __webpack_require__(2);
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
	                socket.emit('checkIfNameExist', roomName);
	                this.waitingDiv.lastChild.onclick = this.cancelCreateNewRoomEvent.bind(this, roomName);
	            }
	        },
	        cancelCreateNewRoomEvent: function (roomName) {
	            this.hideWaitingDivAndShowMainDiv();
	            socket.emit('leaveRoom', roomName);
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
	        hideRoomSystem: function () {
	            document.getElementById('room-system-div').style.display = 'none';
	        },
	        showRoomSystem: function () {
	            document.getElementById('room-system-div').style.display = 'flex';
	            roomSystem.hideWaitingDivAndShowMainDiv();
	        }
	    };
	    socket.on('respondCheckIfNameExist', function (nameRepeat) {
	        if (nameRepeat) {
	            roomSystem.showMessageDiv('this name is already used');
	        }
	        else {
	            roomSystem.showWaitingDivAndHideMainDiv();
	        }
	    });
	    socket.on('resetRooms', roomSystem.resetRooms);
	    socket.on('gameInit', function (room, roomName) {
	        roomSystem.hideRoomSystem();
	        var socketIds = Object.keys(room.sockets);
	        var playerId = socketIds.indexOf(socket.id) === 0 ? 1 : 2;
	        game_init_1.default(playerId, socket, roomName);
	    });
	    socket.on('roommateDisconnect', function (roomName) {
	        socket.emit('leaveRoom', roomName);
	        alert('the other player lost connection');
	        location.reload();
	    });
	    roomSystem.init();
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = startRoomSystem;


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var game;
	var socket;
	var GameInfo = (function () {
	    function GameInfo() {
	    }
	    return GameInfo;
	}());
	GameInfo.isGameStart = false;
	var Tower = (function (_super) {
	    __extends(Tower, _super);
	    function Tower(x, y) {
	        var _this = _super.call(this, game, x, y, 'brown-tower') || this;
	        _this.isSelected = false;
	        game.physics.enable(_this, Phaser.Physics.ARCADE);
	        _this.body.immovable = true;
	        _this.anchor.set(0.5);
	        _this.inputEnabled = true;
	        _this.events.onInputDown.add(function () {
	            if (_this.ownerId === GameInfo.playerId) {
	                _this.isSelected = !_this.isSelected;
	            }
	            else {
	            }
	            console.log('select tower: ' + _this.isSelected);
	        });
	        game.add.existing(_this);
	        return _this;
	    }
	    return Tower;
	}(Phaser.Sprite));
	var tower1;
	var tower2;
	var weapon;
	function preload() {
	    bindSocketEvent();
	    game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
	    game.scale.pageAlignHorizontally = true;
	    game.scale.pageAlignVertically = true;
	    game.stage.backgroundColor = '#eee';
	    game.stage.disableVisibilityChange = true;
	    game.load.image('ball', 'img/ball.png');
	    game.load.image('brown-tower', 'img/brown-tower.png');
	    game.load.spritesheet('button', 'img/button.png', 120, 40);
	}
	function create() {
	    game.physics.startSystem(Phaser.Physics.ARCADE);
	    tower1 = new Tower(game.world.width * 0.1, game.world.height * 0.5);
	    tower1.ownerId = 1;
	    tower2 = new Tower(game.world.width * 0.9, game.world.height * 0.5);
	    tower2.ownerId = 2;
	    var startButton = game.add.button(game.world.width * 0.5, game.world.height * 0.5, 'button', ready, this, 1, 0, 2);
	    function ready() {
	        socket.emit('readyToStartGame', GameInfo.roomName, GameInfo.playerId);
	        startButton.destroy();
	        renderText = "you are ready, now waiting the other";
	    }
	    startButton.anchor.set(0.5);
	}
	function update() {
	    if (!GameInfo.isGameStart)
	        return;
	}
	var renderText = "debug text";
	function render() {
	    game.debug.text(renderText, 16, 24);
	}
	function bindSocketEvent() {
	    socket.on('startGame', function () {
	        GameInfo.isGameStart = true;
	        renderText = "game start";
	    });
	    socket.on('updateMouseY', function (playerId, inputY) {
	        console.log('test2');
	        if (playerId === 1) {
	        }
	        else {
	        }
	    });
	}
	function gameInit(playerId, soc, roomName) {
	    socket = soc;
	    GameInfo.playerId = playerId;
	    GameInfo.roomName = roomName;
	    game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
	        preload: preload,
	        create: create,
	        update: update,
	        render: render
	    });
	}
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = gameInit;


/***/ }
/******/ ]);