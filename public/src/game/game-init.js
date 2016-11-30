"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var game;
var socket;
var renderText = "init";
var towers = [];
var tower1;
var tower2;
var weapon;
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
                weapon.fireAngle = game.physics.arcade.angleBetween(tower1, tower2);
                weapon.fire();
            }
            console.log('select tower: ' + _this.isSelected);
        });
        game.add.existing(_this);
        return _this;
    }
    return Tower;
}(Phaser.Sprite));
function preload() {
    bindSocketEvent();
    game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = '#efe';
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
    weapon = game.add.weapon(30, 'ball');
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    weapon.bulletSpeed = 100;
    weapon.fireRate = 100;
    weapon.trackSprite(tower1, 0, 0, false);
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
