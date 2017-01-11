var socket = io();
var mapName = "map02(2人).jpg";
var playerName = "";
var playerID = 0;
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
  },
  bindEvents: function() {
    $('#player-name-input').bind('keydown keyup keypress', function() {
      playerName = this.value||"";
      console.log('name : '+playerName);
    });
    $('#comfirm-name-btn').unbind().click(function(){
      socket.emit('createNameEvent',playerName);
      $('#player-name-input').css({display:'none'});
      $('#comfirm-name-btn').css({display:'none'});
      $('#player-name').css({display:'flex'});
      $('#player-name').html('hello player '+playerName);
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
        let src = "maps/"+$(this).text() + '.jpg'
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
    this.createNewRoomBtn.onclick = this.createNewRoomEvent.bind(this);
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
  //below are onclick events
  joinRoomEvent: function(roomName) {
    //console.log('room : ' + roomName+'   player : ' + playerName);
    socket.emit('joinRoomEvent',roomName, playerName);
    this.roomName = roomName;
    this.showWaitingDivAndHideMainDiv(true);
    this.waitingDiv.lastChild.onclick = this.cancelCreateNewRoomEvent.bind(this,roomName);
  },
  createNewRoomEvent: function() {
    var roomName = this.createNewRoomInput.value;
    this.roomName = roomName;
    this.hideMessageDiv();
    if (roomName === '') {
      this.showMessageDiv('please Enter the name!')
    } else if (roomName.length > 18) {
      this.showMessageDiv('Name must shorter than 18!')
    } else {
      console.log("map_name:"+mapName);
      let maxPlayer = parseInt(mapName.split('(')[1][0])
      socket.emit('clientCreateNewRoomEvent', roomName, mapName, playerName, maxPlayer);
      this.waitingDiv.lastChild.onclick = this.cancelCreateNewRoomEvent.bind(this,roomName);
    }
  },
  cancelCreateNewRoomEvent: function(roomName) {
    //cancel create new room
    var out = {};
    out.roomName = roomName;
    out.playerName = playerName;
    out.playerID = playerID;
    console.log(out);
    this.hideWaitingDivAndShowMainDiv();
    socket.emit('cancelCreateNewRoomEvent',out);
  },
  //below are useful function
  resetRooms: function (rooms) {
    while(roomSystem.roomsDiv.firstChild){
      roomSystem.roomsDiv.removeChild(roomSystem.roomsDiv.firstChild);
    }
    // roomSystem.appendNewRoom('Play with AI', false);
    for (room in rooms) {
      roomSystem.appendNewRoom(room, rooms[room]);
    }
    roomSystem.bindEvents();
  },
  appendNewRoom: function(roomName, isFull) {
    var roomDiv = document.createElement('div');
    roomDiv.setAttribute('class', 'room-div');
    var span = document.createElement('span');
    span.textContent = roomName;
    var button = document.createElement('button');
    var icon = document.createElement('i');
    if (isFull) {
      button.setAttribute('class', 'full-room-btn');
      icon.setAttribute('class', 'fa fa-users');
    } else {
      button.setAttribute('class', 'join-room-btn');
      icon.setAttribute('class', 'fa fa-sign-in');
    }
    button.appendChild(icon);
    roomDiv.appendChild(span);
    roomDiv.appendChild(button);
    this.roomsDiv.appendChild(roomDiv);
  },
  getRoomDivByName: function(roomName) {
    for (var i = 0; i < this.roomsDiv.childElementCount; i++) {
      if (this.roomsDiv.children[i].getElementsByTagName('span')[0].textContent === roomName) {
        return this.roomsDiv.children[i];
      };
    }
  },
  removeRoomByName: function(roomName) {
    this.getRoomDivByName(roomName).remove();
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
    this.waitingDiv.style.display = 'none';
    this.mainDiv.style.display = 'flex';
  },
  playerReady: function() {
    var data = {};
    //console.log("ready : "+playerName);
    data.playerName = playerName;
    data.playerID = playerID;
    data.roomName = roomSystem.roomName;
    //console.log(data);
    //console.log(roomSystem);
    socket.emit('playerReadyEvent',data);
  },
  updateCurrentRoom: function(data) {
    console.log(data)
    this.playersDiv.innerHTML = "";
    data.players.forEach(function(player, key){
      var playerDiv = document.createElement('div');
      playerDiv.setAttribute('class', 'player-div');
      var span = document.createElement('div');
      span.setAttribute('class', 'player-name');
      span.textContent = player.name;
      if(key === 0){
        var icon = document.createElement('i');
        icon.setAttribute('class', 'fa fa-star');
        span.appendChild(icon);
      }
      if(key === playerID-1){
        //#aeffa0
        span.setAttribute('style', 'background-color:#a0ffb3');
      }
      var span2 = document.createElement('div');
      span2.setAttribute('class', 'player-status');
      if(player.status === null && roomSystem.isHost === true){
        var AIbutton = document.createElement('button');
        var icon = document.createElement('i');
        AIbutton.setAttribute('class', 'add-ai-btn');
        AIbutton.player = key;
        AIbutton.onclick = function(){
          console.log('add ai : '+key);
          var data = {};
          data.key = key;
          data.roomName = roomSystem.roomName;
          console.log(data);
          socket.emit('addAiEvent', data);
        };
        icon.setAttribute('class', 'fa fa-user-plus');
        AIbutton.appendChild(icon);
        span2.appendChild(AIbutton);
      }else{
        span2.textContent = player.status;
      }

      if(player.status === 'waiting'){
        span2.setAttribute('style', 'background-color:#ffbca0');
      }
      else if(player.status === 'ready'){
        span2.setAttribute('style', 'background-color:#a0ffb3');
      }
      if(player.status === 'ready(AI)' && roomSystem.isHost === true){
        span2.setAttribute('style', 'background-color:#a0ffb3');
        var button = document.createElement('button');
        var icon = document.createElement('i');
        button.onclick = function(){
          var data = {};
          data.key = key;
          data.roomName = roomSystem.roomName;
          console.log(data);
          socket.emit('kickAiEvent', data);
        };
        icon.setAttribute('class', 'fa fa-times');
        button.appendChild(icon);
        span2.appendChild(button);
      }
      if(player.ID === playerID){
        var button = document.createElement('button');
        var icon = document.createElement('i');
        button.setAttribute('class', 'ready-btn');
        button.onclick = roomSystem.playerReady;
        if(player.status === 'waiting'){
          icon.setAttribute('class', 'fa fa-check');
        }
        else if(player.status === 'ready'){
          icon.setAttribute('class', 'fa fa-times');
        }
        button.appendChild(icon);
        span2.appendChild(button);
      }
      playerDiv.appendChild(span);
      playerDiv.appendChild(span2);

      roomSystem.playersDiv.appendChild(playerDiv);
    });
    if(data.readyPlayer===data.maxPlayer){
      if(this.isHost === true){
        var button = document.createElement('button');
        button.setAttribute('class', 'start-game-btn');
        button.textContent = 'START !';
        button.onclick = roomSystem.gameStart;
        roomSystem.playersDiv.appendChild(button);
      }
      else{
        var span = document.createElement('span');
        span.textContent = 'all players ready.\n  waiting for host player to start...';
        roomSystem.playersDiv.appendChild(span);
      }
    }
  },
  gameStart: function() {
    console.log(roomSystem);
    socket.emit('gameStartEvent', roomSystem.roomName);
  },
}
socket.on('respondClientCreateNewRoomEvent', function(data) {
  roomSystem.isHost = data.isHost;
  if (data.isHost) {
    if (data.nameRepeat) {
      roomSystem.showMessageDiv('this name is already used');
    } else {
      playerID = data.allPlayer;
      console.log('playerName:'+playerName+"\nplayerID : "+playerID+"\nmap:"+mapName);
      $('#map-img2').attr('src', 'maps/'+mapName)
      $('#map-img2')[0].style.display = 'block'
      roomSystem.showWaitingDivAndHideMainDiv();

      roomSystem.updateCurrentRoom(data);
    }
  }
  else{
    roomSystem.resetRooms(data.rooms);
  }
});
socket.on('resetRooms',roomSystem.resetRooms);
socket.on('roommateDisconnect',function(){
  alert('roommate disconnect!');
  location.reload();
})
socket.on('gameInit', function(data){
  console.log(data);
  while(document.body.firstChild){
    document.body.removeChild(document.body.firstChild);
  }
  //console.log(data);
  var socketIDs = [];
  var player_id = 1;
  var AInum = data.max_player - data.length;
  Object.keys(data.sockets).forEach( function(socketId){
    //console.log("Room client socket Id: " + socketId );
    socketIDs[socketId] = player_id++;
  });
  //socketIDs["roomName"] = data.name;
  data.player_id=socketIDs[socket.id];
  init(socket,data,AInum);
  document.body.getElementsByTagName('div')[0].style.margin = '0px 0px';
})
socket.on('resetMapImg', function(files){
  $('#maps-dropdown').empty();
  files.forEach(function(file){
    if(file.split('.')[1]==='jpg'){
      $('#maps-dropdown').append('<a>'+file.replace(/\..+$/, '')+'</a>');
      console.log("socket.on resetMapImg IMG:",file);
      mapName = file;
    }
  })
  roomSystem.bindEvents();
})
socket.on('respondJoinRoomEvent', function(data){
  //console.log("new joiner");
  $('#map-img2').attr('src', 'maps/'+data.mapName)
  $('#map-img2')[0].style.display = 'block'
  playerID = data.allPlayer;
  //console.log('playerName:'+playerName+"\nplayerID : "+playerID+"\nmap:"+data.mapName);
})
socket.on('updateRoom', function(data){
  console.log("update");
  roomSystem.updateCurrentRoom(data);
})
roomSystem.init();
