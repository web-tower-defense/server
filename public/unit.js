var unit_mesh;

function Pos(_x,_y,_z){
	this.x=_x;
	this.y=_y;
	this.z=_z;
}
Pos.prototype.mult=function(val){
	return new Pos(val*this.x,val*this.y,val*this.z);
}
Pos.prototype.add=function(val){
	return new Pos(val.x+this.x,val.y+this.y,val.z+this.z);
}
Pos.prototype.sub=function(val){
	return new Pos(this.x-val.x,this.y-val.y,this.z-val.z);
}
Pos.prototype.len=function(){
	return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z);
}
Pos.prototype.unit_vec=function(){
	var pos=new Pos(this.x,this.y,this.z);
	pos=pos.mult(1.0/this.len());
	return pos;
}

function loadUnit(){
	var mtlLoader = new THREE.MTLLoader();

	mtlLoader.setPath("obj/unit/");
	mtlLoader.load( "spaceship1.mtl", function( materials ) {
		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath("obj/unit/");
		objLoader.load("spaceship1.obj", function ( object ) {

			//console.log(object);
			unit_mesh = object;
			unit_mesh.selectable = false;
			unit_mesh.scale.set(0.2, 0.2, 0.2);

		}, onProgress, onError );
	});
}

function Unit(x,y,z,_owner,_target,vel){
	this.die=false;
	this.owner = _owner;
	this.mesh = unit_mesh.clone();//createTextMesh("o",this.owner);
	//console.log("ss");
	this.mesh.selectable = false;
	this.mesh.dynamic = true;
	scene.add(this.mesh);
	this.target=_target;
	this.pos=new THREE.Vector3(x,y,z);
	this.terminate=false;
	this.terminate_timer=5;
	this.dead_light=0;
	this.a=0;
	this.b=0;
	this.vel=vel;
	this.freeze=false;
	this.damage=0;
	//this.target_pos=game_data.buildings[this.target].pos;
}

Unit.prototype.check_collision = function(){
		for(var i = 0; i < game_data.units.length; i++){
				var unit=game_data.units[i];
				if(unit.owner!==this.owner&&!unit.die){//&&unit.a==this.a&&unit.b==this.b
					if((this.pos.clone().sub(unit.pos)).length()<0.5){
						this.die=true;
						game_data.units[i].die=true;
					}
				}
		}
}
Unit.prototype.update = function(){

	if(this.die){
		/*
		if(this.dead_light===0){
			this.dead_light = new THREE.PointLight( 0xff0000, 1, 100 );
			this.dead_light.visible = true;
			scene.add(this.dead_light);
		}
		*/
		this.terminate_timer--;
		//this.pos.y+=0.02;
		//this.mesh.position.set(this.pos.x,this.pos.y,this.pos.z);
		if(this.terminate_timer<=0){
			this.terminate=true;
		}
		return;
	}

	var target_pos=game_data.buildings[this.target].pos.clone();
	var del=target_pos.sub(this.pos);
	var del2=del.clone().normalize();
	this.mesh.rotation.y=Math.atan2(del2.z,-del2.x);//+0.5*Math.PI;
	//console.log("atan2="+Math.atan2(del.z,del.x));
	if(del.length()<1.2*this.vel+1.0){
		this.die=true;
		//console.log("unit die");
		if(game_data.buildings[this.target].owner===this.owner){
			//console.log(game_data.buildings[this.target].owner+","+this.owner);
			game_data.buildings[this.target].curUnit++;
		}else{
			if(game_data.buildings[this.target].curUnit==0){
				game_data.buildings[this.target].captured(this.owner);
				//game_data.buildings[this.target].owner=this.owner;
			}else{
				game_data.buildings[this.target].curUnit--;
			}
		}
	}else{
		//console.log("unit dis="+del.len());
	}
	if(!this.die){
		this.check_collision();
	}
	if(this.freeze){
		this.freeze=false;
	}else{
		this.pos=this.pos.add((del2).multiplyScalar(this.vel));
	}

	this.mesh.position.set(this.pos.x,this.pos.y,this.pos.z);
	//console.log("Unit.prototype.update pos="+this.pos.x.toString()+","+this.pos.y.toString()+","+this.pos.z.toString());
}

Unit.prototype.remove = function(){
	//clearScene(this.mesh);
	//this.mesh.geometry.dispose();
	//this.mesh.dispose();
	scene.remove(this.mesh);
	//if(this.dead_light!==0){
		//scene.remove(this.dead_light);
	//}
}

clearScene = function (obj) {
    if (obj instanceof THREE.Mesh)
    {
        obj.geometry.dispose();
        obj.geometry = null;
        obj.material.dispose();
        obj.material = null;
        obj.dispose(); // required in r69dev to remove references from the renderer.
        obj = null;
    }
    else
    {
        if (obj.children !== undefined) {
            while (obj.children.length > 0) {
                this.clearScene(obj.children[0]);
                obj.remove(obj.children[0]);
            }
        }
    }
}
