var game:Phaser.Game;
var socket: SocketIOClient.Socket;
class GameInfo{
  public static isGameStart:boolean = false;
  public static playerId:number
  public static roomName:string
}
class Soldier extends Phaser.Sprite{

}
class Tower{
  constructor(
    public playerId:number,
    public roomName:string
  ){}
}

//Entities;
var ball:Phaser.Sprite;


function preload() {
  //game props
  game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = '#eee';
  game.stage.disableVisibilityChange= true;
  //images
  game.load.image('ball', 'img/ball.png')
  game.load.image('brown-tower', 'img/brown-tower.png');
  //sprite sheet
  game.load.spritesheet('button', 'img/button.png', 120, 40);
}
function create() {
  // init physics engine
  game.physics.startSystem(Phaser.Physics.ARCADE);
  //put entity and enable its physics
  ball = game.add.sprite(50, 50, 'ball');
  game.physics.enable(ball, Phaser.Physics.ARCADE);

  //set ready btn
  let startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', ready, this, 1, 0, 2);
  function ready () {
    socket.emit('readyToStartGame', GameInfo.roomName, GameInfo.playerId);
    startButton.destroy();
  }
  startButton.anchor.set(0.5);

  //really start game function
  socket.on('startGame', ()=>{
    GameInfo.isGameStart = true;
    ball.body.velocity.set(150, 150);
  });
}
function update() {
  if(!GameInfo.isGameStart)return;
}


export default function gameInit(playerId: number, soc: SocketIOClient.Socket, roomName:string) {
  socket = soc;
  GameInfo.playerId = playerId;
  GameInfo.roomName = roomName;
  game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
    preload: preload,
    create: create,
    update: update
  });
}
