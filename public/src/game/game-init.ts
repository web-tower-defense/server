var game:Phaser.Game;
var socket: SocketIOClient.Socket;
var gameInfo:GameInfo;
class GameInfo{
  public ready:boolean = false;
  constructor(
    public playerId:number,
    public roomName:string
  ){}
}
class Soldier{

}
class Tower{
  constructor(
    public playerId:number,
    public roomName:string
  ){}

}

function preload() {
  //game props
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = '#eee';
  //images
  game.load.image('ball', 'img/ball.png')
  game.load.image('brown-tower', 'img/brown-tower.png');
}
function finishPreload() {
  function create() {

  }

}
function update() {
  if(!gameInfo.ready)return;
}


export default function gameInit(playerId: number, soc: SocketIOClient.Socket, roomName:string) {
  socket = soc;
  gameInfo = new GameInfo(playerId, roomName);
  game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
    preload: preload,
    create: finishPreload,
    update: update
  });
}
