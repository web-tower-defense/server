
function initScene(){
	var path = "textures/cube/skybox4/";
	var format = '.png';
	var urls = [
			path + 'right' + format, path + 'left' + format,
			path + 'top' + format, path + 'bot' + format,
			path + 'front' + format, path + 'back' + format
		];
	var reflectionCube = new THREE.CubeTextureLoader().load( urls );
	reflectionCube.format = THREE.RGBFormat;

	// scene
	scene = new THREE.Scene();
	scene.background = reflectionCube;

	scene2D = new THREE.Scene();

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
		particle.selectable = false;
		initParticle( particle );
		scene.add( particle );
	}

	raycaster = new THREE.Raycaster();
	//
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.id = "game_canvas";
	container.appendChild( renderer.domElement );

	/*stats = new Stats();
	container.appendChild( stats.dom );*/

	/*composer = new THREE.EffectComposer( renderer );

	renderPass = new THREE.RenderPass( scene, camera );
	composer.addPass( renderPass );
	outlinePass = new THREE.OutlinePass( new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
	outlinePass.edgeStrength = 2;
	outlinePass.edgeGlow  = 0;
	outlinePass.edgeThickness  = 1.0;
	outlinePass.pulsePeriod  = 0;
	outlinePass.visibleEdgeColor = {r:100, g:100, b:100};
	outlinePass.hiddenEdgeColor = {r:100, g:100, b:100};
	composer.addPass( outlinePass );
	var outlineTextureOnLoad = function ( texture ) {
		outlinePass.patternTexture = texture;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
	};
	var loader = new THREE.TextureLoader();
	// load a resource
	loader.load(
		// resource URL
		'textures/tri_pattern.jpg',
		// Function when resource is loaded
		outlineTextureOnLoad
	);

	effectFXAA = new THREE.ShaderPass(THREE.CopyShader);
	effectFXAA.renderToScreen = true;
	composer.addPass(effectFXAA);*/

	/*var gameover_ui = document.createElement("canvas");
	var fontface =  "GoodTimes";
	var fontsize =  40;
	var borderThickness =  0;
	gameover_ui.width = 450;
	gameover_ui.height = 600;
	gameover_ui.className = "gameover_ui";
	var context = gameover_ui.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;
	context.fillStyle = "rgba(200, 200, 200, 1.0)";
	var str1="win";
	var str2="time:";
	var str3="captured num:";
	var str4="lost num:";

	var imageObj = new Image("/images/gameover_panel.png");
  imageObj.onload = function() {
    context.drawImage(this, 0, 0);
  };
  imageObj.src = "/images/gameover_panel.png";

	context.fillText( str1, 50, fontsize + 10);
	context.fillText( str2, 50, fontsize*2 + 20);
	context.fillText( str3, 50, fontsize*3 + 30);
	context.fillText( str4, 50, fontsize*4 + 40);
	document.body.appendChild(gameover_ui);*/

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
