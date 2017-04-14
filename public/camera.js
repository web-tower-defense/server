var camera_freeze;
var look;

function initCamera(){
	camera_freeze = false;
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );

	camera.position.x = 0;
	camera.position.y = 80;
	camera.position.z = 0.8*camera.position.y;
		//look angle
	look = new THREE.Vector3(-camera.position.x,-camera.position.y,-camera.position.z);

	console.log("campos="+camera.position.x+","+camera.position.z);
}
