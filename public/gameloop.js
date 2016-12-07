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
/*
function handle_commands(){
	for(var i = 0; i < game_data.commands.length; i++){
		game_data.buildings[game_data.commands[i].selected].target=game_data.commands[i].target;
		console.log("command:"+game_data.commands[i].selected+","+game_data.commands[i].target);
	}
	game_data.commands=[];
}
*/
function sent_commands(){

	var data=new Command_data(game_data.roomName,game_data.commands,loop_times);
	data.unit_length=game_data.units.length;
	game_data.socket.emit('game_command',data);
	game_data.commands=[];
}
socket.on('game_command', function(data) {
	if(data.length!==0)console.log('get game_command:'+data.length);

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
	for(var i = 0; i < game_data.web_commands.length; i++){
		game_data.buildings[game_data.web_commands[i].selected].set_target(game_data.web_commands[i].target);
		console.log("command:"+game_data.web_commands[i].selected+","+game_data.web_commands[i].target);
	}
	game_data.web_commands=[];
	data_receive=false;
	//console.log("handle_web_commands done:"+loop_times);
	return true;
}
function game_update(){
	if(!game_start){
		console.log("game loading");
		return;
	}
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

	if(!pause_game){
		loop_times++;
		for(var i = 0; i < game_data.buildings.length; i++){

			//console.log(game_data.buildings[i].owner);
				game_data.buildings[i].sent_unit();
				game_data.buildings[i].update();
				game_data.buildings[i].draw();
			//console.log("building "+game_data.buildings[i].unitID+" unit : "+game_data.buildings[i].curUnit);
		}
		for(var i = 0; i < game_data.units.length; i++){

			game_data.units[i].update();
			if(game_data.units[i].die==true){
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
var game_start=false;
function game_init(){
	game_data.units=[];
	game_data.buildings=[];
	game_data.commands=[];
	game_data.web_commands=[];
	game_data.players=[];
}
function main_loop() {
	console.log("mainloop start");
	game_init();
	var timer = setInterval(game_update,40);
}
