var dragSource=null, dragTarget=null, dragCurve;
var mouse_pos=new Pos(0,0,0);
function update(){

}

function initInput(){
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.onkeydown = handleKeyDown;
	document.onkeyup = handleKeyUp;
	container.onmousedown = handleMouseDown;
	container.onmouseup = handleMouseUp;
	//
	window.addEventListener( 'resize', onWindowResize, false );
	container.addEventListener('dragstart', onDragStart, false);
	$('.game').bind('mousewheel',handleWheel);


	var curve = new THREE.CatmullRomCurve3( [
		new THREE.Vector3( 20, 0, -20 ),
		new THREE.Vector3( 10, 10, -10 ),
		new THREE.Vector3( 0, 0, 0 )
	] );
	var geometry = new THREE.Geometry();
	geometry.vertices = curve.getPoints( 50 );
	var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
	//Create the final Object3d to add to the scene
	dragCurve = new THREE.Line( geometry, material );
	dragCurve.dynamic = true;
	dragCurve.visible = false;
	scene.add( dragCurve );
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

	if(dragSource != null){
		//console.log(intersected_point);
		var curve = new THREE.CatmullRomCurve3( [
			new THREE.Vector3( dragSource.position.x, dragSource.position.y, dragSource.position.z ),
			new THREE.Vector3( (dragSource.position.x + intersected_point.x)/2,
								20,
								(dragSource.position.z + intersected_point.z)/2 ),
			new THREE.Vector3( intersected_point.x, intersected_point.y, intersected_point.z)
		] );
		var geometry = new THREE.Geometry();
		geometry.vertices = curve.getPoints( 50 );
		//Create the final Object3d to add to the scene
		dragCurve.geometry = geometry;
		dragCurve.visible = true;
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
	}
	if (currentlyPressedKeys["w"] == true) {// Down cursor key
		if(camera.position.z > -200 )camera.position.z -= 1;
		if(camera.position.z == 0){
			camera.position.z = -1;
		}
	}
	if (get_input("0")) {// Down cursor key
		if(selected===-1){
			selected=0;
		}else{
			game_data.commands.push(new Command(selected,0));
			selected=-1;
		}
	}
	if (get_input("1")) {// Down cursor key
		if(selected===-1){
			selected=1;
		}else{
			game_data.commands.push(new Command(selected,1));
			selected=-1;
		}
	}
	if (get_input("2")) {// Down cursor key
		if(selected===-1){
			selected=2;
		}else{
			game_data.commands.push(new Command(selected,2));
			selected=-1;
		}
	}
}

function onDragStart(){
	console.log("drag");
}

function clickObject(obj){

}
var seleted_id=-1;
function handleMouseDown(){
	//console.log("down");
	dragSource = cur_intersected;



	for(var i=0;i<game_data.buildings.length;i++){
			if(mouse_pos.sub(game_data.buildings[i].pos).len()<1.0){
				seleted_id=i;
			}
	}


}

function handleMouseUp(){
	if(seleted_id!==-1){
		var target_id=-1;
		for(var i=0;i<game_data.buildings.length;i++){
				if(mouse_pos.sub(game_data.buildings[i].pos).len()<1.0){
					target_id=i;
				}
		}
		if(target_id!==-1)game_data.commands.push(new Command(seleted_id,target_id));
	}



	//console.log("up");
	dragTarget = cur_intersected;
	console.log("drag : "+dragSource.unitID+" to "+dragTarget.unitID);
	if(dragTarget === dragSource){
		clickObject(dragSource);
	}
	else{
		/*var curve = new THREE.CatmullRomCurve3( [
			new THREE.Vector3( 20, 0, -20 ),
			new THREE.Vector3( 10, 10, -10 ),
			new THREE.Vector3( dragTarget.position.x, dragTarget.position.y, dragTarget.position.z)
		] );
		var geometry = new THREE.Geometry();
		geometry.vertices = curve.getPoints( 50 );
		//Create the final Object3d to add to the scene
		dragCurve.geometry = geometry;*/
	}

	dragSource = null;
	dragTarget = null;
	dragCurve.visible = false;
}

function handleClick(){
	console.log("click");
}

var handleWheel = function (e){
	if(e.originalEvent.wheelDelta /120 > 0) {
        //console.log('scrolling up !');
        if(camera.position.y < 500 )camera.position.y += e.originalEvent.wheelDelta/40;
    }
    else{
        //console.log('scrolling down !');
        if(camera.position.y > 1 )camera.position.y += e.originalEvent.wheelDelta/40;
    }
}

function rayCast(){
	raycaster.setFromCamera( mouse, camera );
	//console.log("len : " + scene.children.length);
	var intersects = raycaster.intersectObjects( scene.children, true );
	//console.log("len : " + intersects.length);
	if ( intersects.length > 0 ) {
		cur_intersected = intersects[ 0 ].object;
		intersected_point = intersects[ 0 ].point;

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

			console.log(cur_intersected.position);
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
