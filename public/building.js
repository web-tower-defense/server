
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
	this.laser_beam=0;
	this.type="null";
	this.target_unit=0;
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
	if(this.type=="black_hole"){
		this.black_hole_update();
	}else if(this.type=="white_hole"){
		this.white_hole_update();
	}else if(this.type=="station"){
		this.station_update();
	}
}
Building.prototype.station_update = function(){
	if(this.laser_beam===0){
		console.log("create laser");
		this.laser_beam=new THREEx.LaserBeam();
		scene.add(this.laser_beam.object3d)
		var laserCooked	= new THREEx.LaserCooked(this.laser_beam)
	//object3d.scale.y=1.0;

	//object3d.rotation.y += 3;
	}
	var object3d = this.laser_beam.object3d;
	//
	object3d.scale.x=10.0;
	object3d.position.x	= this.pos.x;
	object3d.position.y	= this.pos.y;
	object3d.position.z	= this.pos.z;
	object3d.visible=false;
	if(this.target_unit!==0&&this.target_unit.die){
		this.target_unit=0;
	}
	var min_dis=999999;
	if(this.target_unit==0)
	for(var i = 0; i < game_data.units.length; i++){
			var unit=game_data.units[i];
			if(!unit.die&&this.owner!=unit.owner){//&&unit.a==this.a&&unit.b==this.b
				var target_pos=this.pos.clone();
				var del=target_pos.sub(unit.pos);
				if(del.length()<20.0&&del.length()<min_dis){
					min_dis=del.length();
					this.target_unit=unit;
				}
			}
	}
	if(this.target_unit!==0){
		var target_pos=this.pos.clone();
		var del=target_pos.sub(this.target_unit.pos);
		var del2=del.clone().normalize();
		//console.log("damage unit:"+i+","+unit.damage);
		this.target_unit.damage+=1;
		object3d.visible=true;
		object3d.scale.x=del.length();
		object3d.rotation.y=Math.atan2(del2.z,-del2.x);
		if(this.target_unit.damage>10){
			//console.log("kill unit");
			this.target_unit.die=true;
		}
	}
}
Building.prototype.black_hole_update = function(){
	for(var i = 0; i < game_data.units.length; i++){
			var unit=game_data.units[i];
			if(!unit.die){//&&unit.a==this.a&&unit.b==this.b
				var target_pos=this.pos.clone();
				var del=target_pos.sub(unit.pos);
				if(del.length()<50.0){
					var del2=del.clone().normalize();
					//console.log("gravity!!:"+(1.0/((del.length()+1.0)*(del.length()+1.0))));
					unit.pos.add((del2).multiplyScalar(
						100.0*(1.0/((del.length()+10.0)*(del.length()+10.0)))));
					if(del.length()<1.0){
						unit.die=true;
						console.log("gravity!!die");
					}
					//unit.freeze=true;
				}
			}
	}
}
Building.prototype.white_hole_update = function(){
	for(var i = 0; i < game_data.units.length; i++){
			var unit=game_data.units[i];
			if(!unit.die){//&&unit.a==this.a&&unit.b==this.b
				var target_pos=this.pos.clone();
				var del=target_pos.sub(unit.pos);
				if(del.length()<50.0){
					var del2=del.clone().normalize();
					//console.log("gravity!!:"+(1.0/((del.length()+1.0)*(del.length()+1.0))));
					unit.pos.add((del2).multiplyScalar(
						-100.0*(1.0/((del.length()+8.0)*(del.length()+8.0)))));
					if(del.length()<1.0){
						unit.die=true;
						console.log("gravity!!die");
					}
					//unit.freeze=true;
				}
			}
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
	if(this.type=="black_hole"||this.type=="white_hole"){
		this.textMesh.visible=false;
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
