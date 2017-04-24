var player_color=[0xf0f0f0,0xff000,0x00ff00,0x00ffff]
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
function get_player_color(id){
	var idColor = player_color[id];
	if(id===player_id){
		idColor=0x1060ff;
	}
	return idColor;
}
function createTextMesh(input, id) {
	//console.log("this pos=");
	//console.log("font : "+font);

	var idColor = get_player_color(id);
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
	textMesh1.rotation.x-=0.5;
	return textMesh1;
	//scene.add( textMesh1 );
}

function loadFont() {
	var loader = new THREE.FontLoader();
	loader.load( 'fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {
		font = response;
		//console.log("font : "+font);
		//var textMesh1 = createText("haha");
		//scene.add( textMesh1 );
	} );
}

function makeTextSprite( message, parameters )
{
	 if ( parameters === undefined ) parameters = {};
	 var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "GoodTimes";
	 var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 40;
	 var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 0;
	 var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	 var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
	 var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:200, g:200, b:200, a:1.0 };

	 var canvas = document.createElement('canvas');
	 var context = canvas.getContext('2d');
	 context.font = "Bold " + fontsize + "px " + fontface;
	 var metrics = context.measureText( message );
	 var textWidth = metrics.width;

	 context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
	 context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

	 //context.lineWidth = borderThickness;
	 //roundRect(context, borderThickness/2, borderThickness/2, (textWidth + borderThickness) * 1.1, fontsize * 1.4 + borderThickness, 8);

	 context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
	 context.fillText( message, borderThickness, fontsize + borderThickness);

	 var texture = new THREE.Texture(canvas)
	 texture.minFilter = THREE.LinearFilter;
	 texture.needsUpdate = true;

	 var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
	 var sprite = new THREE.Sprite( spriteMaterial );
	 sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
	 return sprite;
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }

}
