var mapName = "map02(2人).jpg";
var playerName = "";
var playerID = 0;
var data = {};
var map_list = [
  'tutorial01(1人)',
  'tutorial02(1人)',
  'tutorial03(1人)',
  'tutorial04(1人)',
  'tutorial05(1人)'
];
var cur_map = 0;
var level_list = [
  'EASY',
  'NORMAL',
  'HARD'
];
var cur_level = 0;

var roomSystem = {
  init: function() {
    this.cacheDom();
    this.bindEvents();
  },
  cacheDom: function() {
    this.mainDiv = document.getElementById('main-div');
    this.waitingDiv = document.getElementById('waiting-div');
    this.messageDiv = document.getElementById('message-div');
    this.createNewRoomInput = document.getElementById('create-new-room-input');
    this.createNewRoomBtn = document.getElementById('create-new-room-btn');
    this.roomsDiv = document.getElementById('rooms-div');
    this.chooseMapBtn = document.getElementById('choose-map-btn');
    this.mapsDropDownDiv = document.getElementById('maps-dropdown');
    this.playersDiv = document.getElementById('players-div');
    console.log(this.waitingDiv);

    /*fs.readdir(__dirname+"/../public/maps", (err,files)=>{
      socket.emit('resetMapImg', files)

      $('#maps-dropdown').empty();
      files.forEach(function(file){
        if(file.split('.')[1]==='jpg'){
          $('#maps-dropdown').append('<a>'+file.replace(/\..+$/, '')+'</a>');
          console.log("socket.on resetMapImg IMG:",file);
          mapName = file;
        }
      })
      roomSystem.bindEvents();
    })*/
  },
  bindEvents: function() {
    playerName = localStorage.planet_war_id;
    document.getElementById('player-name-input').value = playerName;
    //$('#player-name-input').value = localStorage.planet_war_id;
    //console.log(localStorage.planet_war_id);
    $('#player-name-input').bind('keydown keyup keypress', function() {
      playerName = this.value||"";
      localStorage.planet_war_id = playerName;
      //console.log('name : '+playerName);
    });
    $('#comfirm-name-btn').unbind().click(function(){
      $('#player-name-input').css({display:'none'});
      $('#comfirm-name-btn').css({display:'none'});
      $('#player-name').css({display:'flex'});
      $('#player-name').html('歡迎回來，指揮官'+playerName);
      localStorage.planet_war_id = playerName;
      $('#select-mode-div').css({display:'flex'});
    })
    var mapImage = $('#map-img')[0];
    $('#maps-dropdown>a').each(function(idx){
      $(this).click(function(){
        mapName = $(this).text()+'.jpg';
        $('#maps-dropdown').css({
          display:'none'
        })
      })
      $(this)[0].onmouseover = function(){
        mapImage.style.display = 'block';
        let src = "./maps/"+$(this).text() + '.jpg'
        $('#map-img').css({
          'right':($(this).position().left+130) +'px',
          'top':($(this).position().top+45) +'px'
        })
        $('#map-img').attr('src', src)
        // $('#map-img').css({
        //   'left':'80px',
        //   'top':'300px'
        // })
      }
      $(this)[0].onmouseout = function(){
        mapImage.style.display = 'none';
      }
    })
    document.getElementById('single-player-btn').onclick = function(){
      $('#select-mode-div').css({
        'display':'none'
      })
      $('#name-div').css({
        'display':'none'
      })
      $('#select-single-mode-div').css({
        'display':'flex'
      })
    }
    document.getElementById('campaign-btn').onclick = function(){
      $('#select-single-mode-div').css({
        'display':'none'
      })
      $('#select-map-div').css({
        'display':'inline-block'
      })
    }
    document.getElementById('challange-btn').onclick = function(){
      $('#select-single-mode-div').css({
        'display':'none'
      })
      $('#select-map-div').css({
        'display':'inline-block'
      })
    }
    document.getElementById('prev-map-btn').onclick = function(){
      cur_map = (cur_map-1) % map_list.length;
      let src = "maps/"+map_list[cur_map] + '.jpg'
      $('#map-img').attr('src', src)
    }
    document.getElementById('next-map-btn').onclick = function(){
      cur_map = (cur_map+1) % map_list.length;
      let src = "maps/"+map_list[cur_map] + '.jpg'
      $('#map-img').attr('src', src)
    }
    document.getElementById('prev-level-btn').onclick = function(){
      cur_level = (cur_level-1) % level_list.length;
      $('#level').html(level_list[cur_level]);
    }
    document.getElementById('next-level-btn').onclick = function(){
      cur_level = (cur_level+1) % map_list.length;
      $('#level').html(level_list[cur_level]);
    }
    document.getElementById('start-game-btn').onclick = function(){
      let maxPlayer = parseInt(map_list[cur_map].split('(')[1][0])
      var map_name=map_list[cur_map].split('(')[0]+".json";

      playerID = 1;
      data = {};
      data.playerNames = [];
      data.playerNames[0] = playerName;
      data.playerStatus = [];
      data.playerStatus[0] = 'waiting';
      data.mapName = map_name;
      data.maxPlayer = maxPlayer;
      data.allPlayer = 1;
      data.readyPlayer = 0;
      data.AInum = 0;

      for(var i=1; i<maxPlayer; i++){
        console.log('room : '+data.roomName+' add ai : '+data.key);
        data.playerNames[i] = 'AI';
        data.playerStatus[i] = 'ready(AI)';
        data.readyPlayer++;
        data.allPlayer++;
        data.AInum++;
      }
    
      data.isHost = true;
      roomSystem.isHost = true;

      data.players = [];
      data.playerNames.forEach(function(player_name, key){
        var player = {};
        player.name = player_name;
        player.status = data.playerStatus[key];
        player.ID = key+1;
        data.players.push(player);
      });

      console.log('playerName:'+playerName+"\nmap:"+map_name);

      console.log(data);
      while(document.body.firstChild){
        document.body.removeChild(document.body.firstChild);
      }
      console.log(data);
      var player_id = 1;
      var AInum = data.maxPlayer - 1;    
      //socketIDs["roomName"] = data.name;
      init(data,AInum);
      document.body.getElementsByTagName('div')[0].style.margin = '0px 0px';

      //console.log(document.getElementById('cancel'));
      //document.getElementById('players-div');
      //this.waitingDiv.lastChild.onclick = this.cancelCreateNewRoomEvent.bind(this,roomName);
      // /this.waitingDiv.lastChild.onclick = this.hideWaitingDivAndShowMainDiv;
      //document.getElementById('cancel').onclick = roomSystem.hideWaitingDivAndShowMainDiv.bind();
    }
    document.getElementById('multi-player-btn').onclick = function(){
      window.location.replace("http://ec2-54-186-109-219.us-west-2.compute.amazonaws.com:8082/");
    }
    //this.createNewRoomBtn.onclick = this.createNewRoomEvent.bind(this);
    this.createNewRoomInput.onkeypress = function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        roomSystem.createNewRoomEvent();
      }
    }
    this.chooseMapBtn.onclick = (function(){
      if(this.mapsDropDownDiv.style.display==='flex'){
        this.mapsDropDownDiv.style.display='none';
      }else{
        this.mapsDropDownDiv.style.display='flex';
      }
    }).bind(this);
    //this.roomsDiv.firstChild.onclick = new aiGameInit;
    for (var i = 0; i < this.roomsDiv.childElementCount; i++) {
      var room = this.roomsDiv.children[i];
      if(room.lastChild.className==='join-room-btn'){
        room.lastChild.onclick = this.joinRoomEvent.bind(this, room.firstChild.textContent);
      }
    }
  },
  showMessageDiv: function(message) {
    this.messageDiv.style.display = 'flex';
    this.messageDiv.textContent = message;
    setTimeout(function() {
      $('#message-div').css({
        display:'none'
      })
    }, 1000);
  },
  hideMessageDiv: function() {
    this.messageDiv.style.display = 'none';
  },
  showWaitingDivAndHideMainDiv: function(isJoinOther) {
    this.waitingDiv.style.display = 'flex';
    this.mainDiv.style.display = 'none';
    if (isJoinOther) {
      this.waitingDiv.getElementsByTagName('p')[0].textContent = 'joining room, please wait...'
    }
  },
  hideWaitingDivAndShowMainDiv: function() {
    console.log('hideWaitingDivAndShowMainDiv');
    roomSystem.waitingDiv.style.display = 'none';
    roomSystem.mainDiv.style.display = 'flex';
  },
  gameStart: function() {
    console.log(roomSystem);
    //socket.emit('gameStartEvent', roomSystem.roomName);

    console.log(data);
    while(document.body.firstChild){
      document.body.removeChild(document.body.firstChild);
    }
    console.log(data);
    var player_id = 1;
    var AInum = data.maxPlayer - 1;    
    //socketIDs["roomName"] = data.name;
    init(data,AInum);
    document.body.getElementsByTagName('div')[0].style.margin = '0px 0px';
  },
}
roomSystem.init();
