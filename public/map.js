
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

			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.geometry.center();
					child.geometry.computeBoundingSphere();
					child.material.side = THREE.DoubleSide;
					child.receiveShadow = true;
					child.castShadow = true;
				}
			} );

			object.name = "root";
			//console.log(object);
			all_models[building.name]=object;
			model_loaded++;
			if(model_loaded===data.models.length){
				for(var i = 0; i < data.buildings.length; i++){
					create_building(data.buildings[i],i);
				}
			}
		}, onProgress, onError );
	});
}

function create_building(building,id){
	console.log("create_building:"+building.name);
	var instance = all_models[building.name].clone();
	var pos=new Pos(building.position[0],0,-building.position[1]);
	instance.position.set(pos.x,pos.y,pos.z);
	instance.unitID = id;
	scene.add( instance );

	var new_building = new Building();
	new_building.mesh = instance;
	new_building.pos=pos;
	new_building.unitID = instance.unitID;
	new_building.curUnit = building.curUnit;
	new_building.maxUnit = building.maxUnit;
	new_building.owner= building.owner;
	if(building.hasOwnProperty('unit_vel')){
		new_building.unit_vel = building.unit_vel;
	}
	if(building.hasOwnProperty('grow_cycle')){
		new_building.grow_cycle = building.grow_cycle;
	}
	if(building.hasOwnProperty('sent_unit_cycle')){
		new_building.sent_unit_cycle = building.sent_unit_cycle;
	}
	var capacity_text = createTextMesh(new_building.curUnit.toString(), new_building.unitID);
	capacity_text.position.set(pos.x,pos.y+5,pos.z);
	capacity_text.selectable = false;
	capacity_text.dynamic = true;
	scene.add( capacity_text );
	new_building.textMesh = capacity_text;
	game_data.buildings.push(new_building);
	//console.log(new_building);
	outlinePass.selectedObjects.push(new_building.mesh);
	console.log(outlinePass.selectedObjects);
}

function loadMap(file){
	$.getJSON(file, function(data) {
    	//console.log(data);
		tmp_data=data;
		game_data.unitLen=data.mapUnitLen;
    var width = data.mapWidth;
    var height = data.mapHeight;
    var textureLoader = new THREE.TextureLoader();

		var geometry = new THREE.PlaneGeometry( width*4, height*4);
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
			opacity: 0.0,
			transparent: true,
			side: THREE.DoubleSide
		});
		var plane = new THREE.Mesh( geometry, material );
		plane.rotation.x = Math.PI / 2;
		plane.position.y = -1;
		plane.position.x = width;
		plane.position.z = -height;
		scene.add( plane );

		for(var i = 0; i < data.models.length; i++){
			load_building_model(data.models[i],data);
		}
	});

}
