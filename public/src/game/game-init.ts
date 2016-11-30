var game:Phaser.Game;
var socket: SocketIOClient.Socket;
var renderText = "init";
var towers:Tower[][] = [];
var tower1:Tower;
var tower2:Tower;
var weapon:Phaser.Weapon;
class GameInfo{
  public static isGameStart:boolean = false;
  public static playerId:number
  public static roomName:string
}
// class Weapon extends Phaser.Weapon{
//   constructor(){
//     super(game, game.plugins);
//   }
// }
class Tower extends Phaser.Sprite{
  public level: number;
  public ownerId: number;
  public soldiers: number;
  public maxSoldiers: number;
  private isSelected: boolean = false;
  constructor(x:number, y:number){
    super(game,x,y,'brown-tower');
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.immovable = true;
    this.anchor.set(0.5);
    this.inputEnabled = true;
    this.events.onInputDown.add(()=>{
      if(this.ownerId===GameInfo.playerId){
        this.isSelected = !this.isSelected;
      }else{
        weapon.fireAngle = game.physics.arcade.angleBetween(tower1, tower2);
        weapon.fire();
      }
      console.log('select tower: '+this.isSelected);
    });
    game.add.existing(this);

  }


}


function preload() {
  //init socket
  bindSocketEvent();
  //game props
  game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = '#efe';
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
  //---------------------------------------------
  //put entity and enable its physics
  //tower
  tower1 = new Tower(game.world.width*0.1, game.world.height*0.5);
  tower1.ownerId = 1;

  tower2 = new Tower(game.world.width*0.9, game.world.height*0.5);
  tower2.ownerId = 2;
  //--------------------------------------
  //weapon
  weapon = game.add.weapon(30, 'ball');
  weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
  weapon.bulletSpeed = 100;
  weapon.fireRate = 100;
  weapon.trackSprite(tower1, 0, 0, false);
  //add tower so it can be render at the top
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
