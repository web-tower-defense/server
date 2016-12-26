var dragSource=null, dragTarget=null;
var dragCurve, dragCurveMesh, dragCurveMaterial;
var selection_sphere, selectedPlanet=null, targetPlanet=null;
var selec_mesh,click_mesh,sent_unit_line;
var mouse = new THREE.Vector2(), prev_mouse = new THREE.Vector2();
var mouse_pos=new Pos(0,0,0);
var mousewheelevt;
var zoom_in, zoom_out;
function update(){

}

function zoomIn(){
	if(camera.position.y > 1 )
		camera.position.y --;

	if(zoom_in.down === true){
		setTimeout(zoomIn, 25);
	}
}

function zoomOut(){
	if(camera.position.y < 500 )
		camera.position.y ++;

	if(zoom_out.down === true){
		setTimeout(zoomOut, 25);
	}
}

function initInput(){

	zoom_in = document.createElement("BUTTON");
	var t = document.createTextNode("zoom in");
	zoom_in.className = "zoom_in";
	//zoom_in.appendChild(t);
	zoom_in.onmousedown = function(){
		zoom_in.down = true;
		zoomIn();
	};
	zoom_in.onmouseup = function(){
		zoom_in.down = false;
	};
	document.body.appendChild(zoom_in);

	zoom_out = document.createElement("BUTTON");
	t = document.createTextNode("zoom out");
	zoom_out.className = "zoom_out";
	//zoom_out.appendChild(t);
	zoom_out.onmousedown = function(){
		zoom_out.down = true;
		zoomOut();
	};
	zoom_out.onmouseup = function(){
		zoom_out.down = false;
	};
	document.body.appendChild(zoom_out);

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'touchmove', touchMove, false );
	document.addEventListener( 'touchstart', handleTouchStart, false );
	document.addEventListener( 'touchend', handleTouchEnd, false );
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	container.onmousedown = handleMouseDown;
	container.onmouseup = handleMouseUp;
	//
	window.addEventListener( 'resize', onWindowResize, false );
	container.addEventListener('dragstart', onDragStart, false);

	mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
	if (document.attachEvent) //if IE (and Opera depending on user setting)
	    $('.game').bind("on"+mousewheelevt, handleWheel);
	else if (document.addEventListener) //WC3 browsers
			$('.game').bind(mousewheelevt, handleWheel);


	var curve = new THREE.CatmullRomCurve3( [
		new THREE.Vector3( 0, 0, 0 ),
		new THREE.Vector3( 0, 0, 0 ),
		new THREE.Vector3( 0, 0, 0 )
	] );
	var geometry = new THREE.Geometry();
	geometry.vertices = curve.getPoints( 50 );
	dragCurve = new THREE.MeshLine();
	dragCurve.setGeometry( geometry );
	var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );
	console.log(player_color[player_id]);
	dragCurveMaterial = new THREE.MeshLineMaterial( {
			color: new THREE.Color( "rgb(255, 2, 2)" ),
			opacity: 1,
			resolution: resolution,
			sizeAttenuation: 1,
			lineWidth: 1,
			near: 1,
			far: 100000,
			depthTest: true,
			blending: THREE.AdditiveBlending,
			transparent: false,
			side: THREE.DoubleSide
		});

	dragCurveMesh = new THREE.Mesh( dragCurve.geometry, dragCurveMaterial );
	dragCurveMesh.dynamic = true;
	dragCurveMesh.visible = true;
	dragCurveMesh.traverse( function ( object ) { object.visible = true; } );
	dragCurveMesh.selectable = false;
	scene.add( dragCurveMesh );

	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath( "obj/planets/" );
	mtlLoader.load( "wire_sphere2.mtl", function( materials ) {
		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath( "obj/planets/" );
		objLoader.load("wire_sphere2.obj", function ( object ) {

			object.name = "root";
			//console.log(object);
			object.scale.set(10,10,10);
			selection_sphere=object;
			selection_sphere.visible = false;
			selection_sphere.dynamic = true;
			scene.add(selection_sphere);

		}, onProgress, onError );
	});

	selec_mesh=circle_mesh(4,0x00ffff);
	selec_mesh.selectable=false;
	click_mesh=filled_circle_mesh(4.5,0xff00ff);
	click_mesh.selectable=false;


	scene.add(selec_mesh);
	scene.add(click_mesh);

	{
	var lineMaterial = new THREE.MeshBasicMaterial({
		color: 0xff00ff
	});
	var geometry = new THREE.Geometry();
  geometry.vertices[0]=new THREE.Vector3(0, 0, 0);
	geometry.vertices[1]=new THREE.Vector3(1, 0, 0);
	//geometry.vertices[1]=new THREE.Vector3(0, 0, 0);
	sent_unit_line=new THREE.Line(geometry,lineMaterial);
	sent_unit_line.geometry.dynamic = true;
	scene.add(sent_unit_line);
	}
}


function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	//composer.setSize( window.innerWidth, window.innerHeight );
	//effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight );
}

function onDocumentMouseMove( event ) {
	event.preventDefault();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	//console.log(mouse);
	//console.log(prev_mouse);

	if(dragSource !== null){

		if(prev_mouse !== null){
			var deltaX = mouse.x - prev_mouse.x;
			var deltaZ = mouse.y - prev_mouse.y;
			//console.log("deltaX : "+deltaX+"  deltaY : "+deltaY);
			camera.position.x -= deltaX*10;
			camera.position.z += deltaZ*10;
		}
		prev_mouse.x = mouse.x;
		prev_mouse.y = mouse.y;
	}
}

function touchMove( event ) {
	event.preventDefault();
	if(!event.touches.length)
		return;

	mouse.x = ( event.touches[0].pageX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.touches[0].pageY / window.innerHeight ) * 2 + 1;

	//console.log("touchmove");
	//console.log(mouse);
	console.log(prev_mouse);

	if(dragSource !== null){

		if(prev_mouse !== null){
			var deltaX = mouse.x - prev_mouse.x;
			var deltaZ = mouse.y - prev_mouse.y;
			//console.log("deltaX : "+deltaX+"  deltaY : "+deltaZ);
			camera.position.x -= deltaX*25;
			camera.position.z += deltaZ*25;
		}
		else{
			prev_mouse = new THREE.Vector2();
		}
		prev_mouse.x = mouse.x;
		prev_mouse.y = mouse.y;
	}
}

var input=[];
function handleKeyDown(event) {
  //alert(event.key);
  currentlyPressedKeys[event.key] = true;
}

function handleKeyUp(event) {
  currentlyPressedKeys[event.key] = false;
  input[event.key] = true;
}
function get_input(key) {
	if(input[key]=== true){
		input[key]=false;
		return true;
	}
	return false;
}
var selected=-1;
function handleKeys() {
	if (currentlyPressedKeys["a"] == true) {// Left cursor key
		if(camera.position.x > -200 )camera.position.x -= 1;
	}
	if (currentlyPressedKeys["d"] == true) {// Right cursor key
		if(camera.position.x < 200 )camera.position.x += 1;
	}
	if (currentlyPressedKeys["s"] == true) {// Up cursor key
		if(camera.position.z < 200 )camera.position.z += 1;
		if(camera.position.z == 0){
			camera.position.z = 1;
		}
		dragCurveMesh.traverse( function ( object ) { object.visible = true; } );
	}
	if (currentlyPressedKeys["w"] == true) {// Down cursor key
		if(camera.position.z > -200 )camera.position.z -= 1;
		if(camera.position.z == 0){
			camera.position.z = -1;
		}
		dragCurveMesh.traverse( function ( object ) { object.visible = false; } );
	}
}

function onDragStart(){
	console.log("drag");
}
var click_timer=0;
function clickObject(obj){
	if(click_timer>0)return;
	selected_timer=0;
	if(selectedPlanet === null && game_data.buildings[obj.unitID].owner === player_id){
		//console.log(obj.model);
		//console.log(all_models[obj.model]);
		//var elementToChange = document.getElementsByTagName("body")[0];
		//http://wiki-devel.sugarlabs.org/images/e/e2/Arrow.cur saber.cur

		selection_sphere.visible = true;
		selection_sphere.scale.set(all_models[obj.model].radius,
																all_models[obj.model].radius,
																all_models[obj.model].radius);
		obj.add(selection_sphere);
		selectedPlanet = obj;


		click_timer=10;
		click_mesh.position.set(cur_intersected.position.x,
			cur_intersected.position.y,cur_intersected.position.z);
		click_mesh.visible=true;
	}else if(selectedPlanet!==null){
		targetPlanet = obj;

		game_data.commands.push(new Command(selectedPlanet.unitID,  targetPlanet.unitID));


		click_mesh.position.set(cur_intersected.position.x,
			cur_intersected.position.y,cur_intersected.position.z);
		click_mesh.visible=true;

		var pos=game_data.buildings[selectedPlanet.unitID].pos.clone();
		var pos2=game_data.buildings[targetPlanet.unitID].pos.clone();
		sent_unit_line.position.set(pos.x,pos.y,pos.z);
		var del=pos.sub(pos2);
		var len=del.length();

		sent_unit_line.scale.x=len;
		sent_unit_line.rotation.y=Math.atan2(del.z,-del.x);
		this.sent_unit_line.visible=true;
		click_timer=15;


		selectedPlanet = null;
		targetPlanet = null;
		selection_sphere.visible = false;

	}
}
//var seleted_id=-1;
function handleMouseDown(){
	//console.log("mouse down");
	dragSource = cur_intersected;
	if(dragSource === null || dragSource===undefined){
		dragSource = "none";
	}
	prev_mouse = new THREE.Vector2();
	prev_mouse.x = mouse.x;
	prev_mouse.y = mouse.y;
}
var deselected_ready=false;
function handleMouseUp(){
	//console.log("mouse up");

	dragTarget = cur_intersected;

	if(dragTarget === dragSource && dragTarget.hasOwnProperty("unitID")){
		deselected_ready=false;
		clickObject(dragSource);
	}
	if(selectedPlanet&&!dragTarget.hasOwnProperty("unitID")){
		if(deselected_ready===false){
			deselected_ready=true;
		}else{
			console.log("deselected");
			selectedPlanet=null;
			selection_sphere.visible = false;
		}

	}
	dragSource = null;
	dragTarget = null;
	prev_mouse = null;
}

function handleTouchStart(){
	console.log("touch start");
	dragSource = cur_intersected;
	if(dragSource === null || dragSource===undefined){
		dragSource = "none";
	}
	console.log(prev_mouse);
}

function handleTouchEnd(){
	console.log("touch end");

	dragSource = null;
	dragTarget = null;
	prev_mouse = null;
	console.log(prev_mouse);
}

function handleClick(){
	console.log("click");
}

var handleWheel = function (e){
	if(mousewheelevt === "mousewheel"){
		if(e.originalEvent.wheelDelta /120 > 0) {
	        //console.log('scrolling up !');
	        if(camera.position.y < 500 )camera.position.y += e.originalEvent.wheelDelta/40;
	    }
	    else{
	        //console.log('scrolling down !');
	        if(camera.position.y > 1 )camera.position.y += e.originalEvent.wheelDelta/40;
	    }
		}
		if(mousewheelevt === "DOMMouseScroll"){
			if(e.originalEvent.detail > 0) {
		        //console.log('scrolling up !');
		        if(camera.position.y >1 )camera.position.y --;
		    }
		    else{
		        //console.log('scrolling down !');
		        if(camera.position.y < 500 )camera.position.y ++;
		    }
			}
}
var selected_timer=0;
function rayCast(){

	if(click_timer>0){
		click_timer--;
		selec_mesh.visible=false;
		return;
	}else{
		//console.log("hide");
		sent_unit_line.visible=false;
		click_mesh.visible=false;
	}

	raycaster.setFromCamera( mouse, camera );
	//console.log("len : " + scene.children.length);
	var intersected_id = -1;
	var intersects = raycaster.intersectObjects( scene.children, true );
	//console.log("len : " + intersects.length);
	if ( intersects.length > 0 ) {

		for(var i=0; i<intersects.length; i++){
			var cur=intersects[i].object;
			while(cur.parent != scene){
				cur = cur.parent;
			}
			if("selectable" in cur){
				if(cur.selectable === false){
					continue;
				}
				else{
					intersected_id = i;
					break;
				}
			}
			else{
				intersected_id = i;
				break;
			}
		}
		if(intersected_id === -1)return;


		var tmp_intersected = intersects[intersected_id].object;
		while(tmp_intersected.parent != scene){
			//console.log("name : " + cur_intersected.name);
			tmp_intersected = tmp_intersected.parent;
		}

		if(selected_timer>0){
			//selec_mesh.position.set(cur_intersected.position.x,
				//cur_intersected.position.y,cur_intersected.position.z);
			selected_timer--;
		}else{
			cur_intersected = tmp_intersected;
			intersected_point = intersects[intersected_id].point;
		}

		if(cur_intersected.hasOwnProperty("unitID")&&
				(selectedPlanet !== null ||
					game_data.buildings[cur_intersected.unitID].owner === player_id)){

			selec_mesh.position.set(cur_intersected.position.x,
				cur_intersected.position.y,cur_intersected.position.z);
			selec_mesh.visible=true;
			document.getElementsByTagName("body")[0].style.cursor =
			 "url('./cursor/curselec.cur'), auto";
			if(cur_intersected===tmp_intersected){
				selected_timer=15;
				//console.log("selected");
			}else{
				//console.log("not selected");
			}
		}else{
			selec_mesh.visible=false;
			document.getElementsByTagName("body")[0].style.cursor =
			 "url('./cursor/cur1089.cur'), auto";
		}


		//console.log("name : " + cur_intersected.name);
		if ( prev_intersected != cur_intersected ) {
			if ( prev_intersected ) {
				//prev_intersected.material.emissive.setHex( prev_intersected.currentHex );
			}
			//cur_intersected.currentHex = cur_intersected.material.emissive.getHex();
			//cur_intersected.material.emissive.setHex( 0x0000ff );

			//console.log(cur_intersected.position);
			mouse_pos=new Pos(
				cur_intersected.position.x,
				cur_intersected.position.y,
				cur_intersected.position.z);

			selectionLight.position.x = cur_intersected.position.x;
			selectionLight.position.y = cur_intersected.position.y;
			selectionLight.position.z = cur_intersected.position.z;
			selectionLight.matrixWorldNeedsUpdate = true;
			selectionLight.visible = true;

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
		prev_intersected = null;
		cur_intersected = null;
		selectionLight.visible = false;
		intersected_point = null;
	}
}
