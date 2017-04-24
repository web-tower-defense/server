function Tutorial(){
	this.id = 0;
	this.scripts = [];
	this.triggers = [];
	this.stage = -1;
	this.div = 0;
	this.end = false;
	this.inited = false;
}

var TutorialSystem = new Tutorial();

Tutorial.prototype.init=function(id){
	console.log('tutorial init : ' +id );
	this.id = id;
	this.stage = 0;
	this.div = document.getElementsByClassName('tutorial_div')[0];
	//console.log(this.div);
	$.getJSON('tutorial_script.json', function(data) {
    	//console.log(data);
			TutorialSystem.scripts = data.tutorials[id-1].scripts;
			TutorialSystem.triggers = data.tutorials[id-1].triggers;
			//console.log(data);
			//console.log(this.scripts);
			//console.log(this.triggers);
			TutorialSystem.inited = true;
	});
}

Tutorial.prototype.check=function(command){
	console.log(command);
	console.log(this.triggers);
	if(this.inited === false)return;
	if(this.triggers.length === 0)return;
	if(this.end === true)return;
	if(this.triggers[this.stage].length === 1 && this.triggers[this.stage][0] === 0){
		this.active();
	}
	else if(this.triggers[this.stage].length === 1){
		if(this.triggers[this.stage][0] === command[0]){
			this.active();
		}
	}
	else if(this.triggers[this.stage].length === 2){
		if(this.triggers[this.stage][0] === command[0] && this.triggers[this.stage][1] === command[1]){
			this.active();
		}
	}

}

Tutorial.prototype.ok=function(){
	//console.log(this.div);
	pause_game = false;
	this.div.style.display = 'none';
	this.stage++;
	if(this.stage >= this.scripts.length){
		this.end = true;
	}
	if(this.end === true && gameover === true){
		document.getElementById('gameover_ui').style.display = 'block';
		document.getElementById('gameover_btn').style.display = 'block';
	}
	this.check([0]);
}

Tutorial.prototype.active=function () {
	console.log('tutorial active');
	//console.log(this);
	this.div.style.display = 'block';
	this.div.children[1].innerHTML = this.scripts[this.stage];
	pause_game = true;
};
