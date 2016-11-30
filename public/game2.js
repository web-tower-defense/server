var container, stats;
var camera, scene, raycaster, renderer;
var mouse = new THREE.Vector2(), cur_intersected, prev_intersected;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var currentlyPressedKeys = {};//new Array(300);

function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
	camera.position.z = 10;
	camera.position.y = 30;


	
	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};
	var onError = function ( xhr ) { };
	THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath( 'obj/my_castle/' );
	mtlLoader.load( 'castle.mtl', function( materials ) {
		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath( 'obj/my_castle/' );
		objLoader.load( 'castle.obj', function ( object ) {
			//object.position.y = - 10;
			//object.scale.set(10,10,10);
			object.name = "root";
			//console.log("~name : " + object.name);
			scene.add( object );
		}, onProgress, onError );
	});


	var textureLoader = new THREE.TextureLoader();

	var texture;
	var geometry = new THREE.PlaneGeometry( 100, 100);
	var material = new THREE.MeshPhongMaterial( {
		map :textureLoader.load( "grass_green_d.jpg" ), 
		normalMap: textureLoader.load( "grass_green_n.jpg" ),
		side: THREE.DoubleSide
	});
	var plane = new THREE.Mesh( geometry, material );
	plane.position.y = -1;
	plane.rotation.x = Math.PI / 2;
	scene.add( plane );

	raycaster = new THREE.Raycaster();
	//
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	stats = new Stats();
	container.appendChild( stats.dom );

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	//
	window.addEventListener( 'resize', onWindowResize, false );

	animate();
}
function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
//
function animate() {
	requestAnimationFrame( animate );
	handleKeys();
	render();
	stats.update();
}
function render() {
	//camera.position.x += ( mouse.x - camera.position.x ) * .05;
	//camera.position.y += ( - mouse.y - camera.position.y ) * .05;

	camera.lookAt( scene.position );
	camera.updateMatrixWorld();
	// find intersections
	raycaster.setFromCamera( mouse, camera );
	//console.log("len : " + scene.children.length);
	var intersects = raycaster.intersectObjects( scene.children, true );
	//console.log("len : " + intersects.length);
	if ( intersects.length > 0 ) {
		cur_intersected = intersects[ 0 ].object;
		while(cur_intersected.parent != scene){
			//console.log("name : " + cur_intersected.name);
			cur_intersected = cur_intersected.parent;
		}
		//console.log("name : " + cur_intersected.name);
		if ( prev_intersected != cur_intersected ) {
			if ( prev_intersected ) {
				//prev_intersected.material.emissive.setHex( prev_intersected.currentHex );
			}
			//cur_intersected.currentHex = cur_intersected.material.emissive.getHex();
			//cur_intersected.material.emissive.setHex( 0x0000ff );
			cur_intersected.traverse(function(child){
				if(child.hasOwnProperty("material")){
					if(child.material.hasOwnProperty("emissive")){
						//child.material.emissive.setHex( 0x0000ff );
						//child.material.emissive.intensity = 5.0;
					}
				}
			});
			prev_intersected = cur_intersected;
			//console.log("name : " + prev_intersected.my_name);
			//intersects[0].object.material.transparent = true;
    		//intersects[0].object.material.opacity = 0.1;
		}
	} else {
		//if ( prev_intersected ) prev_intersected.material.emissive.setHex( prev_intersected.currentHex );
		//prev_intersected = null;
	}
	renderer.render( scene, camera );
}

