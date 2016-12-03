
function init() {
	container = document.createElement( 'div' );
	container.className='game';
	document.body.appendChild( container );

	loadFont();
	initCamera();
	initScene();
	initInput();
	loadMap("map01.json");

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
