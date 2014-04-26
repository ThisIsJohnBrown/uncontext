var socket = io.connect('literature.tedbreak.com:80');

var socketData = null;
var forwardPerc = true;
var readyToPrint = false;
var lastPercentage = {};





socket.on('0', function (data) {
    // console.log(data);
    socketData = data;
    if (readyToPrint && $('.data:visible').length) {
      $('.data ul').prepend('<li>' + JSON.stringify(socketData) + '</li>');
    }
    $('.data ul li:eq(5)').remove();
});

$(function() {
  readyToPrint = true;
  $('.toggle').click(function() {
    $('.data').toggle();
  })
});

var SEPARATION = 100, AMOUNTX = 5, AMOUNTY = 5;

var container, stats;
var camera, scene, renderer;

var particles, particle, count = 0;

var mouseX = 0, mouseY = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var oldWaveHeight = 0;

init();
animate();

function init() {

  container = document.createElement( 'div' );
  document.body.appendChild( container );

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
  camera.position.z = 1000;

  scene = new THREE.Scene();

  particles = new Array();

  var PI2 = Math.PI * 2;
  var material = new THREE.SpriteCanvasMaterial( {

    color: 0xffffff,
    program: function ( context ) {

      context.beginPath();
      context.arc( 0, 0, 0.5, 0, PI2, true );
      context.fill();

    }

  } );

  var i = 0;

  for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

    for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

      particle = particles[ i ++ ] = new THREE.Sprite( material );
      particle.position.x = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 );
      particle.position.z = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 );
      scene.add( particle );

    }

  }

  renderer = new THREE.CanvasRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );

  //

  window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function onDocumentMouseMove( event ) {

  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;

}

function onDocumentTouchStart( event ) {

  if ( event.touches.length === 1 ) {

    event.preventDefault();

    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;

  }

}

function onDocumentTouchMove( event ) {

  if ( event.touches.length === 1 ) {

    event.preventDefault();

    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;

  }

}

//

function animate() {

  requestAnimationFrame( animate );

  render();

}

function render() {

  camera.position.x += ( mouseX - camera.position.x ) * .05;
  camera.position.y += ( - mouseY - camera.position.y ) * .05;
  camera.lookAt( scene.position );

  var i = 0;

  if (socketData) {
    // console.log(socketData);
    var now = new Date().getTime();
    var newPercentage = socketData.e.g * 30 / 1000;
    if (lastPercentage.perc !== newPercentage) {
      lastPercentage.perc = newPercentage;
      lastPercentage.finalTime = now + (socketData.e.g * 30) - (socketData.e.f * 30);
    }
    var perc = (lastPercentage.finalTime - now) / (socketData.e.g * 30);
    if (oldWaveHeight !== socketData.b * 20) {
      oldWaveHeight += ((socketData.b * 20) - oldWaveHeight) * .01;
    }
    for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

      for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

        particle = particles[ i++ ];
        particle.position.y = ( Math.sin( ( ix + count ) * 0.3 ) * oldWaveHeight ) +
          ( Math.sin( ( iy + count ) * 0.5 ) * oldWaveHeight );
        particle.scale.x = particle.scale.y = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 4 +
          ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 4 + 10;

      }

    }
  }

  renderer.render( scene, camera );

  count += 0.1;

}