var renderer;
var scene;
var camera;
var clock;
var landscape;

var max_radius = 40;
var canvas_size = 1800;
var mesh_size = 128;
var max_height = 400;

var camOrbit = 0;
var camAltitude = 0;
var heightTexture;

var dataColor;
var skyColor;

var terrainShaderVert = "varying vec2 UV;  varying float y;  uniform sampler2D heightmap;  void main() {    UV = uv;    vec4 c = texture2D(heightmap, UV);    y = c.a;    vec4 mvPosition = modelViewMatrix * vec4( position.x, c.a, position.z, 1.0 );    gl_Position = projectionMatrix * mvPosition;      }";
var terrainShaderFrag = "uniform sampler2D heightmap;varying vec2 UV;varying float y;uniform vec3 fogColor;uniform vec3 groundColor;void main() {	float depth = gl_FragCoord.z / gl_FragCoord.w;	float fogFactor = smoothstep( 30.0, 2000.0, depth );	gl_FragColor = vec4(groundColor , 1.0);  gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );}";
function initScene() {
	renderer = new THREE.WebGLRenderer({antialias:false});

	document.body.appendChild(renderer.domElement);
	
	skyColor = new THREE.Color(0x505050);
	groundColor = new THREE.Color(0x101010);

	var size = mesh_size * mesh_size;
	dataColor = new Float32Array( size  );
	for (var i = 0; i < size; i ++) {
	    dataColor[ i ] = max_height / 3;
	}

	heightTexture = new THREE.DataTexture(dataColor, mesh_size, mesh_size, THREE.AlphaFormat, THREE.FloatType);
	heightTexture.needsUpdate = true;

	var shaderMat = new THREE.ShaderMaterial( {
		'uniforms': {
			'heightmap': { type:"t", value: heightTexture },
			'fogColor' : { type:"c", value:skyColor},
			'groundColor' : { type:"c", value:groundColor}
		},
		'vertexShader': terrainShaderVert,
		'fragmentShader': terrainShaderFrag
	});

	renderer.setClearColor(skyColor, 1);

	scene = new THREE.Scene();
	
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.set(100,25,400);
	camera.lookAt(new THREE.Vector3(0,0,0));

	landscape = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(canvas_size, canvas_size, mesh_size, mesh_size),
		shaderMat
	);



	var rotation = new THREE.Matrix4();
	rotation.makeRotationX(-Math.PI/2);
	landscape.geometry.applyMatrix(rotation);

	var matrix = new THREE.Matrix4();
	matrix.makeTranslation(0,-40,0);
	
	landscape.geometry.applyMatrix(matrix);
	landscape.geometry.dynamic = true;
	
	scene.add(landscape);

var water = new THREE.Mesh( 
		new THREE.PlaneBufferGeometry(canvas_size, canvas_size, 2, 2),
		new THREE.MeshBasicMaterial({color:0x000040, transparent:true, opacity:0.15})
	);
	water.rotation.x = -Math.PI / 2;
	water.position.y = max_height / 3 - 40;
	scene.add(water);


	resize();

	window.addEventListener("resize", resize);
}

function distanceTo(x1,y1, x2,y2){

	return Math.sqrt( (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) );
}

function updatePeaks() {

	var r = radius * max_radius + 1;

 	var sx = Math.floor(Math.max(0, stylus.x - r));
	var ex = Math.min(mesh_size, stylus.x + r);

	var sy = Math.floor(Math.max(0, stylus.y - r));
	var ey = Math.min(mesh_size, stylus.y + r);


	// slowly drift back to the baseline.
	var c = 128*128;
	var max = max_height / 3;
	for(var i = 0; i < c; i++){
		if(dataColor[i] > max) {
			dataColor[i] -= (dataColor[i] - max) * 0.0001;
		}
	}

	for(var x = sx; x < ex; x++){
		for(var y = sy; y < ey; y++){
			var dist = Math.max(0, distanceTo(x, y, stylus.x, stylus.y));
			if(dist < r){
				
				if(dist > 0){
					dist = Math.max(0, r / dist);
					dist = Math.pow(dist, hardness);
				} else {
					dist = 1;
				}
				
				dist *= direction;

				dataColor[x + y * mesh_size] = Math.max(0, Math.min(max_height, dataColor[x + y * mesh_size] + (height * dist * 0.5)));
			}
		}
	}
	heightTexture.needsUpdate = true;
}

function init(){
	clock = new THREE.Clock();
	clock.start();

	initScene();
	startData();
	render();
}

function tick(d){
	
	updatePeaks(d);
	updateCamera(d);
	
	stylus.x += (tx - stylus.x) * drift;
	stylus.y += (ty - stylus.y) * drift;
}

var running = true;
var ty = mesh_size/2;
var tx = mesh_size/2;
var radius = 1;
var height = 0;
var direction = 1;
var drift = 1;
var frames = 0;
var hardness = 0;
var stylus = new THREE.Vector2();

function updateValues(values) {
	var yDrift = values.a[0] * mesh_size;
	var xDrift = values.a[1] * mesh_size;

	ty += Math.random() * yDrift - yDrift/2;
	tx += Math.random() * xDrift - xDrift/2;
	
	ty = Math.max(0, Math.min( ty, mesh_size));
	tx = Math.max(0, Math.min( tx, mesh_size));

	radius = values.d;
	height = (values.b[0] + values.b[1]) / 2;
	direction = values.c ? -1 : 1;
	drift = values.e * 0.05;
	tool = values.f > 0.5 ? 'circle' : 'square';
	hardness = values.b[1];
}

var camTarget = new THREE.Vector3(0, 100, 0);
var camOrbitRadius = canvas_size / 2.25;

function render(){

	frames++;
	tick(clock.getDelta());
	renderer.render(scene, camera);
	if(running){
		window.requestAnimationFrame(render);
	}

	/*	
	var ctx = document.getElementById("debug").getContext("2d");

	var imgData = ctx.getImageData(0, 0, 128, 128);
	var c = 128*128;
	for(var i = 0; i < c; i++) {
		imgData.data[i * 4] = Math.floor(dataColor[i] / 300 * 255);
		imgData.data[i * 4 + 1] = 0;// = Math.floor(dataColor[i] / 300 * 255);
		imgData.data[i * 4 + 2] = 0;// = Math.floor(dataColor[i] / 300 * 255);
		imgData.data[i * 4 + 3] = 255;// = Math.floor(dataColor[i] / 300 * 255);
	} 
	ctx.putImageData(imgData, 0, 0);
	ctx.beginPath();
	ctx.fillStyle = "white";
	ctx.arc(stylus.x, stylus.y, radius * max_radius + 1, 0, Math.PI * 2, false);
	ctx.fill();
	*/
}

var camLookTarget = new THREE.Vector3(0,200,0);

function updateCamera(delta) {

	camOrbit += delta * 0.05;

	camTarget.x = Math.cos(camOrbit) * camOrbitRadius;
	camTarget.z = Math.sin(camOrbit) * camOrbitRadius;
	camTarget.y = Math.sin(camOrbit * 1.3) * Math.cos(camOrbit * 2.132834) * 100 + 100;

	camLookTarget.y = Math.sin(camOrbit * 2.125) * Math.cos(camOrbit * 4.1852) * 50 + 100;
	camOrbitRadius = (canvas_size/3) + Math.sin(camOrbit * 2.0513) * Math.cos(camOrbit * 1.2534) * 100 + 100;

	var tx = (camTarget.x + canvas_size / 2) / canvas_size;
	var ty = (camTarget.z + canvas_size / 2) / canvas_size;

	tx = Math.round(tx * mesh_size);
	ty = Math.round(ty * mesh_size);

	var groundY = dataColor[tx + ty * mesh_size];
	camTarget.y += groundY + 50;

	camera.position.lerp(camTarget, 0.05);
	camera.lookAt(camLookTarget);
}


function resize(){
	var aspectRatio = window.innerWidth / window.innerHeight;
   
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}



var socket_;
function startData() {
  
  socket_ = new WebSocket('ws://duel.uncontext.com');
  
  socket_.onmessage = function (message) {
  	var values = JSON.parse(message.data);
  	updateValues(values);
  };

  socket_.onclose = function (event) {
    console.log("Connection closed, restarting in 2 seconds.");
    setTimeout(startData, 2000);
  }
  
  socket_.onopen = function (event) {
  }
}

init();