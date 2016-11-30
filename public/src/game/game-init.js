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
var weapon;
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
        return _this;
    }
    Tower.changeOwner = function (tower, newOwnerId) {
        tower.ownerId = newOwnerId;
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
        weapon.trackSprite(this, 0, 0, false);
        this.isSelected = false;
        weapon.fireAngle = game.physics.arcade.angleBetween(this, targetTower);
        weapon.fire();
        console.log('tower' + this.ownerId + " fire to " + targetTower.ownerId);
    };
    return Tower;
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
    towers.classType = Tower;
    towers.add(new Tower(game.world.width * 0.1, game.world.height * 0.5, 1));
    towers.add(new Tower(game.world.width * 0.9, game.world.height * 0.5, 2));
    weapon = game.add.weapon(30, 'ball');
    weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    weapon.bulletSpeed = 100;
    weapon.fireRate = 100;
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
