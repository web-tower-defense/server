var game_data={};
var loop_times=0;
var command_timer=0;
var data_receive=false;
var pause_game=false;
var gameover = false;
var game_over_str=0;

var Command_data=function(roomName,commands,loop_times){
	this.roomName=roomName;
	this.commands=commands;
	this.loop_times=loop_times;
}
function sent_commands(){
	//console.log('sent_commands');
	if(!data_receive){
		console.log('sent_commands (single player)');
		game_data.web_commands=game_data.commands;
		data_receive=true;
		game_data.commands=[];
		return;
	}
	//var data=new Command_data(game_data.roomName,game_data.commands,loop_times);
	//data.unit_length=game_data.units.length;
	//game_data.socket.emit('game_command',data);
	//game_data.commands=[];

	//game_data.web_commands=data;
	//data_receive=true;
}
/*socket.on('game_command', function(data) {
	//if(data.length!==0)console.log('get game_command:'+data.length);
  if(!data_receive){
		game_data.web_commands=data;
		data_receive=true;
	}else{
		console.log("socket.on(game_command) error receive more than one!!");
	}
});*/
function handle_web_commands(){
	if(!data_receive){
		console.log("no data receive yet");
		return false;
	}
	//console.log("handle_web:"+game_data.web_commands.length);
	for(var i = 0; i < game_data.web_commands.length; i++){
		game_data.buildings[game_data.web_commands[i].selected].set_target(game_data.web_commands[i].target);
		//console.log("command:"+game_data.web_commands[i].selected+","+game_data.web_commands[i].target);
		TutorialSystem.check([game_data.web_commands[i].selected,  game_data.web_commands[i].target]);
	}
	TutorialSystem.check([0]);

	game_data.web_commands=[];
	data_receive=false;
	//console.log("handle_web_commands done:"+loop_times);
	return true;
}
var ai_loop=0;
function ai_update(){
	for(var i=0;i<game_data.AI.length;i++){
		game_data.AI[i].update();
		/*
		var id=game_data.AI[i];
		for(var j = 0; j < game_data.buildings.length; j++){
			var building=game_data.buildings[j];
			if(building.owner===id){
				if(building.curUnit>10&&(building.target===-1||building.target===j)){
					var target=-1;
					var target_dis=9999;
					for(var k = 0; k < game_data.buildings.length; k++){
						var cur=game_data.buildings[k];
						if(cur.owner!=id){
							var target_pos=cur.pos.clone();
							var dis=target_pos.sub(building.pos).length();

							if(cur.owner!==0){
								dis+=0.5*cur.curUnit;
							}else{
								dis+=cur.curUnit;
							}
							if(cur.type==="station"){
								dis+=40;
							}

							if(dis<target_dis){
								target=k;
								target_dis=dis;
							}
						}
					}
					if(target!=-1){
						game_data.commands.push(
							new Command(j,target));
					}
				}
			}
		}*/
	}
}
function game_update(){
	if(!game_start){
		console.log("game loading");
		return;
	}
	//camera.position.z = 0.8*camera.position.y;
	if(command_timer>8){
		if(!handle_web_commands()){
			if(!pause_game){
				console.log("game paused");
				pause_game=true;
			}
		}else{
			pause_game=false;
			command_timer=0;
			//console.log("update_cycle:"+loop_times);
		}
		//console.log("update_cycle:"+loop_times);
	}
	if(command_timer===0){
		sent_commands();
	}
	command_timer++;
	if(pause_game&&game_data.max_player===1){
		console.log("single player pause_game");
	}
	if(!pause_game||game_data.max_player===1){
		loop_times++;
		if(player_id===1)ai_loop++;
		if(ai_loop>10){
			ai_loop=0;
			ai_update()
		}
		for(var i = 0; i < game_data.buildings.length; i++){
			//console.log(game_data.buildings[i].owner);
				game_data.buildings[i].sent_unit();
				game_data.buildings[i].update();
				game_data.buildings[i].draw();
			//console.log("building "+game_data.buildings[i].unitID+" unit : "+game_data.buildings[i].curUnit);
		}
		for(var i = 0; i < game_data.units.length; i++){

			game_data.units[i].update();
			if(game_data.units[i].terminate==true){
				game_data.units[i].remove();
				game_data.units[i]=game_data.units[game_data.units.length-1];
				game_data.units.pop();
				if(i < game_data.units.length)game_data.units[i].update();
			}
		}
	}
	//handle_commands();
	// console.log("mouse_pos:"+mouse_pos.x+","+mouse_pos.y+","+mouse_pos.z);

	//console.log("mousepos="+game_data.mouse_pos.x+","+game_data.mouse_pos.y+","+game_data.mouse_pos.z);
	//console.log("campos="+camera.position.x+","+camera.position.y+","+camera.position.z);
	//console.log("update");
}

function game_over(win){
	gameover = true;
	var gameover_ui = document.createElement("canvas");
	gameover_ui.id = 'gameover_ui';
	var fontface =  "GoodTimes";
	var fontsize =  20;
	var borderThickness =  0;
	gameover_ui.width = 540;
	gameover_ui.height = 360;
	gameover_ui.className = "gameover_ui";
	var context = gameover_ui.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;
	context.fillStyle = "rgba(200, 200, 200, 1.0)";


	if(win){
		var str1="you win";
	}else{
		var str1="you lose";
	}
	var str2="time:";
	var secs = Math.floor((loop_times*loop_interval)/1000);
	var mins = Math.floor(secs / 60);
	secs = secs%60;
	var str3=mins+" : "+secs;
	var str4="captured:";
	var str5=("000"+game_data.players[player_id].captured_num).slice(-4);
	var str6="lost:";
	var str7=("000"+game_data.players[player_id].lost_num).slice(-4);

	context.fillText( str1, 160, fontsize + 20);
	context.fillText( str2, 50, fontsize*2 + 50);
	context.fillText( str3, 300, fontsize*2 + 50);
	context.fillText( str4, 50, fontsize*3 + 80);
	context.fillText( str5, 300, fontsize*3 + 80);
	context.fillText( str6, 50, fontsize*4 + 110);
	context.fillText( str7, 300, fontsize*4 + 110);
	document.body.appendChild(gameover_ui);

	var back_button = document.createElement("BUTTON");
	back_button.id = "gameover_btn";
	//zoom_in.appendChild(t);
	back_button.onmousedown = function(){

	};
	back_button.onmouseup = function(){
		location.reload();
	};
	document.body.appendChild(back_button);

	if(TutorialSystem.end === false){
		gameover_ui.style.display = 'none';
		back_button.style.display = 'none';
	}

	/*var spriteMap = new THREE.TextureLoader().load( "/images/gameover_panel.png" );
	var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
	var gameover_sprite = new THREE.Sprite( spriteMaterial );

	if(win){
		var str1=makeTextSprite("you win!!",{"fontsize":12});
		gameover_sprite.add(str1);
		//game_over_str.add(tmp3);
	}else{
		var str1=makeTextSprite("you lose!!",{"fontsize":12});
		gameover_sprite.add(str1);
	}


	//var time_val=10000-loop_times;
	//if(time_val<0)time_val=0;
	//var time_score=Math.floor(0.1*(time_val));
	var str2=makeTextSprite("time:"+(loop_times*loop_interval)/1000.0+" sec",{"fontsize":12});
	gameover_sprite.add(str2);

	var str3=makeTextSprite("captured num:"+game_data.players[player_id].captured_num,{"fontsize":12});
	gameover_sprite.add(str3);

	var str4=makeTextSprite("lost num:"+game_data.players[player_id].lost_num,{"fontsize":12});
	gameover_sprite.add(str4);

	gameover_sprite.selectable = false;
	gameover_sprite.dynamic = true;
	//console.log("this pos="+this.pos.x+","+this.pos.y+","+this.pos.z);
	//gameover_sprite.scale.set(1.2, 1.5, 1.0);
	var vec=look.clone();
	vec.normalize();
	vec.multiplyScalar(1.5);
	console.log(vec);
	gameover_sprite.position.set(
		camera.position.x+vec.x,
		camera.position.y+vec.y,
		camera.position.z+vec.z
	);

	scene.add(gameover_sprite);*/
	//location.reload();
}

var game_start=false;
function Player(){
	this.buildings_num=0;
	this.captured_num=0;
	this.lost_num=0;
	this.buildings_count=0;
}
function start_game(){
	init_players();
	for(var i=0;i<game_data.buildings.length;i++){
		game_data.players[game_data.buildings[i].owner].buildings_count++;
	}
	game_start=true;
}
function game_init(){
	game_data.units=[];
	game_data.buildings=[];
	game_data.commands=[];
	game_data.web_commands=[];
	game_data.players=[];
	game_data.loser_num=0;
	init_laser_pool();

}
function init_players(){
	console.log("init players player_num:"+game_data.total_player);
	for(var i=0;i<game_data.total_player+1;i++){
		game_data.players.push(new Player());
	}
}
var loop_interval=40;
function main_loop() {
	console.log("mainloop start");
	game_init();
	var audio = new Audio('./audio/music/Maximalism - Soundtrack for a Great Adventure - 05 Tenacity.mp3');
	audio.volume = 0.1;
	audio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
	}, false);
	audio.play();
	var timer = setInterval(game_update,loop_interval);
}
