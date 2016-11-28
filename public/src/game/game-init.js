"use strict";
var game;
var socket;
var gameInfo;
var GameInfo = (function () {
    function GameInfo(playerId, roomName) {
        this.playerId = playerId;
        this.roomName = roomName;
        this.ready = false;
    }
    return GameInfo;
}());
var Soldier = (function () {
    function Soldier() {
    }
    return Soldier;
}());
var Tower = (function () {
    function Tower(playerId, roomName) {
        this.playerId = playerId;
        this.roomName = roomName;
    }
    return Tower;
}());
function preload() {
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = '#eee';
    game.load.image('ball', 'img/ball.png');
    game.load.image('brown-tower', 'img/brown-tower.png');
}
function finishPreload() {
    function create() {
    }
}
function update() {
    if (!gameInfo.ready)
        return;
}
function gameInit(playerId, soc, roomName) {
    socket = soc;
    gameInfo = new GameInfo(playerId, roomName);
    game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
        preload: preload,
        create: finishPreload,
        update: update
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = gameInit;
