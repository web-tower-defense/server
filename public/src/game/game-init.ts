var game:Phaser.Game;
var socket: SocketIOClient.Socket;
class GameInfo{
  public static isGameStart:boolean = false;
  public static playerId:number
  public static roomName:string
}
class Soldier extends Phaser.Sprite{
  constructor(x:number, y:number){
    super(game,x,y,'ball');
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
  }
}
class Tower extends Phaser.Sprite{
  public level: number;
  public ownerId: number;
  public soldiers: number;
  public maxSoldiers: number;
  constructor(x:number, y:number){
    super(game,x,y,'brown-tower');
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.immovable = true;
    this.anchor.set(0.5);
  }

}

//Entities;
// var ball:Phaser.Sprite;
// var paddle1,paddle2:Phaser.Sprite;
// var towers:Tower[] = [];
var tower1:Phaser.Sprite;
var tower2:Phaser.Sprite;
var soldiers:Phaser.Group;
function preload() {
  //init socket
  bindSocketEvent();
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
  game.input.onTap.add(()=>{
    renderText += "1";
  })
  game.physics.startSystem(Phaser.Physics.ARCADE);
  //---------------------------------------------
  //put entity and enable its physics
  //tower
  tower1 = new Tower(game.world.width*0.1, game.world.height*0.5);
  //soldiers
  soldiers = game.add.group();
  for(let i=0; i<10; i++){
    soldiers.add(new Soldier(tower1.x, tower1.y));
  }
  //--------------------------------------
  //add tower so it can be render at the top
  game.add.existing(tower1);
  // tower1.visible = false;
  //set ready btn
  let startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', ready, this, 1, 0, 2);
  function ready () {
    socket.emit('readyToStartGame', GameInfo.roomName, GameInfo.playerId);
    startButton.destroy();
    renderText = "you are ready, now waiting the other";
  }
  startButton.anchor.set(0.5);


}
function update() {
  if(!GameInfo.isGameStart)return;
  // socket.emit('updateMouseY', GameInfo.roomName, GameInfo.playerId, game.input.y);
}
var renderText:string = "debug text";
function render () {
  game.debug.text(renderText, 16,24);
}
function bindSocketEvent () {
  socket.on('startGame', ()=>{
    GameInfo.isGameStart = true;
    renderText = "game start";
  });
  //register socket event
  socket.on('updateMouseY', (playerId, inputY)=>{
    console.log('test2');
    if(playerId===1){

    }else{

    }
	})
}
export default function gameInit(playerId: number, soc: SocketIOClient.Socket, roomName:string) {
  socket = soc;
  GameInfo.playerId = playerId;
  GameInfo.roomName = roomName;
  game = new Phaser.Game(480, 320, Phaser.AUTO, null, {
    preload: preload,
    create: create,
    update: update,
    render:render
  });
}
