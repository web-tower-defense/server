var game_data={};
var loop_times=0;
var command_timer=0;
var data_receive=false;
var pause_game=false;
var Command_data=function(roomName,commands,loop_times){
	this.roomName=roomName;
	this.commands=commands;
	this.loop_times=loop_times;
}
function sent_commands(){
	if(game_data.max_player===1&&!data_receive){
		game_data.web_commands=game_data.commands;
		data_receive=true;
		game_data.commands=[];
		return;
	}
	var data=new Command_data(game_data.roomName,game_data.commands,loop_times);
	data.unit_length=game_data.units.length;
	game_data.socket.emit('game_command',data);
	game_data.commands=[];
}
socket.on('game_command', function(data) {
	//if(data.length!==0)console.log('get game_command:'+data.length);
  if(!data_receive){
		game_data.web_commands=data;
		data_receive=true;
	}else{
		console.log("socket.on(game_command) error receive more than one!!");
	}
});
function handle_web_commands(){
	if(!data_receive){
		console.log("no data receive yet");
		return false;
	}
	//console.log("handle_web:"+game_data.web_commands.length);
	for(var i = 0; i < game_data.web_commands.length; i++){
		game_data.buildings[game_data.web_commands[i].selected].set_target(game_data.web_commands[i].target);
		//console.log("command:"+game_data.web_commands[i].selected+","+game_data.web_commands[i].target);
	}
	game_data.web_commands=[];
	data_receive=false;
	//console.log("handle_web_commands done:"+loop_times);
	return true;
}
var ai_loop=0;
function ai_update(){
	for(var i=0;i<game_data.AI.length;i++){
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
		}
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
var game_over_str=0;

function game_over(win){

	var back_ui = document.createElement("BUTTON");
	back_ui.className = "back_to_menu";
	//zoom_in.appendChild(t);
	back_ui.onmousedown = function(){

	};
	back_ui.onmouseup = function(){
		location.reload();
	};
	document.body.appendChild(back_ui);



	game_over_str=create_plane(30,25,0.7,0x00ffff);
	if(win){
		var str=createTextMesh("you win!!",1);
		str.rotation.x=0;
		str.position.y=7;
		game_over_str.add(str);
		//game_over_str.add(tmp3);
	}else{
		var str=createTextMesh("you lose!!",1);
		str.rotation.x=0;
		str.position.y=7;
		game_over_str.add(str);
	}


	//var time_val=10000-loop_times;
	//if(time_val<0)time_val=0;
	//var time_score=Math.floor(0.1*(time_val));
	var str=createTextMesh("time:"+(loop_times*loop_interval)/1000.0+" sec",1);
	str.rotation.x=0;
	str.position.y=4;
	game_over_str.add(str);

	var str=createTextMesh("captured num:"+game_data.players[player_id].captured_num,1);
	str.rotation.x=0;
	str.position.y=1;
	game_over_str.add(str);

	var str=createTextMesh("lost num:"+game_data.players[player_id].lost_num,1);
	str.rotation.x=0;
	str.position.y=-2;
	game_over_str.add(str);

	game_over_str.selectable = false;
	//console.log("this pos="+this.pos.x+","+this.pos.y+","+this.pos.z);
	var vec=look.clone();
	vec.normalize();
	game_over_str.rotation.x=Math.atan2(vec.y,-vec.z);
	vec.multiplyScalar(25.0);
	game_over_str.position.set(
		camera.position.x+vec.x+15,
		camera.position.y+vec.y,
		camera.position.z+vec.z
	);
	scene.add(game_over_str);
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
