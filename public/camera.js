
var look;

function initCamera(){
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	if(player_id===1){
		camera.position.x = 0;
		camera.position.y = 60;
		camera.position.z = 90;
		//look angle
		look = new THREE.Vector3(-camera.position.x,-camera.position.y,-camera.position.z);
	}else{
		camera.position.x = 0;
		camera.position.y = 60;
		camera.position.z = 90;
		//look angle
		look = new THREE.Vector3(-camera.position.x,-camera.position.y,-camera.position.z);
	}




	console.log("campos="+camera.position.x+","+camera.position.z);
}
