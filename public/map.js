
var onProgress = function ( xhr ) {
	if ( xhr.lengthComputable ) {
		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
};

var onError = function ( xhr ) { };
var tmp_data;

var all_models=[];
var model_loaded=0;

function load_building_model(building,data){
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath( building.dirpath);
	mtlLoader.load( building.material.path, function( materials ) {
		materials.preload();
		console.log("load :"+building.name);
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath( building.dirpath );
		objLoader.load(building.path, function ( object ) {

			var bbox = new THREE.Box3().setFromObject(object);
			object.radius = bbox.max.x - bbox.min.x;
			object.name = "root";
			//console.log(object);
			all_models[building.name]=object;
			model_loaded++;
			if(model_loaded===data.models.length){
				for(var i = 0; i < data.buildings.length; i++){
					create_building(data.buildings[i],i,data);
				}
			}
		}, onProgress, onError );
	});
}

function create_building(building,id,data){
	if(building.hasOwnProperty('template')){
		//console.log("load template");
		var temp=data.building_template[building.template];
		//console.log("name:"+temp.name);
		if(!building.hasOwnProperty('name')&&temp.hasOwnProperty('name')){
			building.name=temp.name;
		}
		if(!building.hasOwnProperty('curUnit')&&temp.hasOwnProperty('curUnit')){
			building.curUnit=temp.curUnit;
		}
		if(!building.hasOwnProperty('maxUnit')&&temp.hasOwnProperty('maxUnit')){
			building.maxUnit=temp.maxUnit;
		}
		if(!building.hasOwnProperty('unit_vel')&&temp.hasOwnProperty('unit_vel')){
				building.unit_vel=temp.unit_vel;
		}
		if(!building.hasOwnProperty('grow_cycle')&&temp.hasOwnProperty('grow_cycle')){
				building.grow_cycle=temp.grow_cycle;
		}
		if(!building.hasOwnProperty('sent_unit_cycle')&&temp.hasOwnProperty('sent_unit_cycle')){
				building.sent_unit_cycle=temp.sent_unit_cycle;
		}
		if(!building.hasOwnProperty('scale')&&temp.hasOwnProperty('scale')){
				building.scale=temp.scale;
		}
		if(!building.hasOwnProperty('type')&&temp.hasOwnProperty('type')){
				//console.log("template_type:"+temp.type);
				building.type=temp.type;
		}
		if(!building.hasOwnProperty('unit_type')&&temp.hasOwnProperty('unit_type')){
				building.unit_type=temp.unit_type;
				//console.log("template_unit_type:"+building.unit_type);
		}
		if(!building.hasOwnProperty('unit_cost')&&temp.hasOwnProperty('unit_cost')){
				building.unit_cost=temp.unit_cost;
		}
	}
	console.log("create_building:"+building.name);
	var instance = all_models[building.name].clone();

	var pos;
	if(building.hasOwnProperty('position')){
		pos=new THREE.Vector3(building.position[0],0,-building.position[1]);
	}else{
		pos=new THREE.Vector3(0,0,0);
	}
	instance.position.set(pos.x,pos.y,pos.z);
	instance.model = building.name;
	scene.add( instance );

	var new_building = new Building();

	new_building.unitID =id;
	new_building.mesh = instance;
	new_building.mesh.unitID = new_building.unitID;
	new_building.mesh.owner = building.owner;
	new_building.pos = pos;
	new_building.curUnit = building.curUnit;
	new_building.maxUnit = building.maxUnit;
	new_building.owner = building.owner;
	//game_data.playerbuildings_count[building.owner] ++;

	if(building.hasOwnProperty('unit_vel')){
		new_building.unit_vel = building.unit_vel;
	}
	if(building.hasOwnProperty('grow_cycle')){
		new_building.grow_cycle = building.grow_cycle;
	}
	if(building.hasOwnProperty('sent_unit_cycle')){
		new_building.sent_unit_cycle = building.sent_unit_cycle;
	}
	if(building.hasOwnProperty('orbiting')){
		new_building.orbiting = building.orbiting;
	}
	if(building.hasOwnProperty('orbit_radius')){
		new_building.orbit_radius = building.orbit_radius;
	}
	if(building.hasOwnProperty('orbit_cycle')){
		new_building.orbit_cycle = building.orbit_cycle;
	}
	if(building.hasOwnProperty('orbit_angle')){
		new_building.orbit_angle = building.orbit_angle;
	}
	if(building.hasOwnProperty('type')){
		new_building.type = building.type;
	}
	if(building.hasOwnProperty('unit_type')){
		new_building.unit_type = building.unit_type;
		//console.log("unit_type:"+new_building.unit_type);
	}
	if(building.hasOwnProperty('unit_cost')){
		new_building.unit_cost = building.unit_cost;
	}
	if(building.hasOwnProperty('scale')){
		new_building.mesh.scale.x=building.scale;
		new_building.mesh.scale.y=building.scale;
		new_building.mesh.scale.z=building.scale;
	}
	var capacity_text = createTextMesh(
		new_building.curUnit.toString(),
		new_building.owner);

	capacity_text.position.set(pos.x,pos.y+5,pos.z);
	capacity_text.selectable = false;
	capacity_text.dynamic = true;
	scene.add( capacity_text );
	new_building.textMesh = capacity_text;

	new_building.init();
	game_data.buildings.push(new_building);

	//console.log(new_building);
	//outlinePass.selectedObjects.push(new_building.mesh);
	if(data.buildings.length===game_data.buildings.length){
		console.log("loading finished");
		start_game();
	}
	//console.log(outlinePass.selectedObjects);
}
function create_plane(width,height,opacity,color){
	var geometry = new THREE.PlaneGeometry(width,height);
	geometry.faceVertexUvs[0] = [];
	for(var i = 0; i < geometry.faces.length; i++){
		geometry.faceVertexUvs[0].push([
			new THREE.Vector2( 0,0 ),
			new THREE.Vector2( 0,1 ),
			new THREE.Vector2( 1,1),
				new THREE.Vector2( 1,0),
		]);
	}
	geometry.computeFaceNormals();
	geometry.dynamic = true;
	geometry.uvsNeedUpdate = true;
	var material = new THREE.MeshPhongMaterial( {
		opacity: opacity,
		color: color,
		emissive: color,
		transparent: true,
		side: THREE.DoubleSide
	});
	var plane = new THREE.Mesh( geometry, material );
	return plane;
}
function loadMap(file, AInum){
	$.getJSON(file, function(data) {
    	//console.log(data);
		tmp_data=data;
		game_data.unitLen=data.mapUnitLen;
		game_data.AI=data.AI;

		for(var i=0; i<AInum; i++){
			var ai_id=data.player_num-data.AI.length;
			//console.log('ai : '+ai_id);
			game_data.AI.push(ai_id);
		}
		/*
		console.log("AI==================");
		for(var i=0;i<game_data.AI.length;i++){
			console.log("ai="+game_data.AI[i]);
		}
		console.log("AI==================");
		*/
		//game_data.total_player=game_data.max_player+game_data.AI.length;
		game_data.total_player=data.player_num;
		console.log("load map player_num:"+data.player_num);
    var width = data.mapWidth;
    var height = data.mapHeight;
    var textureLoader = new THREE.TextureLoader();

		///*
		var plane=create_plane(4*width,4*height,0,0xffffff);
		plane.rotation.x = Math.PI / 2;
		plane.position.y = -1;
		//plane.position.x = -2*width;
		//plane.position.z = 2*height;
		scene.add( plane );
		//*/

		for(var i = 0; i < data.models.length; i++){
			load_building_model(data.models[i],data);
		}

		game_data.buildings_count = data.buildings.length;
		game_data.playerbuildings_count = [0,0,0];

	});

}
