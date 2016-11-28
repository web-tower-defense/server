import gameInit from "./game/game-init";
export default function startRoomSystem(socket:SocketIOClient.Socket){
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
	    for (var i = 0; i < this.roomsDiv.childElementCount; i++) {
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
	    this.hideMessageDiv();
	    if (roomName === '') {
	      this.showMessageDiv('please Enter the name!')
	    } else if (roomName.length > 18) {
	      this.showMessageDiv('Name must shorter than 18!')
	    } else {
	      socket.emit('checkIfNameExist', roomName);
				this.waitingDiv.lastChild.onclick = this.cancelCreateNewRoomEvent.bind(this,roomName);
	    }
	  },
	  cancelCreateNewRoomEvent: function(roomName) {
	    //cancel create new room
	    this.hideWaitingDivAndShowMainDiv();
			socket.emit('leaveRoom',roomName);
	  },
	  //below are useful function
		resetRooms: function (rooms) {
			while(roomSystem.roomsDiv.firstChild){
				roomSystem.roomsDiv.removeChild(roomSystem.roomsDiv.firstChild);
			}
		  for (let room in rooms) {
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
		hideRoomSystem: function() {
			document.getElementById('room-system-div').style.display = 'none';
		},
		showRoomSystem: function(){
			document.getElementById('room-system-div').style.display = 'flex';
			roomSystem.hideWaitingDivAndShowMainDiv();
		}

	} as any;


	socket.on('respondCheckIfNameExist', function(nameRepeat) {
	    if (nameRepeat) {
				roomSystem.showMessageDiv('this name is already used');
	    } else {
				roomSystem.showWaitingDivAndHideMainDiv();
	    }
	});
	socket.on('resetRooms',roomSystem.resetRooms);
	socket.on('gameInit', function(room, roomName){
		// var playerId = data.id;
		roomSystem.hideRoomSystem();
		let socketIds = Object.keys(room.sockets);
		let playerId = socketIds.indexOf(socket.id)===0? 1:2;
		gameInit(playerId, socket, roomName);
	})
	socket.on('roommateDisconnect',function(roomName){
		socket.emit('leaveRoom', roomName);
		alert('the other player lost connection');
		location.reload();
	})
	roomSystem.init();
}
