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
    Tower.changeOwner = function (tower, newOwnerId) {
        tower.ownerId = newOwnerId;
    };
    Tower.onClickEvent = function (towerClicked) {
        if (towerClicked.isSelected) {
            towerClicked.isSelected = false;
            towerClicked.circleGraphic.visible = false;
            return;
        }
        var selectAnyTowersBefore = false;
        for (var i = 0; i < towers.children.length; i++) {
            var tower = towers.getChildAt(i);
            if (tower.ownerId === GameInfo.playerId && tower.isSelected) {
                tower.fire(towerClicked);
                selectAnyTowersBefore = true;
                tower.isSelected = false;
                tower.circleGraphic.visible = false;
            }
        }
        if (!selectAnyTowersBefore && towerClicked.ownerId === GameInfo.playerId) {
            towerClicked.isSelected = true;
            towerClicked.circleGraphic.visible = true;
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
        this.isSelected = false;
        this.circleGraphic.visible = false;
        var balloon = balloons.getFirstDead();
        if (!balloon) {
            balloon = new Balloon();
            balloons.add(balloon);
        }
        if (this.ownerId === 1) {
            balloon.frame = Balloon.PLAYER1_BALLOON_FRAME_INDEX;
        }
        else {
            balloon.frame = Balloon.PLAYER2_BALLOON_FRAME_INDEX;
        }
        balloon.revive();
        balloon.soldierNumText.revive();
        if (isFireAll) {
            balloon.setText(this.soldierNumText.text + "");
            this.soldierNumText.text = '0';
        }
        else {
            var soldierNum = parseInt(this.soldierNumText.text);
            var fireSoldierNum = Math.floor(soldierNum / 2);
            balloon.setText(fireSoldierNum + "");
            this.soldierNumText.text = (soldierNum - fireSoldierNum) + "";
        }
        balloon.x = this.x;
        balloon.y = this.y;
        var moveDuration = game.physics.arcade.distanceBetween(this, targetTower) * 10;
        var moveTween = game.add.tween(balloon).to({
            x: targetTower.x,
            y: targetTower.y
        }, moveDuration, null, true);
        moveTween.onComplete.add(function (balloon, tween, targetTower) {
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
        }, this, 1, targetTower);
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
    Balloon.prototype.getOwnerId = function () {
        if (this.frame === Balloon.PLAYER1_BALLOON_FRAME_INDEX) {
            return 1;
        }
        else {
            return 2;
        }
    };
    Balloon.prototype.setText = function (soldiersNum) {
        this.soldierNumText.setText(soldiersNum);
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
    towers = game.add.group();
    towers.add(new Tower(game.world.width * 0.2, game.world.height * 0.3, 1));
    towers.add(new Tower(game.world.width * 0.2, game.world.height * 0.9, 1));
    towers.add(new Tower(game.world.width * 0.5, game.world.height * 0.6, 1));
    towers.add(new Tower(game.world.width * 0.8, game.world.height * 0.9, 2));
    towers.add(new Tower(game.world.width * 0.8, game.world.height * 0.3, 2));
    balloons = game.add.group();
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
