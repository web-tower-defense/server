var container, stats;
var camera, scene, raycaster, renderer;
var selectionLight;
var mouse = new THREE.Vector2(), cur_intersected, prev_intersected, intersected_point;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var currentlyPressedKeys = {};//new Array(300);

function init() {
	container = document.createElement( 'div' );
	container.className='game';
	document.body.appendChild( container );

	loadFont();
	initCamera();
	initScene();
	initInput()
	loadMap("map02.json")

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
	renderer.render( scene, camera );
}
