var socket = io();
var roomSystem = {
	init: function(){
		this.cacheDom();
		this.bindEvents();
	},
	cacheDom: function(){
		this.mainDiv = document.getElementById('main-div');
		this.waitingDiv = document.getElementById('waiting-div');
		this.messageDiv = document.getElementById('message-div');
		this.createNewRoomInput = document.getElementById('create-new-room-input');
		this.createNewRoomBtn = document.getElementById('create-new-room-btn');
		this.roomsDiv = document.getElementById('rooms-div');
	},
	bindEvents: function(){
		this.createNewRoomBtn.onclick=this.createNewRoomEvent.bind(this);
		this.createNewRoomInput.onkeypress = function(event){
			if(event.keyCode===13||event.which===13){
				roomSystem.createNewRoomEvent();
			}
		}
		for(var i=0; i<this.roomsDiv.childElementCount; i++){
			this.evalRoom.bind(this, this.roomsDiv.children[i])();
		}
		this.waitingDiv.getElementsByTagName('button')[0].onclick = this.cancelCreateNewRoom.bind(this);
	},
	evalRoom: function(room){
		var roomBtn = room.getElementsByTagName('button')[0];
		var roomBtnClassName = roomBtn.getAttribute('class');
		var roomName = room.getElementsByTagName('span')[0].textContent;
		if(roomBtnClassName=='join-room-btn'){
			roomBtn.onclick = (function(){
				this.showWaitingDivAndHideMainDiv(roomName);
				// join this room
			}).bind(this);
		}
	},
	createNewRoomEvent: function(){
		var roomName = this.createNewRoomInput.value;
		this.hideMessageDiv();
		if(roomName === ''){
			this.showMessageDiv('please Enter the name!')
		}else {
			socket.emit('clientCreateNewRoomEvent', roomName);
		}
	},
	createNewRoom:function(roomName){
		this.showWaitingDivAndHideMainDiv();
	},
	cancelCreateNewRoom:function(){
		//cancel create new room
		this.hideWaitingDivAndShowMainDiv();
	},
	showMessageDiv:function(message){
		this.messageDiv.style.display = 'flex';
		this.messageDiv.textContent = message;
	},
	hideMessageDiv:function(){
		this.messageDiv.style.display = 'none';
	},
	showWaitingDivAndHideMainDiv:function(joinOther){
		this.waitingDiv.style.display = 'flex';
		this.mainDiv.style.display = 'none';
		if(joinOther){
			this.waitingDiv.getElementsByTagName('p')[0].textContent='joining room, please wait...'
			this.waitingDiv.getElementsByTagName('button')[0].style.display='none';
		}
	},
	hideWaitingDivAndShowMainDiv:function(){
		this.waitingDiv.style.display = 'none';
		this.mainDiv.style.display = 'flex';
	},
	nameAlreadyExist:function(roomName){


		// return true if name already exist
		return false;
	}
}

socket.on('respondClientCreateNewRoomEvent', function(data) {
	if(data.success){
		roomSystem.createNewRoom(data.roomName);
	}else{
		roomSystem.showMessageDiv('this room name is already used');
	}
})


roomSystem.init();
