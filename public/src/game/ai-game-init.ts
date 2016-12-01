var game: Phaser.Game;
var socket: SocketIOClient.Socket;
var renderText = "init";
var towers: Phaser.Group;
var balloons: Phaser.Group;
class GameInfo {
  public static isGameStart: boolean = false;
  public static playerId: number
  public static roomName: string
  public static MAX_PLAYERS: number = 3;
}
// class Weapon extends Phaser.Weapon{
//   constructor(){
//     super(game, game.plugins);
//   }
// }
class Tower extends Phaser.Sprite {
  public level: number;
  public soldiers: number;
  public maxSoldiers: number;
  private isSelected: boolean = false;
  private renderText:Phaser.Text;

  public constructor(x: number, y: number, public ownerId: number) {
    super(game, x, y, 'brown-tower');
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.immovable = true;
    this.anchor.set(0.5);
    this.inputEnabled = true;
    this.events.onInputDown.add(Tower.onClickEvent, this);
    this.renderText = game.add.text(this.x, this.y+this.height*2/3, "test", {
      font: '14px Arial',
      fontWeight: '100',
      align:'center'

    });
    this.renderText.anchor.set(0.5);
    game.add.existing(this);
  }
  public static changeOwner(tower: Tower, newOwnerId: number) {
    tower.ownerId = newOwnerId;
  }
  public static onOverlapWithBalloon(tower:Tower,bullet:Phaser.Bullet){
    console.log("hello"+tower.ownerId);
  }
  private static onClickEvent(towerClicked: Tower) {
    if (towerClicked.ownerId === GameInfo.playerId) {
      towerClicked.isSelected = !towerClicked.isSelected;
    } else {
      for(let i=0; i<towers.children.length; i++){
        let tower = towers.getChildAt(i) as Tower;
        if(tower.ownerId===GameInfo.playerId&&tower.isSelected){
          tower.fire(towerClicked);
        }
      }
    }
  }
  private fire(targetTower: Tower) {
    this.isSelected=false;

    let balloon = balloons.getFirstDead() as Balloon;
    if(!balloon){
      balloon = new Balloon();
      balloons.add(balloon);
    }
    balloon.revive();
    balloon.x = this.x;
    balloon.y = this.y;
    let moveDuration = game.physics.arcade.distanceBetween(this, targetTower)*10;//distance equals 100-300
    let moveTween = game.add.tween(balloon).to( {
      x: targetTower.x,
      y: targetTower.y
    }, moveDuration, null, true);

  }
  public updateRenderText(){
    this.renderText.setText(
      "ownerId:"+this.ownerId+"\n"+
      "isSelected:"+this.isSelected+"\n"+
      "soldiers:"+this.soldiers
    )
  }
}
class Balloon extends Phaser.Sprite{
  public soldiers:number;
  public ownerId:number;
  constructor(){
    super(game, 0,0,'ball');
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.anchor.set(0.5);
    game.add.existing(this);
    this.kill();
  }
}


function preload() {
  //init socket
  bindSocketEvent();
  //game props
  game.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true;
  game.stage.backgroundColor = '#eee';
  game.stage.disableVisibilityChange = true;
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
  towers = game.add.group();
  towers.add(new Tower(game.world.width * 0.2, game.world.height * 0.3, 1));
  towers.add(new Tower(game.world.width * 0.8, game.world.height * 0.5, 2));
  towers.add(new Tower(game.world.width * 0.8, game.world.height * 0.3, 2));
  //******
  balloons = game.add.group();
  //--------------------------------------

  //add tower so it can be render at the top
  // tower1.visible = false;
  //set ready btn
  // TODO: delte this after devmode
  //un comment this to there
  //          let startButton = game.add.button(game.world.width * 0.5, game.world.height * 0.5, 'button', ready, this, 1, 0, 2);
  //          function ready() {
  //            socket.emit('readyToStartGame', GameInfo.roomName, GameInfo.playerId);
  //            startButton.destroy();
  //            renderText = "you are ready, now waiting the other";
  //          }
  //          startButton.anchor.set(0.5);
  // there

}
function update() {
  towers.forEach((tower:Tower)=>{
    tower.updateRenderText();
  }, null)
  game.physics.arcade.overlap(towers, balloons, Tower.onOverlapWithBalloon);
  // socket.emit('updateMouseY', GameInfo.roomName, GameInfo.playerId, game.input.y);
}
function render() {
  game.debug.text('you are player:'+GameInfo.playerId, 16, 24);
  game.debug.text(renderText, 16, 48);

}
function bindSocketEvent() {
  socket.on('startGame', () => {
    GameInfo.isGameStart = true;
    renderText = "game start";
  });
  //register socket event
  socket.on('updateMouseY', (playerId, inputY) => {
    console.log('test2');
    if (playerId === 1) {

    } else {

    }
  })
}
export default function gameInit(playerId: number, soc: SocketIOClient.Socket, roomName: string) {
  console.log('ai mode');
  while(document.body.firstChild){
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
