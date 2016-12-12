
function Building(){
	this.owner = 0;
	this.unitID = -1;
	this.maxUnit = 1;
	this.curUnit = 0;
	this.growthSpeed = 1;
	this.mesh = 0;
	this.textMesh = 0;
	this.target=-1;
	this.sent_unit_timer=0;
	this.recruit_timer=0;
	this.unit_vel=0.2;
	this.sent_unit_cycle=8;
	this.grow_cycle=20;
	this.pos=new THREE.Vector3(0,0,0);
	this.path=[];
	this.prev_str="";
	this.orbit_angle=0;
	this.orbiting=-1;
	this.orbit_radius=15;
	this.orbit_cycle=1200;
	this.sent_unit_num=0;
}
Building.prototype.update = function(){
	this.mesh.rotation.y+=0.03;
	//this.pos.x+=0.005;
	if(this.orbiting!==-1){
		//var target_pos=game_data.buildings[this.orbiting].pos.clone();
		var del_vec=new THREE.Vector3(this.orbit_radius,0,0);//target_pos.sub(this.pos);
		var axis = new THREE.Vector3(0,1,0);
		var angle = 360/this.orbit_cycle;
		this.orbit_angle+=angle;
		if(this.orbit_angle>360)this.orbit_angle-=360;

		del_vec.applyAxisAngle(axis,(Math.PI/180)*this.orbit_angle);
		var pos_o=game_data.buildings[this.orbiting].pos.clone();
		this.pos=pos_o.sub((del_vec.normalize()).multiplyScalar(this.orbit_radius));
	}
	this.mesh.position.set(this.pos.x,this.pos.y,this.pos.z);
	this.textMesh.position.set(
		this.pos.x,
		this.pos.y+5,
		this.pos.z
	);
	this.recruit_timer++;
	if(this.recruit_timer>this.grow_cycle){
		this.recruit_timer=0;
		this.grow();
	}
}
Building.prototype.grow = function(){
	if(this.curUnit < this.maxUnit&&this.owner>0){
		this.curUnit++;
		//console.log("this pos="+this.pos.x+","+this.pos.y+","+this.pos.z);
		//this.textMesh.geometry = createTextGeo(this.curUnit.toString()+"/"+this.maxUnit.toString());
	}
}
Building.prototype.draw = function(){
	var cur_str=this.curUnit.toString();

	if(cur_str!==this.prev_str){
		scene.remove(this.textMesh);
		this.textMesh.geometry.dispose();

		//this.textMesh.material.dispose();
		this.prev_str=cur_str;
		this.textMesh =  createTextMesh(this.prev_str,this.owner);
		//this.textMesh.rotation.x=-1.5;
		this.textMesh.selectable = false;
		this.textMesh.dynamic = true;
		//console.log("this pos="+this.pos.x+","+this.pos.y+","+this.pos.z);
		this.textMesh.position.set(
			this.pos.x,
			this.pos.y+5,
			this.pos.z
		);
		scene.add(this.textMesh);
	}
	//this.textMesh.geometry = createTextGeo("P"+this.owner+":"+this.curUnit.toString()+"/"+this.maxUnit.toString());

}
Building.prototype.captured=function(new_owner){
	game_data.playerbuildings_count[this.owner] --;
	game_data.playerbuildings_count[new_owner] ++;

	if(game_data.playerbuildings_count[this.owner] === 0){
		if(player_id === this.owner){
			alert("YOU LOSE");
      location.reload();
		}else{
			alert("YOU WIN");
      location.reload();
		}
	}

	this.owner=new_owner;
	this.mesh.owner = new_owner;
	this.target=-1;
}
Building.prototype.set_target=function(id){
	this.sent_unit_num=this.curUnit/2;
	this.target=id;
}
Building.prototype.sent_unit = function(){
	//console.log("try sent_unit");
	if(this.sent_unit_timer>0)this.sent_unit_timer--;
	if(this.sent_unit_num<=0)this.target=-1;
	if(this.sent_unit_timer==0&&this.curUnit>0&&this.target!==-1&&this.target!==this.unitID){//
		//console.log("sent from:"+this.unitID+"to:"+this.target);
		this.sent_unit_num--;
		this.curUnit--;
		this.sent_unit_timer=this.sent_unit_cycle;
		var unit=new Unit(this.pos.x,this.pos.y,this.pos.z,this.owner,this.target,this.unit_vel);
		if(this.target>this.unitID){
			unit.a=this.target;
			unit.b=this.unitID;
		}else{
			unit.b=this.target;
			unit.a=this.unitID;
		}
		game_data.units.push(unit);
		//console.log("Building.prototype.sent_unit");
		//console.log("pos="+this.pos.x.toString()+","+this.pos.y.toString()+","+this.pos.z.toString());
	}else{
		//console.log("Building.prototype.sent_unit fail");
		//if(!(this.cur_Unit>0))console.log("this.cur_Unit<=0:"+this.curUnit.toString());
		//if((this.target===-1))console.log("target="+this.target.toString());
	}
}
