function AI(level, id){
	this.id = id;
	if(level == 'idle'){
		this.update = idle_ai_update;
	}
	if(level == 'easy'){
		this.update = easy_ai_update;
	}
	if(level == 'normal'){
		this.update = normal_ai_update;
	}
	if(level == 'hard'){
		this.update = hard_ai_update;
	}
}

AI.prototype.init=function(){
}

function idle_ai_update(){
	console.log('idle...');

}

function easy_ai_update(){
	var id=this.id;
	
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

function normal_ai_update(){

}

function hard_ai_update(){

}