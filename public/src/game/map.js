
var onProgress = function ( xhr ) {
	if ( xhr.lengthComputable ) {
		var percentComplete = xhr.loaded / xhr.total * 100;
		console.log( Math.round(percentComplete, 2) + '% downloaded' );
	}
};

var onError = function ( xhr ) { };
var tmp_data;
function loadBuilding(building){

	var mtlLoader = new THREE.MTLLoader();

	mtlLoader.setPath( 'obj/planets/' );
	mtlLoader.load( 'Planet2.mtl', function( materials ) {
		materials.preload();
		console.log("load : Planet2.mtl");
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath( 'obj/planets/' );
		objLoader.load( 'Planet2.obj', function ( object ) {
			console.log("load : Planet2.obj");
			//object.position.y = - 10;
			//object.scale.set(10,10,10);
			object.name = "root";
			//console.log("~name : " + object.name);
			//scene.add( object );

			console.log("building.positions.length : "+building.positions.length);

			for(var j = 0; j < building.positions.length; j++){
				var instance = object.clone();
				var material = new THREE.MultiMaterial( [
					new THREE.MeshPhongMaterial( { color: player_color[tmp_data.buildings[j].owner], shading: THREE.FlatShading } ), // front
					new THREE.MeshPhongMaterial( { color: player_color[tmp_data.buildings[j].owner], shading: THREE.SmoothShading } ) // side
				] );

				console.log("positions : "+building.positions[j]);
				var pos=new Pos(building.positions[j][0]*game_data.unitLen,
					0,
					-building.positions[j][1]*game_data.unitLen);
				instance.position.set(
					pos.x,
					pos.y,
					pos.z
				);

				instance.unitID = building.unitIDs[j];
				instance.material=material;
    			scene.add( instance );

    			var new_building = new Building();
    			new_building.mesh = instance;
					new_building.pos=pos;
    			new_building.unitID = j;//instance.unitID;
    			new_building.curUnit = building.curUnits[j];
    			new_building.maxUnit = building.maxUnits[j];

				new_building.owner=tmp_data.buildings[j].owner;
    			var capacity_text = createTextMesh(new_building.curUnit.toString(), new_building.unitID);
    			capacity_text.position.set(
					pos.x,
					pos.y+5,
					pos.z
				);
				capacity_text.selectable = false;
				capacity_text.dynamic = true;
    			scene.add( capacity_text );
				//scene.remove( capacity_text );
				//scene.add( capacity_text );
    			new_building.textMesh = capacity_text;
    			game_data.buildings.push(new_building);
			}

		}, onProgress, onError );
	});
}

function loadMap(file){
	$.getJSON(file, function(data) {
    	//console.log(data);
		tmp_data=data;
		game_data.unitLen=data.mapUnitLen;
    	var width = data.mapWidth;
    	var height = data.mapHeight;



    	var textureLoader = new THREE.TextureLoader();

		/*var geometry = new THREE.PlaneGeometry( width*game_data.unitLen, height*game_data.unitLen, width, height);
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
			map :textureLoader.load( "grass_green_d.jpg" ),
			normalMap: textureLoader.load( "grass_green_n.jpg" ),
			side: THREE.DoubleSide
		});
		var plane = new THREE.Mesh( geometry, material );
		plane.rotation.x = Math.PI / 2;
		plane.position.y = -1;
		plane.position.x = width*game_data.unitLen/2;
		plane.position.z = -height*game_data.unitLen/2;
		scene.add( plane );*/

		for(var i = 0; i < data.buildings.length; i++){
			var building=new Building();
			building.id=data.buildings[i].id;
			building.name=data.buildings[i].name;
			building.owner=data.buildings[i].owner;
			//game_data.buildings.push(building);
			//console.log("game_data.buildings.push(building)");
		}
		for(var i = 0; i < data.models.length; i++){
			data.models[i].positions = [];
			data.models[i].unitIDs = [];
			data.models[i].curUnits = [];
			data.models[i].maxUnits = [];
			for(var j = 0; j < data.buildings.length; j++){
				if(data.models[i].name === data.buildings[j].name){
					data.models[i].positions.push(data.buildings[j].position);
					data.models[i].unitIDs.push(data.buildings[j].id);
					data.models[i].curUnits.push(data.buildings[j].curUnit);
					data.models[i].maxUnits.push(data.buildings[j].maxUnit);
				}
			}
			loadBuilding(data.models[i]);

		}
	});

}
