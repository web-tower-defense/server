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
	            this.roomsDiv.firstChild.onclick = game_init_1.default.bind(null, 1, socket, 'play with ai', true);
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
	var AI = (function () {
	    function AI() {
	    }
	    AI.prototype.updateInfo = function () {
	        this.allSoldiers = 0;
	        for (var i = 0; i < towers.length; i++) {
	            var tower = towers.getChildAt(i);
	            if (tower.ownerId === 2) {
	                this.allSoldiers += parseInt(tower.soldierNumText.text);
	            }
	        }
	        this.analize();
	    };
	    AI.prototype.getMinTowerSoldierNumIdxArray = function () {
	        var minNum = 1000, idx = 0;
	        for (var i = 0; i < towers.length; i++) {
	            var tower = towers.getChildAt(i);
	            if (tower.ownerId !== 2) {
	                var currNum = parseInt(tower.soldierNumText.text);
	                if (minNum > currNum) {
	                    minNum = currNum;
	                    idx = i;
	                }
	            }
	        }
	        return [minNum, idx];
	    };
	    AI.prototype.analize = function () {
	        var numIdxArray = this.getMinTowerSoldierNumIdxArray();
	        if (this.allSoldiers > numIdxArray[0]) {
	            var targetTower = towers.getChildAt(numIdxArray[1]);
	            for (var i = 0; i < towers.length; i++) {
	                var tower = towers.getChildAt(i);
	                if (tower.ownerId === 2) {
	                    tower.fire(targetTower, tower.getSolidersBeSentAndUpdate(true));
	                }
	            }
	        }
	    };
	    return AI;
	}());
	var GameInfo = (function () {
	    function GameInfo() {
	    }
	    return GameInfo;
	}());
	GameInfo.isGameStart = false;
	GameInfo.MAX_PLAYERS = 3;
	var Tower = (function (_super) {
	    __extends(Tower, _super);
	    function Tower(x, y, ownerId, initSoldiers) {
	        var _this = _super.call(this, game, x, y, 'brown-tower') || this;
	        _this.ownerId = ownerId;
	        _this.isSelected = false;
	        game.physics.enable(_this, Phaser.Physics.ARCADE);
	        _this.body.immovable = true;
	        _this.anchor.set(0.5);
	        _this.inputEnabled = true;
	        _this.events.onInputDown.add(Tower.onClickEvent, _this, 2);
	        game.add.existing(_this);
	        _this.circleGraphic = game.add.graphics(_this.x, _this.y);
	        _this.updateCirCleGraphic();
	        _this.createTextAndTextBubble();
	        if (initSoldiers) {
	            _this.soldierNumText.text = initSoldiers + "";
	        }
	        return _this;
	    }
	    Tower.isGameOver = function () {
	        var winnerId;
	        for (var i = 0; i < towers.length; i++) {
	            var towerId = towers.getChildAt(i).ownerId;
	            if (towerId !== 0) {
	                winnerId = towerId;
	                break;
	            }
	        }
	        for (var i = 0; i < towers.length; i++) {
	            var towerId = towers.getChildAt(i).ownerId;
	            if (towerId !== winnerId && towerId !== 0) {
	                return false;
	            }
	        }
	        for (var i = 0; i < balloons.length; i++) {
	            var balloon = balloons.getChildAt(i);
	            if (balloon.alive && balloon.getOwnerId() !== winnerId) {
	                return false;
	            }
	        }
	        return true;
	    };
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
	    Tower.toggleSelectAllTowers = function (a, b, cancelAllSelect) {
	        var selectAll;
	        if (cancelAllSelect) {
	            selectAll = false;
	        }
	        else {
	            selectAll = !Tower.isAllOfMyTowersSelected();
	        }
	        for (var i = 0; i < towers.length; i++) {
	            var tower = towers.getChildAt(i);
	            if (tower.ownerId === GameInfo.playerId) {
	                tower.setSelected(selectAll);
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
	        var isFireAll = game.input.keyboard.isDown(Phaser.Keyboard.A);
	        for (var i = 0; i < towers.children.length; i++) {
	            var tower = towers.getChildAt(i);
	            if (tower.ownerId === GameInfo.playerId && tower.isSelected) {
	                if (parseInt(tower.soldierNumText.text) >= 1) {
	                    if (GameInfo.isSinglePlayer) {
	                        var soildersBeSent = tower.getSolidersBeSentAndUpdate(isFireAll);
	                        tower.fire(towerClicked, soildersBeSent);
	                    }
	                    socket.emit('fire', GameInfo.roomName, towers.getChildIndex(tower), isFireAll, towers.getChildIndex(towerClicked));
	                }
	                tower.setSelected(false);
	            }
	        }
	    };
	    Tower.prototype.getSolidersBeSentAndUpdate = function (isFireAll) {
	        var totalSoldiers = parseInt(this.soldierNumText.text);
	        var soldiersLeft = 0;
	        if (isFireAll) {
	            soldiersLeft = 0;
	        }
	        else {
	            soldiersLeft = Math.floor(totalSoldiers / 2);
	        }
	        this.soldierNumText.setText(soldiersLeft + "");
	        return totalSoldiers - soldiersLeft;
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
	        this.circleGraphic.lineStyle(5, parseInt("0x" + this.getColorByOwnerId().split('#')[1]), 1);
	        this.circleGraphic.drawCircle(0, 0, this.height * 1.5);
	        this.circleGraphic.endFill();
	        this.circleGraphic.visible = false;
	    };
	    Tower.prototype.createTextAndTextBubble = function () {
	        this.soldierNumText = game.add.text(0, 0, "0", {
	            font: 'bold 20px Arial',
	            fill: 'white'
	        });
	        this.soldierNumText.setShadow(3, 3, 'rgba(0,0,0,0.2)', 2);
	        this.soldierNumText.anchor.set(0.5);
	        this.soldierNumText.alignTo(this, Phaser.TOP_RIGHT, 33, 0);
	        this.textBubble = game.add.image(this.soldierNumText.x, this.soldierNumText.y, 'text-bubbles', this.ownerId);
	        this.textBubble.anchor.set(0.5);
	        this.soldierNumText.moveUp();
	        this.soldierNumText.moveUp();
	    };
	    Tower.prototype.fire = function (targetTower, soildersBeSent) {
	        var balloon = Balloon.getAReadyBalloon(this, soildersBeSent);
	        var moveDuration = game.physics.arcade.distanceBetween(this, targetTower) * 10;
	        var moveTween = game.add.tween(balloon).to({
	            x: targetTower.x,
	            y: targetTower.y
	        }, moveDuration, null, true);
	        moveTween.onComplete.add(Balloon.onArriveEvent, this, 1, targetTower);
	    };
	    Tower.prototype.switchOwner = function (newOwnerId) {
	        this.ownerId = newOwnerId;
	        this.updateTextBubble();
	        this.updateCirCleGraphic();
	    };
	    Tower.prototype.updateTextBubble = function () {
	        this.textBubble.frame = this.ownerId;
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
	    Balloon.onArriveEvent = function (balloon, tween, targetTower) {
	        balloon.kill();
	        balloon.soldierNumText.kill();
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
	            if (Tower.isGameOver()) {
	                setTimeout(function () {
	                    if (towers.getFirstAlive().ownerId === GameInfo.playerId) {
	                        alert('You won the game, congratulation!!');
	                    }
	                    else {
	                        alert('You lose the game, but it is a Good Game');
	                    }
	                    location.reload(true);
	                }, 1000);
	            }
	        }
	        targetTower.soldierNumText.setText(targetSoldiersNum + "");
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
	    if (game.device.desktop) {
	        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	        game.scale.pageAlignHorizontally = true;
	        game.scale.pageAlignVertically = true;
	    }
	    else {
	        game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
	    }
	    game.stage.backgroundColor = '#eee';
	    game.stage.disableVisibilityChange = true;
	    game.load.image('background', 'img/background-mountain.png');
	    game.load.image('ball', 'img/player2-balloon.png');
	    game.load.image('brown-tower', 'img/brown-tower.png');
	    game.load.spritesheet('button', 'img/button.png', 120, 40);
	    game.load.spritesheet('text-bubbles', 'img/text-bubble50*40*3.png', 50, 40, 3);
	    game.load.spritesheet('balloons', 'img/balloon-sprite-sheet-60*180.png', 60, 90, 2);
	    game.load.spritesheet('button', 'img/button.png', 120, 40);
	}
	function create() {
	    game.physics.startSystem(Phaser.Physics.ARCADE);
	    var background = game.add.image(0, 0, 'background');
	    background.height = game.height;
	    background.width = game.width;
	    background.inputEnabled = true;
	    background.events.onInputDown.add(Tower.toggleSelectAllTowers, null, 0, true);
	    var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	    spaceKey.onDown.add(Tower.toggleSelectAllTowers, this, 1);
	    towers = game.add.group();
	    towers.add(new Tower(game.world.width * 0.1, game.world.height * 0.5, 1, 0));
	    towers.add(new Tower(game.world.width * 0.3, game.world.height * 0.3, 0, 5));
	    towers.add(new Tower(game.world.width * 0.3, game.world.height * 0.7, 0, 10));
	    towers.add(new Tower(game.world.width * 0.5, game.world.height * 0.5, 0, 0));
	    towers.add(new Tower(game.world.width * 0.7, game.world.height * 0.7, 0, 5));
	    towers.add(new Tower(game.world.width * 0.7, game.world.height * 0.3, 0, 10));
	    towers.add(new Tower(game.world.width * 0.9, game.world.height * 0.5, 2, 0));
	    balloons = game.add.group();
	    for (var i = 0; i < 40; i++) {
	        balloons.add(new Balloon());
	    }
	    function updateAi(ai) {
	        ai.updateInfo();
	        setTimeout(updateAi, 4000);
	    }
	    function updateTowers() {
	        towers.forEach(function (tower) {
	            if (tower.ownerId !== 0) {
	                var totalSoldiers = parseInt(tower.soldierNumText.text);
	                totalSoldiers += 1;
	                tower.soldierNumText.setText("" + totalSoldiers);
	            }
	        }, this);
	        setTimeout(updateTowers, 1500);
	    }
	    if (GameInfo.isSinglePlayer) {
	        var ai_1 = new AI();
	        var startButton_1 = game.add.button(game.world.width * 0.5, game.world.height * 0.6, 'button', function () {
	            startButton_1.destroy();
	            updateTowers();
	            updateAi(ai_1);
	        }, this, 1, 0, 2);
	        startButton_1.anchor.set(0.5);
	    }
	    else {
	        socket.emit('readyToStartGame', GameInfo.roomName, GameInfo.playerId);
	    }
	    game.add.text(16, game.world.height - 40, "Use Mouse, A, Space to send balloon and take other's castle", {});
	}
	function update() {
	}
	function render() {
	    if (GameInfo.playerId === 1) {
	        game.debug.text('you are player1, blue team', 16, 24);
	    }
	    else {
	        game.debug.text('you are player2, orange team', 16, 24);
	    }
	    game.debug.text(renderText, 16, 48);
	    var name = (game.input.activePointer.targetObject) ? game.input.activePointer.targetObject.sprite.key : 'none';
	    game.debug.text("Pointer Target: " + name, 16, 64);
	}
	function bindSocketEvent() {
	    var _this = this;
	    socket.on('startGame', function () {
	        GameInfo.isGameStart = true;
	        renderText = "game start";
	    });
	    socket.on('fire', function (roomName, towerIdx, isFireAll, targetTowerIdx) {
	        var tower = towers.getChildAt(towerIdx);
	        var targetTower = towers.getChildAt(targetTowerIdx);
	        var soildersBeSent = tower.getSolidersBeSentAndUpdate(isFireAll);
	        tower.fire(targetTower, soildersBeSent);
	    });
	    socket.on('updateTowers', function () {
	        towers.forEach(function (tower) {
	            if (tower.ownerId !== 0) {
	                var totalSoldiers = parseInt(tower.soldierNumText.text);
	                totalSoldiers += 1;
	                tower.soldierNumText.setText("" + totalSoldiers);
	            }
	        }, _this);
	    });
	    socket.on('roommateDisconnect', function (roomName) {
	        if (Tower.isGameOver())
	            return;
	        socket.emit('leaveRoom', roomName);
	        alert('the other player lost connection');
	        location.reload();
	    });
	}
	function gameInit(playerId, soc, roomName, isSinglePlayer) {
	    while (document.body.firstChild) {
	        document.body.removeChild(document.body.firstChild);
	    }
	    socket = soc;
	    GameInfo.playerId = playerId;
	    GameInfo.roomName = roomName;
	    GameInfo.isSinglePlayer = isSinglePlayer;
	    game = new Phaser.Game(1300, 600, Phaser.AUTO, null, {
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