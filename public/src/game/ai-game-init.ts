var game: Phaser.Game;
var socket: SocketIOClient.Socket;
var renderText = "init";
var towers: Phaser.Group;
var balloons: Phaser.Group;
class AI{
  private allSoldiers:number;
  public updateInfo(){
    this.allSoldiers=0;
    for(let i=0; i<towers.length; i++){
      let tower = (towers.getChildAt(i) as Tower);
      if(tower.ownerId===2){
        this.allSoldiers+=parseInt(tower.soldierNumText.text);
      }
    }
    this.analize();
  }
  private getMinTowerSoldierNumIdxArray():[number, number]{
    let minNum=1000, idx=0;
    for(let i=0; i<towers.length; i++){
      let tower = towers.getChildAt(i) as Tower;
      if(tower.ownerId!==2){
        let currNum=parseInt(tower.soldierNumText.text);
        if(minNum>currNum){
          minNum=currNum;
          idx=i;
        }

      }
    }
    return [minNum, idx];
  }
  private analize(){
    let numIdxArray = this.getMinTowerSoldierNumIdxArray();
    if(this.allSoldiers>numIdxArray[0]){
      let targetTower = towers.getChildAt(numIdxArray[1]) as Tower
      for(let i=0; i<towers.length; i++){
        let tower= towers.getChildAt(i) as Tower;
        if(tower.ownerId===2){
          tower.fire(targetTower, tower.getSolidersBeSentAndUpdate(true));

        }
      }
    }
  }
}
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
  private textBubble: Phaser.Image;

  public constructor(x: number, y: number, public ownerId: number, initSoldiers?:number) {

    super(game, x, y, 'brown-tower');
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.immovable = true;
    this.anchor.set(0.5);
    this.inputEnabled = true;
    this.events.onInputDown.add(Tower.onClickEvent, this, 2);
    game.add.existing(this);

    this.circleGraphic = game.add.graphics(this.x, this.y);
    this.updateCirCleGraphic();

    this.createTextAndTextBubble();
    if (initSoldiers) {
      this.soldierNumText.text = initSoldiers + "";
    }
  }
  public static isGameOver() {
    let winnerId: number;
    for (let i = 0; i < towers.length; i++) {
      let towerId = (towers.getChildAt(i) as Tower).ownerId;
      if (towerId !== 0) {
        winnerId = towerId;
        break;
      }
    }
    for (let i = 0; i < towers.length; i++) {
      let towerId = (towers.getChildAt(i) as Tower).ownerId;
      if (towerId !== winnerId && towerId !== 0) {
        return false;
      }
    }
    for (let i = 0; i < balloons.length; i++) {
      let balloon = (balloons.getChildAt(i) as Balloon);
      if (balloon.alive&& balloon.getOwnerId()!== winnerId) {
        return false;
      }
    }
    return true;
  }
  public static isNoneOfMyTowersSelected(): boolean {
    for (let i = 0; i < towers.length; i++) {
      let tower = (towers.getChildAt(i) as Tower);
      if (tower.ownerId === GameInfo.playerId && tower.isSelected) {
        return false;
      }
    }
    return true;
  }
  public static isAllOfMyTowersSelected(): boolean {
    for (let i = 0; i < towers.length; i++) {
      let tower = (towers.getChildAt(i) as Tower);
      if (tower.ownerId === GameInfo.playerId && !tower.isSelected) {
        return false;
      }
    }
    return true;
  }
  public static toggleSelectAllTowers(a, b, cancelAllSelect?: boolean) {
    //don't know a,b is what?
    let selectAll: boolean;
    if (cancelAllSelect) {
      selectAll = false;
    } else {
      selectAll = !Tower.isAllOfMyTowersSelected();
    }
    for (let i = 0; i < towers.length; i++) {
      let tower = (towers.getChildAt(i) as Tower);
      if (tower.ownerId === GameInfo.playerId) {
        tower.setSelected(selectAll);
      }
    }
  }
  public static changeOwner(tower: Tower, newOwnerId: number) {
    tower.ownerId = newOwnerId;
  }
  private static onClickEvent(towerClicked: Tower) {

    if (towerClicked.ownerId === GameInfo.playerId) {
      if (Tower.isNoneOfMyTowersSelected() && !towerClicked.isSelected) {
        towerClicked.setSelected(true);
        return;
      }
      towerClicked.setSelected(false);
    }
    //fire all my selected towers

    let isFireAll = game.input.keyboard.isDown(Phaser.Keyboard.A);
    for (let i = 0; i < towers.children.length; i++) {
      let tower = towers.getChildAt(i) as Tower;
      if (tower.ownerId === GameInfo.playerId && tower.isSelected) {
        if (parseInt(tower.soldierNumText.text) >= 1) {
          let isFireAll = game.input.keyboard.isDown(Phaser.Keyboard.A);
          let soildersBeSent = tower.getSolidersBeSentAndUpdate(isFireAll)
          tower.fire(towerClicked, soildersBeSent);
        }
        tower.setSelected(false);
      }
    }
  }
  public getSolidersBeSentAndUpdate(isFireAll: boolean): number {
    let totalSoldiers = parseInt(this.soldierNumText.text);
    let soldiersLeft = 0;
    if (isFireAll) {
      soldiersLeft = 0;
    } else {
      soldiersLeft = Math.floor(totalSoldiers / 2);
    }
    this.soldierNumText.setText(soldiersLeft + "");
    return totalSoldiers - soldiersLeft;
  }
  public setSelected(wantSelect: boolean) {
    if (wantSelect) {
      this.isSelected = true;
      this.circleGraphic.visible = true;
    } else {
      this.isSelected = false;
      this.circleGraphic.visible = false;

    }
  }
  private updateCirCleGraphic() {
    this.circleGraphic.clear();
    this.circleGraphic.lineStyle(5, parseInt("0x" + this.getColorByOwnerId().split('#')[1]), 1);
    this.circleGraphic.drawCircle(0, 0, this.height * 1.5);
    this.circleGraphic.endFill();
    this.circleGraphic.visible = false;
  }
  private createTextAndTextBubble() {
    this.soldierNumText = game.add.text(0, 0, "0", {
      font: 'bold 20px Arial',
      fill: 'white'
    });
    this.soldierNumText.setShadow(3, 3, 'rgba(0,0,0,0.2)', 2);
    this.soldierNumText.anchor.set(0.5);
    this.soldierNumText.alignTo(this, Phaser.TOP_RIGHT, 33, 0);



    this.textBubble = game.add.image(this.soldierNumText.x, this.soldierNumText.y, 'text-bubbles', this.ownerId);
    this.textBubble.anchor.set(0.5);


    this.soldierNumText.moveUp();
    this.soldierNumText.moveUp();


  }
  public fire(targetTower: Tower, soildersBeSent: number) {

    let balloon = Balloon.getAReadyBalloon(this, soildersBeSent);


    let moveDuration = game.physics.arcade.distanceBetween(this, targetTower) * 10;//distance equals 100-300
    let moveTween = game.add.tween(balloon).to({
      x: targetTower.x,
      y: targetTower.y
    }, moveDuration, null, true);
    moveTween.onComplete.add(Balloon.onArriveEvent, this, 1, targetTower);

  }
  public switchOwner(newOwnerId: number) {
    this.ownerId = newOwnerId;
    this.updateTextBubble();
    this.updateCirCleGraphic();

  }
  public updateTextBubble() {
    this.textBubble.frame = this.ownerId;
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
  public static onArriveEvent(balloon: Balloon, tween: Phaser.Tween, targetTower: Tower) {
    balloon.kill();
    balloon.soldierNumText.kill();
    let targetSoldiersNum = parseInt(targetTower.soldierNumText.text);
    if (balloon.getOwnerId() === targetTower.ownerId) {
      targetSoldiersNum += parseInt(balloon.soldierNumText.text);
    } else {
      targetSoldiersNum -= parseInt(balloon.soldierNumText.text);
      if (targetSoldiersNum < 0) {
        targetTower.switchOwner(balloon.getOwnerId());
        targetSoldiersNum *= -1;
      }
      if (Tower.isGameOver()) {
        setTimeout(()=>{
          if (towers.getFirstAlive().ownerId === GameInfo.playerId) {
            alert('You won the game, congratulation!!');
          } else {
            alert('You lose the game, but it is a Good Game');
          }
          location.reload(true);
        }, 1000)
      }
    }
    targetTower.soldierNumText.setText(targetSoldiersNum + "");

  }
  public static getAReadyBalloon(tower: Tower, soildersBeSent: number) {
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
    balloon.soldierNumText.setText(soildersBeSent + "");
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
  game.load.image('background', 'img/background-mountain.png');
  game.load.image('ball', 'img/player2-balloon.png')
  game.load.image('brown-tower', 'img/brown-tower.png');
  game.load.spritesheet('button', 'img/button.png',120,40);
  game.load.spritesheet('text-bubbles', 'img/text-bubble50*40*3.png', 50, 40, 3);
  game.load.spritesheet('balloons', 'img/balloon-sprite-sheet-60*180.png', 60, 90, 2);


  //sprite sheet
  game.load.spritesheet('button', 'img/button.png', 120, 40);
}
function create() {
  // init physics engine
  game.physics.startSystem(Phaser.Physics.ARCADE);
  //ai
  let ai = new AI();

  //background
  let background = game.add.image(0, 0, 'background');
  background.height = game.height;
  background.width = game.width;
  background.inputEnabled = true;
  background.events.onInputDown.add(Tower.toggleSelectAllTowers, null, 0, true);
  // input
  let spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  spaceKey.onDown.add(Tower.toggleSelectAllTowers, this, 1);
  //---------------------------------------------
  //put entity and enable its physics
  //tower


  //towers
  towers = game.add.group();
  towers.add(new Tower(game.world.width * 0.1, game.world.height * 0.5, 1, 0));

  towers.add(new Tower(game.world.width * 0.3, game.world.height * 0.3, 0, 5));
  towers.add(new Tower(game.world.width * 0.3, game.world.height * 0.7, 0, 10));

  // towers.add(new Tower(game.world.width * 0.5, game.world.height * 0.1, 0, 5));
  towers.add(new Tower(game.world.width * 0.5, game.world.height * 0.5, 0, 0));
  // towers.add(new Tower(game.world.width * 0.5, game.world.height * 0.9, 0, 5));

  towers.add(new Tower(game.world.width * 0.7, game.world.height * 0.7, 0, 5));
  towers.add(new Tower(game.world.width * 0.7, game.world.height * 0.3, 0, 10));

  towers.add(new Tower(game.world.width * 0.9, game.world.height * 0.5, 2, 0));
  //******
  //balloons;
  balloons = game.add.group();
  for (let i = 0; i < 40; i++) {
    balloons.add(new Balloon());
  }
  //--------------------------------------
  //start to update game
  //start button
  let startButton = game.add.button(game.world.width * 0.5, game.world.height * 0.6, 'button', ()=>{
    startButton.destroy();
    updateTowersAndAi();
  }, this, 1, 0, 2);
  startButton.anchor.set(0.5);

  function updateTowersAndAi () {
    startButton.destroy();
    towers.forEach((tower: Tower) => {
      if (tower.ownerId !== 0) {
        let totalSoldiers = parseInt(tower.soldierNumText.text)
        totalSoldiers += 1;
        tower.soldierNumText.setText("" + totalSoldiers);
      }
    }, this);
    ai.updateInfo();
    setTimeout(updateTowersAndAi, 1500);
  }
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
  //add text
  game.add.text(16, game.world.height-40, "Use Mouse, A, Space to send balloon and take other's castle", {});
}
function update() {
  // towers.forEach((tower:Tower)=>{
  //   tower.updateRenderText();
  // }, null)
  // socket.emit('updateMouseY', GameInfo.roomName, GameInfo.playerId, game.input.y);
}
function render() {
  if(GameInfo.playerId===1){
    game.debug.text('you are player1, blue team', 16, 24);
  }else{
    game.debug.text('you are player2, orange team', 16, 24);

  }
  game.debug.text(renderText, 16, 48);
  var name = (game.input.activePointer.targetObject) ? game.input.activePointer.targetObject.sprite.key : 'none';
  game.debug.text("Pointer Target: " + name, 16, 64);

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
  game = new Phaser.Game(960, 640, Phaser.AUTO, null, {
    preload: preload,
    create: create,
    update: update,
    render: render
  });
}
