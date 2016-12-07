var container, stats;
var camera, scene, raycaster, renderer, controls;
var selectionLight;
var mouse = new THREE.Vector2(), cur_intersected, prev_intersected, intersected_point;
var player_id;
var composer, effectFXAA, outlinePass, outlinePass;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var currentlyPressedKeys = {};//new Array(300);
function aiGameInit() {

}
function init(socket, data) {


	game_data.socket=socket;
	game_data.roomName=data.name; //data["roomName"];
	var test="init ";
	//console.log(data);
	//console.log(socket);
	player_id = data.player_id;//data[socket.id];
	/*player_color[1] = new THREE.Color( "rgb(255, 2, 2)" );
	player_color[2] = new THREE.Color( "rgb(2, 2, 255)" );
	player_color[3] = new THREE.Color( "rgb(2, 255, 255)" );*/

	console.log("roomName : "+game_data.roomName);
	console.log("player : "+player_id);

	game_data.socket.emit('gameInit',test);

	container = document.createElement( 'div' );
	container.className='game';
	document.body.appendChild( container );

	loadFont();
	initCamera();
	initScene();
	initInput();
	loadUnit();
	loadMap("map02.json");

	animate();
	main_loop();
}
function animate() {
	requestAnimationFrame( animate );
	handleKeys();
	render();
	stats.update();
}

function render() {
	//camera.position.x += ( mouse.x - camera.position.x ) * .05;
	//camera.position.y += ( - mouse.y - camera.position.y ) * .05;
	var lookAtPos = new THREE.Vector3();
	lookAtPos.addVectors(camera.position, look);
	camera.lookAt(lookAtPos);//( scene.position );
	camera.updateMatrixWorld();
	// find intersections
	rayCast();
	//composer.render();
	renderer.render( scene, camera );
}
