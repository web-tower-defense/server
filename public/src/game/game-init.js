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
var Soldier = (function (_super) {
    __extends(Soldier, _super);
    function Soldier(x, y) {
        var _this = _super.call(this, game, x, y, 'ball') || this;
        game.physics.enable(_this, Phaser.Physics.ARCADE);
        _this.anchor.set(0.5);
        return _this;
    }
    return Soldier;
}(Phaser.Sprite));
var Tower = (function (_super) {
    __extends(Tower, _super);
    function Tower(x, y) {
        var _this = _super.call(this, game, x, y, 'brown-tower') || this;
        game.physics.enable(_this, Phaser.Physics.ARCADE);
        _this.body.immovable = true;
        _this.anchor.set(0.5);
        return _this;
    }
    return Tower;
}(Phaser.Sprite));
var tower1;
var tower2;
var soldiers;
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
    game.input.onTap.add(function () {
        renderText += "1";
    });
    game.physics.startSystem(Phaser.Physics.ARCADE);
    tower1 = new Tower(game.world.width * 0.1, game.world.height * 0.5);
    soldiers = game.add.group();
    for (var i = 0; i < 10; i++) {
        soldiers.add(new Soldier(tower1.x, tower1.y));
    }
    game.add.existing(tower1);
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
