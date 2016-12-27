
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
	this.unit_die_timer=0;
	this.unit_vel=0.2;
	this.sent_unit_cycle=20;
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
	this.weapon_cool_down=0;

	this.ex_mesh=0;

	this.black_hole_mesh=0;
	this.black_hole_mesh2=0;

	this.white_hole_mesh=0;
	this.white_hole_mesh2=0;

	this.owner_mesh=0;

	this.sent_unit_line=0;
}
Building.prototype.init=function(){
	// idColor = get_player_color(this.owner);
	//var mesh = circle_mesh(10,idColor);
	//this.mesh.add(mesh);
	///*
	var lineMaterial = new THREE.MeshBasicMaterial({
		color: get_player_color(this.owner)
	});
	var geometry = new THREE.Geometry();
	geometry.vertices[0]=new THREE.Vector3(0, 0, 0);
	geometry.vertices[1]=new THREE.Vector3(1, 0, 0);
	this.sent_unit_line=new THREE.Line(geometry,lineMaterial);
	this.sent_unit_line.geometry.dynamic = true;
	scene.add(this.sent_unit_line);

	this.owner_mesh=filled_circle_mesh(3.8,get_player_color(this.owner));
	this.owner_mesh.material.transparent=true;
	this.owner_mesh.material.opacity=0.2;
	this.owner_mesh.scale.set(3.8/this.mesh.scale.x,
		3.8/this.mesh.scale.y,3.8/this.mesh.scale.z)
	this.mesh.add(this.owner_mesh);

	if(this.type=="black_hole"){
		this.init_black_hole();
	}else if(this.type=="white_hole"){
		this.init_white_hole();
	}else if(this.type=="station"){
		this.init_station();
	}
}
function circle_geo(radius,segments){
	var geometry=new THREE.CircleGeometry( radius, segments );
	geometry.vertices.shift();
	return geometry;
}
var circle_geometry=new circle_geo(1,64);
function circle_mesh(radius,color){
	var material = new THREE.MeshPhongMaterial( {
		opacity: 80.0,
		color: color,
		emissive: color,
		transparent: true,
		side: THREE.DoubleSide
	});

	var mesh=new THREE.Line(circle_geometry, material );
	mesh.rotation.x=Math.PI*0.5;
	mesh.scale.x=radius;
	mesh.scale.y=radius;
	return mesh;
}
function filled_circle_geo(radius,segments){
	var geometry=new THREE.CircleGeometry( radius, segments );
	return geometry;
}
var filled_circle_geometry=new filled_circle_geo(1,64);
function filled_circle_mesh(radius,color){
	var material = new THREE.MeshPhongMaterial( {
		opacity: 80.0,
		color: color,
		emissive: color,
		transparent: true,
		side: THREE.DoubleSide
	});

	var mesh=new THREE.Mesh(filled_circle_geometry, material );
	mesh.rotation.x=Math.PI*0.5;
	mesh.scale.x=radius;
	mesh.scale.y=radius;
	return mesh;
}

Building.prototype.init_black_hole=function(){
	this.owner_mesh.visible=false;

	this.mesh.selectable=false;
	this.black_hole_mesh=circle_mesh(15,0xffffff);
	this.black_hole_mesh2=circle_mesh(15,0xffffff);

	this.mesh.add(this.black_hole_mesh);
	this.mesh.add(this.black_hole_mesh2);
}
Building.prototype.init_station=function(){
	this.ex_mesh=circle_mesh(15,0xff0000);
	this.ex_mesh.selectable=false;
	scene.add(this.ex_mesh);
}
Building.prototype.init_white_hole=function(){
	this.owner_mesh.visible=false;
	this.mesh.selectable=false;
	this.white_hole_mesh=circle_mesh(15,0xffffff);
	this.white_hole_mesh2=circle_mesh(15,0xffffff);

	this.mesh.add(this.white_hole_mesh);
	this.mesh.add(this.white_hole_mesh2);
}
Building.prototype.update = function(){
	if(this.target!==-1){
		var pos=game_data.buildings[this.unitID].pos.clone();
		var pos2=game_data.buildings[this.target].pos.clone();
		this.sent_unit_line.position.set(pos.x,pos.y,pos.z);
		var del=pos.sub(pos2);
		var len=del.length();

		this.sent_unit_line.scale.x=len;
		this.sent_unit_line.rotation.y=Math.atan2(del.z,-del.x);
		this.sent_unit_line.visible=true;
	}else{
		this.sent_unit_line.visible=false;
	}
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

	this.recruit_timer++;
	if(this.recruit_timer>this.grow_cycle){
		this.recruit_timer=0;
		this.grow();
	}
	this.unit_die_timer++;
	if(this.unit_die_timer>30){
		this.unit_die_timer=0;
		this.unit_die();
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
	this.ex_mesh.position.set(this.pos.x,this.pos.y,this.pos.z) ;
	if(this.laser_beam===0){
		this.laser_beam=new THREEx.LaserBeam();
		this.laser_beam.object3d.selectable=false;
		var laserCooked	= new THREEx.LaserCooked(this.laser_beam);
		scene.add(this.laser_beam.object3d);
		laserCooked.selectable=false;
	}
	var object3d = this.laser_beam.object3d;

	object3d.position.set(this.pos.x,this.pos.y,this.pos.z) ;
	//object3d.visible=false;
	if(this.target_unit!==0&&this.target_unit.die){
		this.target_unit=0;
	}
	var min_dis=999999;
	if(this.weapon_cool_down>0)this.weapon_cool_down--;
	if(this.weapon_cool_down===0&&this.target_unit==0){
		for(var i = 0; i < game_data.units.length; i++){
			var unit=game_data.units[i];
			if(!unit.die&&this.owner!=unit.owner){//&&unit.a==this.a&&unit.b==this.b
				var target_pos=this.pos.clone();
				var del=target_pos.sub(unit.pos);
				var len=del.length();
				if(len<15.0&&len<min_dis){
					min_dis=len;
					this.target_unit=unit;
				}
			}
		}
		//console.log("search target!!");
	}
	//object3d.visible=true;
	object3d.scale.set(0.001,0.001,0.001);
	if(this.target_unit!==0){
		var target_pos=this.pos.clone();
		var del=target_pos.sub(this.target_unit.pos);
		var del2=del.clone().normalize();

		//object3d.scale.x=del.length();
		object3d.scale.set(del.length(),1,1);
		object3d.rotation.y=Math.atan2(del2.z,-del2.x);
		this.target_unit.damage+=1;
		//object3d.visible=true;

		if(this.target_unit.damage>3){
			//console.log("kill unit");
			this.target_unit.killed=true;
			this.target_unit.die=true;
			this.target_unit=0;
			var del=this.curUnit;
			if(del>50)del=50;
			del*=0.2;
			this.weapon_cool_down=22-del;
		}
	}
}
Building.prototype.black_hole_update = function(){
	this.black_hole_mesh2.scale.x-=0.3;
	this.black_hole_mesh2.scale.y-=0.3;
	if(this.black_hole_mesh2.scale.x<0.1){
		this.black_hole_mesh2.scale.x=15.0;
	}
	if(this.black_hole_mesh2.scale.y<0.1){
		this.black_hole_mesh2.scale.y=15.0;
	}
	for(var i = 0; i < game_data.units.length; i++){
			var unit=game_data.units[i];
			if(!unit.die){//&&unit.a==this.a&&unit.b==this.b
				var target_pos=this.pos.clone();
				var del=target_pos.sub(unit.pos);
				if(del.length()<15.0){
					var del2=del.clone().normalize();
					//console.log("gravity!!:"+(1.0/((del.length()+1.0)*(del.length()+1.0))));
					unit.pos.add((del2).multiplyScalar(
						100.0*(1.0/((del.length()+10.0)*(del.length()+10.0)))));
					if(del.length()<1.0){
						unit.die=true;
						//console.log("gravity!!die");
					}
					//unit.freeze=true;
				}
			}
	}
}
Building.prototype.white_hole_update = function(){
	this.white_hole_mesh2.scale.x+=0.3;
	this.white_hole_mesh2.scale.y+=0.3;
	if(this.white_hole_mesh2.scale.x>15.0){
		this.white_hole_mesh2.scale.x=0.1;
	}
	if(this.white_hole_mesh2.scale.y>15.0){
		this.white_hole_mesh2.scale.y=0.1;
	}
	for(var i = 0; i < game_data.units.length; i++){
			var unit=game_data.units[i];
			if(!unit.die){//&&unit.a==this.a&&unit.b==this.b
				var target_pos=this.pos.clone();
				var del=target_pos.sub(unit.pos);
				if(del.length()<15.0){
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
		this.curUnit+=1;
		//console.log("this pos="+this.pos.x+","+this.pos.y+","+this.pos.z);
		//this.textMesh.geometry = createTextGeo(this.curUnit.toString()+"/"+this.maxUnit.toString());
	}
}
Building.prototype.unit_die = function(){
	if(this.curUnit > this.maxUnit&&this.owner>0){
		this.curUnit--;
		//console.log("this pos="+this.pos.x+","+this.pos.y+","+this.pos.z);
		//this.textMesh.geometry = createTextGeo(this.curUnit.toString()+"/"+this.maxUnit.toString());
	}
}
Building.prototype.draw = function(){
	var cur_str=this.curUnit.toString()+"/"+this.maxUnit.toString();

	if(cur_str!==this.prev_str){
		scene.remove(this.textMesh);
		this.textMesh.geometry.dispose();

		//this.textMesh.material.dispose();
		this.prev_str=cur_str;
		this.textMesh=createTextMesh(this.prev_str,this.owner);
		//this.textMesh.rotation.x=-1.5;
		this.textMesh.selectable = false;
		this.textMesh.dynamic = true;
		//console.log("this pos="+this.pos.x+","+this.pos.y+","+this.pos.z);
		this.textMesh.position.set(
			this.pos.x-1.0,
			this.pos.y+3.5,
			this.pos.z
		);
		scene.add(this.textMesh);
	}
	this.textMesh.position.set(
		this.pos.x-1.0,
		this.pos.y+3.5,
		this.pos.z
	);
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

	this.sent_unit_line.material.color.setHex(get_player_color(this.owner));
	this.owner_mesh.material.color.setHex(get_player_color(this.owner));
	this.owner_mesh.material.emissive.setHex(get_player_color(this.owner));
}
Building.prototype.set_target=function(id){
	if(id===this.unitID){
		id=-1;
	}
	this.sent_unit_num=this.curUnit/2;
	this.target=id;
}
Building.prototype.sent_unit = function(){
	//console.log("try sent_unit");
	if(this.sent_unit_timer>0)this.sent_unit_timer--;
	if(this.sent_unit_num<=0)this.target=-1;
	if(this.sent_unit_timer==0&&this.curUnit>0&&this.target!==-1){//
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
