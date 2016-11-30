var player_color=[0xf0f0f0, 0xff0000, 0x0000ff]
var text = "three.js",
	height = 1,
	size = 2,
	hover = 0,
	curveSegments = 4,
	bevelThickness = 0.5,
	bevelSize = 0.5,
	bevelSegments = 3,
	bevelEnabled = false,
	font = undefined,
	fontName = "optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
	fontWeight = "bold"; // normal bold



function createTextGeo(input){

	var textGeo = new THREE.TextGeometry( input, {
		font: font,
		size: size,
		height: height,
		curveSegments: curveSegments,
		bevelThickness: bevelThickness,
		bevelSize: bevelSize,
		bevelEnabled: bevelEnabled,
		material: 0,
		extrudeMaterial: 1
	});
	textGeo.computeBoundingBox();
	textGeo.computeVertexNormals();
	// "fix" side normals by removing z-component of normals for side faces
	// (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)
	if ( ! bevelEnabled ) {
		var triangleAreaHeuristics = 0.1 * ( height * size );
		for ( var i = 0; i < textGeo.faces.length; i ++ ) {
			var face = textGeo.faces[ i ];
			if ( face.materialIndex == 1 ) {
				for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
					face.vertexNormals[ j ].z = 0;
					face.vertexNormals[ j ].normalize();
				}
				var va = textGeo.vertices[ face.a ];
				var vb = textGeo.vertices[ face.b ];
				var vc = textGeo.vertices[ face.c ];
				var s = THREE.GeometryUtils.triangleArea( va, vb, vc );
				if ( s > triangleAreaHeuristics ) {
					for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
						face.vertexNormals[ j ].copy( face.normal );
					}
				}
			}
		}
	}

	return textGeo;
}

function createTextMesh(input, id) {
	//console.log("this pos=");
	//console.log("font : "+font);
	var idColor = player_color[id];

	var material = new THREE.MultiMaterial( [
		new THREE.MeshPhongMaterial( { color: idColor, shading: THREE.FlatShading } ), // front
		new THREE.MeshPhongMaterial( { color: idColor, shading: THREE.SmoothShading } ) // side
	] );

	var textGeo = new THREE.TextGeometry( input, {
		font: font,
		size: size,
		height: height,
		curveSegments: curveSegments,
		bevelThickness: bevelThickness,
		bevelSize: bevelSize,
		bevelEnabled: bevelEnabled,
		material: 0,
		extrudeMaterial: 1
	});
	textGeo.computeBoundingBox();
	textGeo.computeVertexNormals();
	// "fix" side normals by removing z-component of normals for side faces
	// (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)
	if ( ! bevelEnabled ) {
		var triangleAreaHeuristics = 0.1 * ( height * size );
		for ( var i = 0; i < textGeo.faces.length; i ++ ) {
			var face = textGeo.faces[ i ];
			if ( face.materialIndex == 1 ) {
				for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
					face.vertexNormals[ j ].z = 0;
					face.vertexNormals[ j ].normalize();
				}
				var va = textGeo.vertices[ face.a ];
				var vb = textGeo.vertices[ face.b ];
				var vc = textGeo.vertices[ face.c ];
				var s = THREE.GeometryUtils.triangleArea( va, vb, vc );
				if ( s > triangleAreaHeuristics ) {
					for ( var j = 0; j < face.vertexNormals.length; j ++ ) {
						face.vertexNormals[ j ].copy( face.normal );
					}
				}
			}
		}
	}
	var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
	var textMesh1 = new THREE.Mesh( textGeo);
	textMesh1.material=material;
	textMesh1.position.x = centerOffset;
	textMesh1.position.y = hover;
	textMesh1.position.z = 0;
	// textMesh1.rotation.x = Math.PI ;
	// textMesh1.rotation.y = Math.PI ;

	return textMesh1;
	//scene.add( textMesh1 );
}

function loadFont() {
	var loader = new THREE.FontLoader();
	loader.load( 'fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {
		font = response;
		console.log("font : "+font);
		//var textMesh1 = createText("haha");
		//scene.add( textMesh1 );
	} );
}
