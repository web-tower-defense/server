var container, stats;
var camera, scene, raycaster, renderer, controls;
var selectionLight;
var cur_intersected, prev_intersected, intersected_point;
var player_id;
var composer, effectFXAA, outlinePass, outlinePass;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var currentlyPressedKeys = {};//new Array(300);
function aiGameInit() {

}

function pre_init() {
	
}

function init(data, AInum) {

	game_data.max_player=data.maxPlayer;
	console.log("max_player:"+game_data.max_player);
	//console.log(data);
	player_id = 1;
	/*player_color[1] = new THREE.Color( "rgb(255, 2, 2)" );
	player_color[2] = new THREE.Color( "rgb(2, 2, 255)" );
	player_color[3] = new THREE.Color( "rgb(2, 255, 255)" );*/

	//console.log("roomName : "+game_data.roomName);
	console.log("player : "+player_id);

	container = document.createElement( 'div' );
	container.className='game';
	document.body.appendChild( container );

	loadFont();
	initCamera();
	initScene();
	initInput();
	loadUnit();
	var map_name="maps/"+data.mapName;
	console.log("init map_name:"+map_name);
	loadMap(map_name, AInum);
	animate();

	main_loop();
}
function animate() {
	requestAnimationFrame( animate );
	handleKeys();
	render();
	//stats.update();
}

function render() {
	//camera.position.x += ( mouse.x - camera.position.x ) * .05;
	//camera.position.y += ( - mouse.y - camera.position.y ) * .05;

	//camera.position.x = 0;
	//camera.position.y = 80;
	//camera.position.z = 0.8*camera.position.y;
		//look angle
	//look.z=-0.8*camera.position.y;
  //look.y=-camera.position.y;
	if(game_over_str!==0){
		var vec=look.clone();
		vec.normalize();
		vec.multiplyScalar(30.0);
		game_over_str.position.set(
			camera.position.x+vec.x,
			camera.position.y+vec.y,
			camera.position.z+vec.z
		);
	}
	var lookAtPos = new THREE.Vector3();
	lookAtPos.addVectors(camera.position, look);
	camera.lookAt(lookAtPos);//( scene.position );
	camera.updateMatrixWorld();
	// find intersections
	rayCast();
	//composer.render();
	renderer.render( scene, camera );
	//look = new THREE.Vector3(-camera.position.x,-camera.position.y,-camera.position.z);
}
