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
		this.waitingDiv.getElementsByTagName('button')[0].onclick = this.cancelCreateNewRoomEvent.bind(this);
	},
	//below are onclick events
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
	cancelCreateNewRoomEvent:function(){
		//cancel create new room
		this.hideWaitingDivAndShowMainDiv();
	},
	//below are useful function
	appendNewRoom:function(roomName){
		var roomDiv = document.createElement('div');
		roomDiv.setAttribute('class', 'room-div');
		var span = document.createElement('span');
		span.textContent = roomName;
		var button = document.createElement('button');
		button.setAttribute('class', 'join-room-btn');
		var icon = document.createElement('i');
		icon.setAttribute('class', 'fa fa-sign-in');
		button.appendChild(icon);
		roomDiv.appendChild(span);
		roomDiv.appendChild(button);
		this.roomsDiv.appendChild(roomDiv);
	},
	changeRoomStateFromWaitingToFull:function(roomName) {
		var iRoomName = '';
		for(var i=0; i<this.roomsDiv.childElementCount; i++){
			iRoomName = this.roomsDiv.children[i].getElementsByTagName('span')[0].textContent;
			if(iRoomName===roomName){
				this.roomsDiv.children[i].getElementsByTagName('button')[0].setAttribute('class', 'full-room-btn');
				this.roomsDiv.children[i].getElementsByTagName('i')[0].setAttribute('class', 'fa fa-ban');
			}
			return;
		}

	},
	showMessageDiv:function(message){
		this.messageDiv.style.display = 'flex';
		this.messageDiv.textContent = message;
	},
	hideMessageDiv:function(){
		this.messageDiv.style.display = 'none';
	},
	showWaitingDivAndHideMainDiv:function(isJoinOther){
		this.waitingDiv.style.display = 'flex';
		this.mainDiv.style.display = 'none';
		if(isJoinOther){
			this.waitingDiv.getElementsByTagName('p')[0].textContent='joining room, please wait...'
			this.waitingDiv.getElementsByTagName('button')[0].style.display='none';
		}
	},
	hideWaitingDivAndShowMainDiv:function(){
		this.waitingDiv.style.display = 'none';
		this.mainDiv.style.display = 'flex';
	},
}

socket.on('respondClientCreateNewRoomEvent', function(data) {
	if(data.isHost){
		if(data.success){
			roomSystem.showWaitingDivAndHideMainDiv();
		}else{
			roomSystem.showMessageDiv('this name is already used');
		}
	}else{
		roomSystem.appendNewRoom(data.roomName);
	}

});



roomSystem.init();
