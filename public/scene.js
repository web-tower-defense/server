
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

	var particle;
	var material = new THREE.SpriteMaterial( {
		map: new THREE.CanvasTexture( generateSprite() ),
		blending: THREE.AdditiveBlending
	} );
	for ( var i = 0; i < 100; i++ ) {
		particle = new THREE.Sprite( material );
		initParticle( particle );
		scene.add( particle );
	}



	raycaster = new THREE.Raycaster();
	//
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );

	stats = new Stats();
	container.appendChild( stats.dom );

}

function generateSprite() {
		var canvas = document.createElement( 'canvas' );
		canvas.width = 16;
		canvas.height = 16;
		var context = canvas.getContext( '2d' );
		var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
		gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
		gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
		gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
		gradient.addColorStop( 1, 'rgba(0,0,0,1)' );
		context.fillStyle = gradient;
		context.fillRect( 0, 0, canvas.width, canvas.height );
		return canvas;
	}

	function initParticle( particle ) {
		var particle = this instanceof THREE.Sprite ? this : particle;
		particle.position.set( Math.random() * 200 - 100,
											Math.random() * 100 - 70,
											Math.random() * -200 + 70 );
		particle.scale.x = particle.scale.y = Math.random() * 5;
}
