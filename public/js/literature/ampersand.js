uncontext.socket_.onmessage = function (event) {
  socketData = JSON.parse(event.data);
};

var socketData = null;
var forwardPerc = true;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var cubeHolder = new THREE.Object3D();
scene.add(cubeHolder);

camera.position.z = 5;

var context = new webkitAudioContext();
var oscillator = context.createOscillator();

var gainNode;
if (context.createGain) {
  gainNode = context.createGain();
} else if (context.createGainNode) {
  gainNode = context.createGainNode();
}
oscillator.connect(context.destination); // Connect to speakers
oscillator.start(0)
 oscillator.frequency.value = 900;
oscillator.connect(gainNode);
gainNode.connect(context.destination);

gainNode.gain.value = -1;

var letters = [];
var lastLetterDrop = 0;
var lastPercentage = {};

function addLetter(text, color, addToHolder) {
  var geoLetter = new THREE.TextGeometry(text, {
    'size': 1,
    'height': .2
  });
  var matLetter = new THREE.MeshBasicMaterial( { 'color': color, 'transparent': true } );
  var meshLetter = new THREE.Mesh( geoLetter, matLetter );
  if (addToHolder) {
    cubeHolder.add(meshLetter);
  } else {
    meshLetter.position.x = Math.cos(cubeHolder.rotation.y);
    meshLetter.position.z = -Math.sin(cubeHolder.rotation.y);
    meshLetter.rotation.y = cubeHolder.rotation.y;
    meshLetter.direction = socketData.c ? 1 : -1;
    meshLetter.fade = socketData.d;
    letters.push(meshLetter);
    scene.add(meshLetter);
  }
  return meshLetter;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function render() {

  // cube.rotation.x += 0.1;
  if (socketData) {
    // console.log(socketData);
    if (gainNode.gain.value === 1) {
      gainNode.gain.value = -1;
    }
    var now = new Date().getTime();
    var newPercentage = socketData.e.g * 30 / 1000;
    if (lastPercentage.perc !== newPercentage) {
      lastPercentage.perc = newPercentage;
      lastPercentage.finalTime = now + (socketData.e.g * 30) - (socketData.e.f * 30);
    }
    var perc = (lastPercentage.finalTime - now) / (socketData.e.g * 30);
    var grey = parseInt((forwardPerc ? 255 : 0) * perc + (forwardPerc ? 0 : 255) * (1 - perc), 10);
    // console.log(grey);
    renderer.setClearColor( rgbToHex(grey, grey, grey), 1 );

    cubeHolder.rotation.y = -(Math.PI*2) * (perc);

    for (var i = letters.length - 1; i >= 0; i--) {
      letters[i].position.y -= .1 * letters[i].direction;
      letters[i].rotation.z -= .01;
      letters[i].material.opacity -= .01 * letters[i].fade;
      letters[i].scale.x += .02 * letters[i].fade;
      letters[i].scale.y += .02 * letters[i].fade;
      if (letters[i].material.opacity <= 0) {
        scene.remove(letters[i]);
        letters.splice(i, 1);
      }
      // letters[i].rotation.z -= .01;
    }

    var now = new Date().getTime();
    if (now - lastLetterDrop >= 2000 / socketData.b) {
      lastLetterDrop = now;
      addLetter(String.fromCharCode(socketData.a + 97), 0x000000);
      oscillator.frequency.value = socketData.c ? 900 : 2000;
      gainNode.gain.value = 1;
    }
  }
  // addLetter();

  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

var letter = addLetter('&', 0xffffff, true);
letter.position.x = 1;

render();