var socket = io();
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
  },
  bindEvents: function() {
    this.createNewRoomBtn.onclick = this.createNewRoomEvent.bind(this);
    this.createNewRoomInput.onkeypress = function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        roomSystem.createNewRoomEvent();
      }
    }
    //this.roomsDiv.firstChild.onclick = new aiGameInit;
    for (var i = 1; i < this.roomsDiv.childElementCount; i++) {
      var room = this.roomsDiv.children[i];
      if(room.lastChild.className==='join-room-btn'){
        room.lastChild.onclick = roomSystem.joinRoomEvent.bind(roomSystem, room.firstChild.textContent);
      }
    }
  },
  //below are onclick events
  joinRoomEvent: function(roomName) {
    socket.emit('joinRoomEvent',roomName);
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
      socket.emit('clientCreateNewRoomEvent', roomName);
      this.waitingDiv.lastChild.onclick = this.cancelCreateNewRoomEvent.bind(this,roomName);
    }
  },
  cancelCreateNewRoomEvent: function(roomName) {
    //cancel create new room
    this.hideWaitingDivAndShowMainDiv();
    socket.emit('cancelCreateNewRoomEvent',roomName);
  },
  //below are useful function
  resetRooms: function (rooms) {
    while(roomSystem.roomsDiv.firstChild){
      roomSystem.roomsDiv.removeChild(roomSystem.roomsDiv.firstChild);
    }
    roomSystem.appendNewRoom('Play with AI', false);
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

}


socket.on('respondClientCreateNewRoomEvent', function(data) {
  if (data.isHost) {
    if (data.nameRepeat) {
      roomSystem.showMessageDiv('this name is already used');
    } else {
      roomSystem.showWaitingDivAndHideMainDiv();
    }
  }
  else{
    roomSystem.resetRooms(data.rooms);
  }
});
socket.on('resetRooms',roomSystem.resetRooms);
socket.on('roommateDisconnect',function(roomName){
})
socket.on('gameInit', function(data){
  while(document.body.firstChild){
    document.body.removeChild(document.body.firstChild);
  }
  //console.log(data);
  var socketIDs = [];
  var player_id = 1;
  Object.keys(data.sockets).forEach( function(socketId){
    //console.log("Room client socket Id: " + socketId );
    socketIDs[socketId] = player_id++;
  });
  socketIDs["roomName"] = data.name;
  init(socket,socketIDs);
})
roomSystem.init();
