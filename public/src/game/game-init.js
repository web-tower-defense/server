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
    function Soldier() {
        return _super.apply(this, arguments) || this;
    }
    return Soldier;
}(Phaser.Sprite));
var Tower = (function () {
    function Tower(playerId, roomName) {
        this.playerId = playerId;
        this.roomName = roomName;
    }
    return Tower;
}());
var ball;
function preload() {
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
    ball = game.add.sprite(50, 50, 'ball');
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    var startButton = game.add.button(game.world.width * 0.5, game.world.height * 0.5, 'button', ready, this, 1, 0, 2);
    function ready() {
        socket.emit('readyToStartGame', GameInfo.roomName, GameInfo.playerId);
        startButton.destroy();
    }
    startButton.anchor.set(0.5);
    socket.on('startGame', function () {
        GameInfo.isGameStart = true;
        ball.body.velocity.set(150, 150);
    });
}
function update() {
    if (!GameInfo.isGameStart)
        return;
}
function gameInit(playerId, soc, roomName) {
    socket = soc;
    GameInfo.playerId = playerId;
    GameInfo.roomName = roomName;
    game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
        preload: preload,
        create: create,
        update: update
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = gameInit;
