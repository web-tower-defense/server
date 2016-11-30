
var look;

function initCamera(){
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.x = 45;
	camera.position.z = -10;
	camera.position.y = 20;
	//look angle
	look = new THREE.Vector3(0, -5, -10);
	console.log("campos="+camera.position.x+","+camera.position.z);
}
