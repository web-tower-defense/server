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
    Tower.onOverlapWithBalloon = function (tower, bullet) {
        console.log("hello" + tower.ownerId);
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
        balloon.revive();
        balloon.x = this.x;
        balloon.y = this.y;
        var moveDuration = game.physics.arcade.distanceBetween(this, targetTower) * 10;
        var moveTween = game.add.tween(balloon).to({
            x: targetTower.x,
            y: targetTower.y
        }, moveDuration, null, true);
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
    towers.add(new Tower(game.world.width * 0.8, game.world.height * 0.5, 2));
    towers.add(new Tower(game.world.width * 0.8, game.world.height * 0.3, 2));
    balloons = game.add.group();
}
function update() {
    towers.forEach(function (tower) {
        tower.updateRenderText();
    }, null);
    game.physics.arcade.overlap(towers, balloons, Tower.onOverlapWithBalloon);
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
    console.log('ai mode');
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
