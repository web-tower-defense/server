var game_data={};
var loop_times=0;
var command_timer=0;
var Command_data=function(roomName,commands,loop_times){
	this.roomName=roomName;
	this.commands=commands;
	this.loop_times=loop_times;
}
function handle_commands(){
	for(var i = 0; i < game_data.commands.length; i++){
		game_data.buildings[game_data.commands[i].selected].target=game_data.commands[i].target;
		console.log("command:"+game_data.commands[i].selected+","+game_data.commands[i].target);
	}
	game_data.commands=[];
}
function sent_commands(){
	var data=new Command_data(game_data.roomName,game_data.commands,loop_times);
	game_data.socket.emit('game_command',data);
	game_data.commands=[];
}
socket.on('game_command', function(data) {
	console.log('get game_command:'+data.length);
	if(data.length!==0)game_data.web_commands=data;
});
function handle_web_commands(){
	for(var i = 0; i < game_data.web_commands.length; i++){
		game_data.buildings[game_data.web_commands[i].selected].target=game_data.web_commands[i].target;
		console.log("command:"+game_data.web_commands[i].selected+","+game_data.web_commands[i].target);
	}
	game_data.web_commands=[];
}
function game_update(){
	loop_times++;

	if(command_timer===1){
		sent_commands();
	}
	if(command_timer===20){
		handle_web_commands();
		command_timer=0;
	}
	command_timer++;

	//handle_commands();

	for(var i = 0; i < game_data.buildings.length; i++){
		//console.log(game_data.buildings[i].name);
		//console.log(game_data.buildings[i].owner);
		game_data.buildings[i].sent_unit();
		if(loop_times%10==0)game_data.buildings[i].update();
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
	// console.log("mouse_pos:"+mouse_pos.x+","+mouse_pos.y+","+mouse_pos.z);

	//console.log("mousepos="+game_data.mouse_pos.x+","+game_data.mouse_pos.y+","+game_data.mouse_pos.z);
	//console.log("campos="+camera.position.x+","+camera.position.y+","+camera.position.z);
	//console.log("update");
}
function game_init(){
	game_data.units=[];
	game_data.buildings=[];
	game_data.commands=[];
	game_data.web_commands=[];
}
function main_loop() {
	console.log("mainloop start");
	game_init();
	var timer = setInterval(game_update,50);
}
