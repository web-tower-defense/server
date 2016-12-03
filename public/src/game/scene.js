
function initScene(){
	var path = "textures/cube/skybox2/";
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];
	var reflectionCube = new THREE.CubeTextureLoader().load( urls );
	reflectionCube.format = THREE.RGBFormat;

	// scene
	scene = new THREE.Scene();
	scene.background = reflectionCube;

	var ambient = new THREE.AmbientLight( 0x444444 );
	ambient.intensity = 1.5;
	scene.add( ambient );
	var directionalLight = new THREE.DirectionalLight( 0xffeedd );
	directionalLight.position.set( 0, 0, 1 ).normalize();
	//directionalLight.intensity = 1.0;
	scene.add( directionalLight );
	// model
	selectionLight = new THREE.PointLight( 0xff0000, 1, 100 );
	selectionLight.visible = false;
	scene.add( selectionLight );


	raycaster = new THREE.Raycaster();
	//
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	stats = new Stats();
	container.appendChild( stats.dom );

}