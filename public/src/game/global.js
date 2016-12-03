var global;

var look;
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


  var container, stats;
  var camera, scene, raycaster, renderer;
  var selectionLight;
  var mouse = new THREE.Vector2(), cur_intersected, prev_intersected, intersected_point;

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;
  var currentlyPressedKeys = {};//new Array(300);

  var dragSource=null, dragTarget=null, dragCurve;
  var mouse_pos=new Pos(0,0,0);

  var game_data={};
  var loop_times=0;
