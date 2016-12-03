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
  public static PLAYER1_COLOR: string = "#169ccc";
  public static PLAYER2_COLOR: string = "#ffb829";
  public static EMPTY_COLOR: string = "#adadad";
  public level: number;
  public maxSoldiers: number;
  private isSelected: boolean = false;
  public soldierNumText: Phaser.Text;
  private circleGraphic: Phaser.Graphics;
  private player1TextBubbleImg: Phaser.Image;
  private player2TextBubbleImg: Phaser.Image;

  public constructor(x: number, y: number, public ownerId: number) {

    super(game, x, y, 'brown-tower');
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.immovable = true;
    this.anchor.set(0.5);
    this.inputEnabled = true;
    this.events.onInputDown.add(Tower.onClickEvent, this);
    game.add.existing(this);


    this.circleGraphic = game.add.graphics(this.x, this.y);
    this.updateCirCleGraphic();

    this.createText();
  }
  public static isNoneOfMyTowersSelected(): boolean{
    for (let i = 0; i < towers.length; i++) {
      let tower = (towers.getChildAt(i) as Tower);
      if (tower.ownerId === GameInfo.playerId && tower.isSelected) {
         return false;
      }
    }
    return true;
  }
  public static isAllOfMyTowersSelected() : boolean{
    for (let i = 0; i < towers.length; i++) {
      let tower = (towers.getChildAt(i) as Tower);
      if (tower.ownerId === GameInfo.playerId && !tower.isSelected) {
         return false;
      }
    }
    return true;
  }
  public static toggleSelectAllTowers() {
    let isAllMyTowersSelected = Tower.isAllOfMyTowersSelected();

    for (let i = 0; i < towers.length; i++) {
      let tower = (towers.getChildAt(i) as Tower);
      if (tower.ownerId === GameInfo.playerId) {
        if(isAllMyTowersSelected){
          tower.setSelected(false);
        }else{
          tower.setSelected(true);
        }
      }
    }
  }
  public static changeOwner(tower: Tower, newOwnerId: number) {
    tower.ownerId = newOwnerId;
  }
  private static onClickEvent(towerClicked: Tower) {

    if(towerClicked.ownerId===GameInfo.playerId){
      if(Tower.isNoneOfMyTowersSelected()&&!towerClicked.isSelected){
        towerClicked.setSelected(true);
        return;
      }
      towerClicked.setSelected(false);
    }
    //fire all my selected towers

    for (let i = 0; i < towers.children.length; i++) {
      let tower = towers.getChildAt(i) as Tower;
      if (tower.ownerId === GameInfo.playerId && tower.isSelected) {
        if(parseInt(tower.soldierNumText.text)>=1){
          tower.fire(towerClicked, game.input.keyboard.isDown(Phaser.Keyboard.CONTROL));
        }
        tower.setSelected(false);
      }
    }
  }
  private getAndUpdateFiredSoildersNum(isFireAll:boolean):number{
    let totalSoilders = parseInt(this.soldierNumText.text);
    let soildersBeSent = 0;
    if (isFireAll) {
      soildersBeSent = parseInt(this.soldierNumText.text);
      this.soldierNumText.text = '0';
    } else {
      soildersBeSent = Math.floor(totalSoilders/2)+1;
      this.soldierNumText.text = (totalSoilders - soildersBeSent) + "";
    }
    return soildersBeSent;
  }
  public setSelected(wantSelect: boolean){
    if(wantSelect){
      this.isSelected = true;
      this.circleGraphic.visible = true;
    }else{
      this.isSelected = false;
      this.circleGraphic.visible = false;

    }
  }
  private updateCirCleGraphic() {
    this.circleGraphic.clear();
    this.circleGraphic.lineStyle(5, parseInt("0x" + this.getColorByOwnerId().split('#')[1]), 0.4);
    this.circleGraphic.drawCircle(0, 0, this.height * 1.3);
    this.circleGraphic.endFill();
    this.circleGraphic.visible = false;
  }
  private createText() {
    this.soldierNumText = game.add.text(0, 0, "10", {
      font: 'bold 20px Arial',
      fill: 'white'
    });
    this.soldierNumText.setShadow(3, 3, 'rgba(0,0,0,0.2)', 2);
    this.soldierNumText.anchor.set(0.5);
    this.soldierNumText.alignTo(this, Phaser.TOP_RIGHT, 33, 0);
    this.player1TextBubbleImg = game.add.image(this.soldierNumText.x, this.soldierNumText.y, 'player1-text-bubble');
    this.player1TextBubbleImg.anchor.set(0.5);
    this.player2TextBubbleImg = game.add.image(this.soldierNumText.x, this.soldierNumText.y, 'player2-text-bubble');
    this.player2TextBubbleImg.anchor.set(0.5);
    this.soldierNumText.moveUp();
    this.soldierNumText.moveUp();
    if (this.ownerId === 1) {
      this.player2TextBubbleImg.visible = false;
    } else {
      this.player1TextBubbleImg.visible = false;
    }
    game.time.events.loop(1500, this.updateRenderTextContent, this);
  }
  private fire(targetTower: Tower, isFireAll: boolean) {

    let balloon = Balloon.getAReadyBalloon(this, this.getAndUpdateFiredSoildersNum(isFireAll));


    let moveDuration = game.physics.arcade.distanceBetween(this, targetTower) * 10;//distance equals 100-300
    let moveTween = game.add.tween(balloon).to({
      x: targetTower.x,
      y: targetTower.y
    }, moveDuration, null, true);
    moveTween.onComplete.add(Balloon.onArriveEvent, this, 1, targetTower);

  }
  public switchOwner(newOwnerId: number) {
    this.ownerId = newOwnerId;
    this.updateRenderTextStyle();
    this.updateCirCleGraphic();

  }
  public updateRenderTextContent() {
    let newSoldiersNum = parseInt(this.soldierNumText.text) + 1;
    this.soldierNumText.setText(newSoldiersNum + "");
    // this.renderText.addColor('white',4);
    // // this.renderText.width = this.height;
    // this.renderText.lineSpacing=-20;

  }
  public updateRenderTextStyle() {
    if (this.ownerId === 1) {
      this.player2TextBubbleImg.visible = false;
      this.player1TextBubbleImg.visible = true;
    } else {
      this.player2TextBubbleImg.visible = false;
      this.player1TextBubbleImg.visible = true;
    }
  }
  private getColorByOwnerId(): string {
    switch (this.ownerId) {
      case 0:
        return Tower.EMPTY_COLOR;
      case 1:
        return Tower.PLAYER1_COLOR;
      case 2:
        return Tower.PLAYER2_COLOR;
    }
  }
}
class Balloon extends Phaser.Sprite {
  public static PLAYER1_BALLOON_FRAME_INDEX = 0;
  public static PLAYER2_BALLOON_FRAME_INDEX = 1;
  public soldierNumText: Phaser.Text;
  public hide(){

  }
  public static onArriveEvent(balloon: Balloon, tween: Phaser.Tween, targetTower: Tower){
    let targetSoldiersNum = parseInt(targetTower.soldierNumText.text);
    if (balloon.getOwnerId() === targetTower.ownerId) {
      targetSoldiersNum += parseInt(balloon.soldierNumText.text);
    } else {
      targetSoldiersNum -= parseInt(balloon.soldierNumText.text);
      if (targetSoldiersNum < 0) {
        targetTower.switchOwner(balloon.getOwnerId());
        targetSoldiersNum *= -1;
      }
    }
    targetTower.soldierNumText.setText(targetSoldiersNum + "");
    balloon.kill();
    balloon.soldierNumText.kill();

  }
  public static getAReadyBalloon(tower:Tower, soildersBeSent:number){
    let balloon = balloons.getFirstDead() as Balloon;
    if (!balloon) {
      balloon = new Balloon();
      balloons.add(balloon);
    }
    if (tower.ownerId === 1) {
      balloon.frame = Balloon.PLAYER1_BALLOON_FRAME_INDEX;
    } else {
      balloon.frame = Balloon.PLAYER2_BALLOON_FRAME_INDEX;
    }
    balloon.revive();
    balloon.soldierNumText.revive();
    balloon.soldierNumText.setText(soildersBeSent+"");
    balloon.x = tower.x;
    balloon.y = tower.y;
    return balloon;
  }
  public getOwnerId() {

    if (this.frame === Balloon.PLAYER1_BALLOON_FRAME_INDEX) {
      return 1;
    } else {
      return 2;
    }
  }
  constructor() {
    super(game, 0, 0, 'balloons');
    this.scale.set(0.6)
    this.anchor.set(0.5);
    game.add.existing(this);
    this.kill();
    this.soldierNumText = game.add.text(0, 0, "0", {
      font: 'bold 20px Arial',
      fill: 'white'
    });
    this.soldierNumText.setShadow(3, 3, 'rgba(0,0,0,0.2)', 2);
    this.soldierNumText.anchor.set(0.5, 0.7);
    this.soldierNumText.position = this.position;
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
  game.load.image('ball', 'img/player2-balloon.png')
  game.load.image('brown-tower', 'img/brown-tower.png');
  game.load.image('player1-text-bubble', 'img/player1-text-bubble.png');
  game.load.image('player2-text-bubble', 'img/player2-text-bubble.png');
  // game.load.image('player1-balloon', 'img/player1-balloon.png');
  // game.load.image('player2-balloon', 'img/player2-balloon.png');
  game.load.spritesheet('balloons', 'img/balloon-sprite-sheet-60*180.png', 60, 90, 2)


  //sprite sheet
  game.load.spritesheet('button', 'img/button.png', 120, 40);
}
function create() {
  // init physics engine
  game.physics.startSystem(Phaser.Physics.ARCADE);
  // input
  let spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  spaceKey.onDown.add(Tower.toggleSelectAllTowers, this);
  //---------------------------------------------
  //put entity and enable its physics
  //tower
  towers = game.add.group();
  towers.add(new Tower(game.world.width * 0.2, game.world.height * 0.3, 1));
  towers.add(new Tower(game.world.width * 0.2, game.world.height * 0.9, 1));
  towers.add(new Tower(game.world.width * 0.5, game.world.height * 0.6, 1));
  towers.add(new Tower(game.world.width * 0.8, game.world.height * 0.9, 2));
  towers.add(new Tower(game.world.width * 0.8, game.world.height * 0.3, 2));
  //******
  balloons = game.add.group();
  for(let i=0; i<40; i++){
    balloons.add(new Balloon());
  }
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
  // towers.forEach((tower:Tower)=>{
  //   tower.updateRenderText();
  // }, null)
  // socket.emit('updateMouseY', GameInfo.roomName, GameInfo.playerId, game.input.y);
}
function render() {
  game.debug.text('you are player:' + GameInfo.playerId, 16, 24);
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
  while (document.body.firstChild) {
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
