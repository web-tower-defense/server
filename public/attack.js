function find_target(owner,pos,range){
	var min_dis=999999;
	var target_unit=0;
	for(var i = 0; i < game_data.units.length; i++){
		var unit=game_data.units[i];
		if(!unit.die&&owner!=unit.owner){//&&unit.a==this.a&&unit.b==this.b
			var target_pos=pos.clone();
			var del=target_pos.sub(unit.pos);
			var len=del.length();
			if(len<range&&len<min_dis){
				min_dis=len;
				target_unit=unit;
			}
		}
	}
	return target_unit;
}
var laser_pool=[];
function create_laser(){
  var laser_beam=new THREEx.LaserBeam();
  laser_beam.object3d.selectable=false;
  var laserCooked	= new THREEx.LaserCooked(laser_beam);
  scene.add(laser_beam.object3d);
  laserCooked.selectable=false;
  laser_beam.avaliable=true;
  laser_beam.object3d.visible=false;
  return laser_beam;
}
function get_laser(){
  var laser=0;
  for(var i=0;i<laser_pool.length;i++){
    if(laser_pool[i].avaliable){
      laser=laser_pool[i];
      break;
    }
  }
  if(laser===0){
    laser=create_laser();
    laser_pool.push(laser);
  }

  laser.avaliable=false;
  laser.object3d.visible=true;
  return laser;
}
function init_laser_pool(){
  for(var i=0;i<12;i++){
    laser=create_laser();
    laser_pool.push(laser);
  }
}
function free_laser(laser){
  laser.avaliable=true;
  laser.object3d.visible=false;
}
function LaserWeapon(){
  this.laser_beam=get_laser();
  this.atk_range_mesh=circle_mesh(15,0xff0000);
	this.atk_range_mesh.selectable=false;
	scene.add(this.atk_range_mesh);

  this.target_unit=0;
  this.weapon_cool_down=0;
  this.attack_timer=0;
}
LaserWeapon.prototype.remove = function(){
  scene.remove(this.atk_range_mesh);
  free_laser(this.laser_beam);
}
LaserWeapon.prototype.update = function(pos,owner,attack_range,cool_down){
  this.atk_range_mesh.position.set(pos.x,pos.y,pos.z);
  this.atk_range_mesh.scale.set(attack_range,attack_range,attack_range);
  this.atk_range_mesh.material.color.setHex(get_player_color(owner));
  this.atk_range_mesh.material.emissive.setHex(get_player_color(owner));
  var object3d = this.laser_beam.object3d;
	object3d.position.set(pos.x,pos.y,pos.z) ;
	object3d.scale.set(0.001,0.001,0.001);
  if(this.target_unit!==0&&this.target_unit.die){
		this.target_unit=0;
	}
  if(this.weapon_cool_down>0)this.weapon_cool_down--;

	if(this.weapon_cool_down<=0&&this.target_unit==0){
		this.target_unit=find_target(owner,pos,attack_range);
	}
  if(this.target_unit!==0){
		var target_pos=pos.clone();
		var del=target_pos.sub(this.target_unit.pos);
		var del2=del.clone().normalize();

		object3d.scale.set(del.length(),4,4);
		object3d.rotation.y=Math.atan2(del2.z,-del2.x);
		this.target_unit.damage(1);
    this.attack_timer++;
    /*
		if(this.target_unit.hp<=0){
			//console.log("kill unit");
			this.target_unit.killed=true;
			this.target_unit.die=true;
			this.target_unit=0;

			this.weapon_cool_down=cool_down;
			//console.log("cool_down:"+this.weapon_cool_down);
		}*/
	}
  if(this.attack_timer>=3){
    this.target_unit=0;
    this.weapon_cool_down=cool_down;
    this.attack_timer=0;
  }

}
