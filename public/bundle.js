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
	var ai_game_init_1 = __webpack_require__(3);
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
	            this.roomsDiv.firstChild.onclick = ai_game_init_1.default.bind(null, 1, socket, 'play with ai');
	            for (var i = 1; i < this.roomsDiv.childElementCount; i++) {
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
	            roomSystem.appendNewRoom('Play with AI', false);
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
	var renderText = "init";
	var towers;
	var balloons;
	var GameInfo = (function () {
	    function GameInfo() {
	    }
	    return GameInfo;
	}());
	GameInfo.isGameStart = false;
	GameInfo.MAX_PLAYERS = 3;
	var Tower = (function (_super) {
	    __extends(Tower, _super);
	    function Tower(x, y, ownerId) {
	        var _this = _super.call(this, game, x, y, 'brown-tower') || this;
	        _this.ownerId = ownerId;
	        _this.isSelected = false;
	        game.physics.enable(_this, Phaser.Physics.ARCADE);
	        _this.body.immovable = true;
	        _this.anchor.set(0.5);
	        _this.inputEnabled = true;
	        _this.events.onInputDown.add(Tower.onClickEvent, _this);
	        _this.renderText = game.add.text(_this.x, _this.y + _this.height * 2 / 3, "test", {
	            font: '14px Arial',
	            fontWeight: '100',
	            align: 'center'
	        });
	        _this.renderText.anchor.set(0.5);
	        game.add.existing(_this);
	        return _this;
	    }
	    Tower.changeOwner = function (tower, newOwnerId) {
	        tower.ownerId = newOwnerId;
	    };
	    Tower.onOverlapWithBullet = function (tower, bullet) {
	        console.log(tower.ownerId);
	    };
	    Tower.onClickEvent = function (towerClicked) {
	        if (towerClicked.ownerId === GameInfo.playerId) {
	            towerClicked.isSelected = !towerClicked.isSelected;
	        }
	        else {
	            for (var i = 0; i < towers.children.length; i++) {
	                var tower = towers.getChildAt(i);
	                if (tower.ownerId === GameInfo.playerId && tower.isSelected) {
	                    tower.fire(towerClicked);
	                }
	            }
	        }
	    };
	    Tower.prototype.fire = function (targetTower) {
	        this.isSelected = false;
	        var balloon = balloons.getFirstDead();
	        if (!balloon) {
	            balloon = new Balloon();
	            balloons.add(balloon);
	        }
	        balloon.position = this.position;
	        balloon.revive();
	        console.log('tower' + this.ownerId + " fire to " + targetTower.ownerId);
	    };
	    Tower.prototype.updateRenderText = function () {
	        this.renderText.setText("ownerId:" + this.ownerId + "\n" +
	            "isSelected:" + this.isSelected + "\n" +
	            "soldiers:" + this.soldiers);
	    };
	    return Tower;
	}(Phaser.Sprite));
	var Balloon = (function (_super) {
	    __extends(Balloon, _super);
	    function Balloon() {
	        var _this = _super.call(this, game, 0, 0, 'ball') || this;
	        game.physics.enable(_this, Phaser.Physics.ARCADE);
	        _this.anchor.set(0.5);
	        game.add.existing(_this);
	        _this.kill();
	        return _this;
	    }
	    return Balloon;
	}(Phaser.Sprite));
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
	    towers = game.add.group();
	    towers.add(new Tower(game.world.width * 0.2, game.world.height * 0.3, 1));
	    towers.add(new Tower(game.world.width * 0.8, game.world.height * 0.7, 2));
	    balloons = game.add.group();
	    socket.emit('readyToStartGame', GameInfo.roomName, GameInfo.playerId);
	}
	function update() {
	    if (!GameInfo.isGameStart)
	        return;
	    towers.forEach(function (tower) {
	        tower.updateRenderText();
	    }, null);
	    game.physics.arcade.overlap(towers, balloons, Tower.onOverlapWithBullet);
	}
	function render() {
	    game.debug.text('you are player:' + GameInfo.playerId, 16, 24);
	    game.debug.text(renderText, 16, 48);
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


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var game;
	var socket;
	var renderText = "init";
	var towers;
	var balloons;
	var GameInfo = (function () {
	    function GameInfo() {
	    }
	    return GameInfo;
	}());
	GameInfo.isGameStart = false;
	GameInfo.MAX_PLAYERS = 3;
	var Tower = (function (_super) {
	    __extends(Tower, _super);
	    function Tower(x, y, ownerId) {
	        var _this = _super.call(this, game, x, y, 'brown-tower') || this;
	        _this.ownerId = ownerId;
	        _this.isSelected = false;
	        game.physics.enable(_this, Phaser.Physics.ARCADE);
	        _this.body.immovable = true;
	        _this.anchor.set(0.5);
	        _this.inputEnabled = true;
	        _this.events.onInputDown.add(Tower.onClickEvent, _this);
	        game.add.existing(_this);
	        _this.circleGraphic = game.add.graphics(_this.x, _this.y);
	        _this.updateCirCleGraphic();
	        _this.createText();
	        return _this;
	    }
	    Tower.isNoneOfMyTowersSelected = function () {
	        for (var i = 0; i < towers.length; i++) {
	            var tower = towers.getChildAt(i);
	            if (tower.ownerId === GameInfo.playerId && tower.isSelected) {
	                return false;
	            }
	        }
	        return true;
	    };
	    Tower.isAllOfMyTowersSelected = function () {
	        for (var i = 0; i < towers.length; i++) {
	            var tower = towers.getChildAt(i);
	            if (tower.ownerId === GameInfo.playerId && !tower.isSelected) {
	                return false;
	            }
	        }
	        return true;
	    };
	    Tower.toggleSelectAllTowers = function () {
	        var isAllMyTowersSelected = Tower.isAllOfMyTowersSelected();
	        for (var i = 0; i < towers.length; i++) {
	            var tower = towers.getChildAt(i);
	            if (tower.ownerId === GameInfo.playerId) {
	                if (isAllMyTowersSelected) {
	                    tower.setSelected(false);
	                }
	                else {
	                    tower.setSelected(true);
	                }
	            }
	        }
	    };
	    Tower.changeOwner = function (tower, newOwnerId) {
	        tower.ownerId = newOwnerId;
	    };
	    Tower.onClickEvent = function (towerClicked) {
	        if (towerClicked.ownerId === GameInfo.playerId) {
	            if (Tower.isNoneOfMyTowersSelected() && !towerClicked.isSelected) {
	                towerClicked.setSelected(true);
	                return;
	            }
	            towerClicked.setSelected(false);
	        }
	        for (var i = 0; i < towers.children.length; i++) {
	            var tower = towers.getChildAt(i);
	            if (tower.ownerId === GameInfo.playerId && tower.isSelected) {
	                if (parseInt(tower.soldierNumText.text) >= 1) {
	                    tower.fire(towerClicked, game.input.keyboard.isDown(Phaser.Keyboard.CONTROL));
	                }
	                tower.setSelected(false);
	            }
	        }
	    };
	    Tower.prototype.getAndUpdateFiredSoildersNum = function (isFireAll) {
	        var totalSoilders = parseInt(this.soldierNumText.text);
	        var soildersBeSent = 0;
	        if (isFireAll) {
	            soildersBeSent = parseInt(this.soldierNumText.text);
	            this.soldierNumText.text = '0';
	        }
	        else {
	            soildersBeSent = Math.floor(totalSoilders / 2) + 1;
	            this.soldierNumText.text = (totalSoilders - soildersBeSent) + "";
	        }
	        return soildersBeSent;
	    };
	    Tower.prototype.setSelected = function (wantSelect) {
	        if (wantSelect) {
	            this.isSelected = true;
	            this.circleGraphic.visible = true;
	        }
	        else {
	            this.isSelected = false;
	            this.circleGraphic.visible = false;
	        }
	    };
	    Tower.prototype.updateCirCleGraphic = function () {
	        this.circleGraphic.clear();
	        this.circleGraphic.lineStyle(5, parseInt("0x" + this.getColorByOwnerId().split('#')[1]), 0.4);
	        this.circleGraphic.drawCircle(0, 0, this.height * 1.3);
	        this.circleGraphic.endFill();
	        this.circleGraphic.visible = false;
	    };
	    Tower.prototype.createText = function () {
	        this.soldierNumText = game.add.text(0, 0, "10", {
	            font: 'bold 20px Arial',
	            fill: 'white'
	        });
	        this.soldierNumText.setShadow(3, 3, 'rgba(0,0,0,0.2)', 2);
	        this.soldierNumText.anchor.set(0.5);
	        this.soldierNumText.alignTo(this, Phaser.TOP_RIGHT, 33, 0);
	        this.player1TextBubbleImg = game.add.image(this.soldierNumText.x, this.soldierNumText.y, 'player1-text-bubble');
	        this.player1TextBubbleImg.anchor.set(0.5);
	        this.player2TextBubbleImg = game.add.image(this.soldierNumText.x, this.soldierNumText.y, 'player2-text-bubble');
	        this.player2TextBubbleImg.anchor.set(0.5);
	        this.soldierNumText.moveUp();
	        this.soldierNumText.moveUp();
	        if (this.ownerId === 1) {
	            this.player2TextBubbleImg.visible = false;
	        }
	        else {
	            this.player1TextBubbleImg.visible = false;
	        }
	        game.time.events.loop(1500, this.updateRenderTextContent, this);
	    };
	    Tower.prototype.fire = function (targetTower, isFireAll) {
	        var balloon = Balloon.getAReadyBalloon(this, this.getAndUpdateFiredSoildersNum(isFireAll));
	        var moveDuration = game.physics.arcade.distanceBetween(this, targetTower) * 10;
	        var moveTween = game.add.tween(balloon).to({
	            x: targetTower.x,
	            y: targetTower.y
	        }, moveDuration, null, true);
	        moveTween.onComplete.add(Balloon.onArriveEvent, this, 1, targetTower);
	    };
	    Tower.prototype.switchOwner = function (newOwnerId) {
	        this.ownerId = newOwnerId;
	        this.updateRenderTextStyle();
	        this.updateCirCleGraphic();
	    };
	    Tower.prototype.updateRenderTextContent = function () {
	        var newSoldiersNum = parseInt(this.soldierNumText.text) + 1;
	        this.soldierNumText.setText(newSoldiersNum + "");
	    };
	    Tower.prototype.updateRenderTextStyle = function () {
	        if (this.ownerId === 1) {
	            this.player2TextBubbleImg.visible = false;
	            this.player1TextBubbleImg.visible = true;
	        }
	        else {
	            this.player2TextBubbleImg.visible = false;
	            this.player1TextBubbleImg.visible = true;
	        }
	    };
	    Tower.prototype.getColorByOwnerId = function () {
	        switch (this.ownerId) {
	            case 0:
	                return Tower.EMPTY_COLOR;
	            case 1:
	                return Tower.PLAYER1_COLOR;
	            case 2:
	                return Tower.PLAYER2_COLOR;
	        }
	    };
	    return Tower;
	}(Phaser.Sprite));
	Tower.PLAYER1_COLOR = "#169ccc";
	Tower.PLAYER2_COLOR = "#ffb829";
	Tower.EMPTY_COLOR = "#adadad";
	var Balloon = (function (_super) {
	    __extends(Balloon, _super);
	    function Balloon() {
	        var _this = _super.call(this, game, 0, 0, 'balloons') || this;
	        _this.scale.set(0.6);
	        _this.anchor.set(0.5);
	        game.add.existing(_this);
	        _this.kill();
	        _this.soldierNumText = game.add.text(0, 0, "0", {
	            font: 'bold 20px Arial',
	            fill: 'white'
	        });
	        _this.soldierNumText.setShadow(3, 3, 'rgba(0,0,0,0.2)', 2);
	        _this.soldierNumText.anchor.set(0.5, 0.7);
	        _this.soldierNumText.position = _this.position;
	        return _this;
	    }
	    Balloon.prototype.hide = function () {
	    };
	    Balloon.onArriveEvent = function (balloon, tween, targetTower) {
	        var targetSoldiersNum = parseInt(targetTower.soldierNumText.text);
	        if (balloon.getOwnerId() === targetTower.ownerId) {
	            targetSoldiersNum += parseInt(balloon.soldierNumText.text);
	        }
	        else {
	            targetSoldiersNum -= parseInt(balloon.soldierNumText.text);
	            if (targetSoldiersNum < 0) {
	                targetTower.switchOwner(balloon.getOwnerId());
	                targetSoldiersNum *= -1;
	            }
	        }
	        targetTower.soldierNumText.setText(targetSoldiersNum + "");
	        balloon.kill();
	        balloon.soldierNumText.kill();
	    };
	    Balloon.getAReadyBalloon = function (tower, soildersBeSent) {
	        var balloon = balloons.getFirstDead();
	        if (!balloon) {
	            balloon = new Balloon();
	            balloons.add(balloon);
	        }
	        if (tower.ownerId === 1) {
	            balloon.frame = Balloon.PLAYER1_BALLOON_FRAME_INDEX;
	        }
	        else {
	            balloon.frame = Balloon.PLAYER2_BALLOON_FRAME_INDEX;
	        }
	        balloon.revive();
	        balloon.soldierNumText.revive();
	        balloon.soldierNumText.setText(soildersBeSent + "");
	        balloon.x = tower.x;
	        balloon.y = tower.y;
	        return balloon;
	    };
	    Balloon.prototype.getOwnerId = function () {
	        if (this.frame === Balloon.PLAYER1_BALLOON_FRAME_INDEX) {
	            return 1;
	        }
	        else {
	            return 2;
	        }
	    };
	    return Balloon;
	}(Phaser.Sprite));
	Balloon.PLAYER1_BALLOON_FRAME_INDEX = 0;
	Balloon.PLAYER2_BALLOON_FRAME_INDEX = 1;
	function preload() {
	    bindSocketEvent();
	    game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
	    game.scale.pageAlignHorizontally = true;
	    game.scale.pageAlignVertically = true;
	    game.stage.backgroundColor = '#eee';
	    game.stage.disableVisibilityChange = true;
	    game.load.image('ball', 'img/player2-balloon.png');
	    game.load.image('brown-tower', 'img/brown-tower.png');
	    game.load.image('player1-text-bubble', 'img/player1-text-bubble.png');
	    game.load.image('player2-text-bubble', 'img/player2-text-bubble.png');
	    game.load.spritesheet('balloons', 'img/balloon-sprite-sheet-60*180.png', 60, 90, 2);
	    game.load.spritesheet('button', 'img/button.png', 120, 40);
	}
	function create() {
	    game.physics.startSystem(Phaser.Physics.ARCADE);
	    var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	    spaceKey.onDown.add(Tower.toggleSelectAllTowers, this);
	    towers = game.add.group();
	    towers.add(new Tower(game.world.width * 0.2, game.world.height * 0.3, 1));
	    towers.add(new Tower(game.world.width * 0.2, game.world.height * 0.9, 1));
	    towers.add(new Tower(game.world.width * 0.5, game.world.height * 0.6, 1));
	    towers.add(new Tower(game.world.width * 0.8, game.world.height * 0.9, 2));
	    towers.add(new Tower(game.world.width * 0.8, game.world.height * 0.3, 2));
	    balloons = game.add.group();
	    for (var i = 0; i < 40; i++) {
	        balloons.add(new Balloon());
	    }
	}
	function update() {
	}
	function render() {
	    game.debug.text('you are player:' + GameInfo.playerId, 16, 24);
	    game.debug.text(renderText, 16, 48);
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
	    while (document.body.firstChild) {
	        document.body.removeChild(document.body.firstChild);
	    }
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