uncontext.socket_.onmessage = function (event) {
  socketData = JSON.parse(event.data);
};

var socketData = null;
var forwardPerc = true;
var lastPercentage = {};

var SEPARATIONX = 200, SEPERATIONY = 100, AMOUNTX = 26, AMOUNTY = 26;

var colors = [0, 0, 0];
var lastColorIndex = 0;
var oldColorNumber = 0;

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
      particle.position.x = ix * SEPARATIONX - ( ( AMOUNTX * SEPARATIONX ) / 2 );
      particle.position.z = iy * SEPERATIONY - ( ( AMOUNTY * SEPERATIONY ) / 2 );
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

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function RGB2HSV(rgb) {
    hsv = new Object();
    max=max3(rgb.r,rgb.g,rgb.b);
    dif=max-min3(rgb.r,rgb.g,rgb.b);
    hsv.saturation=(max==0.0)?0:(100*dif/max);
    if (hsv.saturation==0) hsv.hue=0;
    else if (rgb.r==max) hsv.hue=60.0*(rgb.g-rgb.b)/dif;
    else if (rgb.g==max) hsv.hue=120.0+60.0*(rgb.b-rgb.r)/dif;
    else if (rgb.b==max) hsv.hue=240.0+60.0*(rgb.r-rgb.g)/dif;
    if (hsv.hue<0.0) hsv.hue+=360.0;
    hsv.value=Math.round(max*100/255);
    hsv.hue=Math.round(hsv.hue);
    hsv.saturation=Math.round(hsv.saturation);
    return hsv;
}

// RGB2HSV and HSV2RGB are based on Color Match Remix [http://color.twysted.net/]
// which is based on or copied from ColorMatch 5K [http://colormatch.dk/]
function HSV2RGB(hsv) {
    var rgb=new Object();
    if (hsv.saturation==0) {
        rgb.r=rgb.g=rgb.b=Math.round(hsv.value*2.55);
    } else {
        hsv.hue/=60;
        hsv.saturation/=100;
        hsv.value/=100;
        i=Math.floor(hsv.hue);
        f=hsv.hue-i;
        p=hsv.value*(1-hsv.saturation);
        q=hsv.value*(1-hsv.saturation*f);
        t=hsv.value*(1-hsv.saturation*(1-f));
        switch(i) {
        case 0: rgb.r=hsv.value; rgb.g=t; rgb.b=p; break;
        case 1: rgb.r=q; rgb.g=hsv.value; rgb.b=p; break;
        case 2: rgb.r=p; rgb.g=hsv.value; rgb.b=t; break;
        case 3: rgb.r=p; rgb.g=q; rgb.b=hsv.value; break;
        case 4: rgb.r=t; rgb.g=p; rgb.b=hsv.value; break;
        default: rgb.r=hsv.value; rgb.g=p; rgb.b=q;
        }
        rgb.r=Math.round(rgb.r*255);
        rgb.g=Math.round(rgb.g*255);
        rgb.b=Math.round(rgb.b*255);
    }
    return rgb;
}

//Adding HueShift via Jacob (see comments)
function HueShift(h,s) { 
    h+=s; while (h>=360.0) h-=360.0; while (h<0.0) h+=360.0; return h; 
}

//min max via Hairgami_Master (see comments)
function min3(a,b,c) { 
    return (a<b)?((a<c)?a:c):((b<c)?b:c); 
} 
function max3(a,b,c) { 
    return (a>b)?((a>c)?a:c):((b>c)?b:c); 
}

function render() {

  camera.position.x += ( mouseX - camera.position.x ) * .05;
  camera.position.y += ( - mouseY - camera.position.y ) * .05;
  camera.lookAt( scene.position );

  var i = 0;

  if (socketData) {
    var newParticleColor;
    if (oldColorNumber !== socketData.a) {
      oldColorNumber = socketData.a;
      colors[lastColorIndex%3] += oldColorNumber;
      lastColorIndex++;
      var newColor = '#' + rgbToHex(colors[0]%256, colors[1]%256, colors[2]%256);
      renderer.setClearColor(newColor, 1);
      newParticleColor = true;
    }
    
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
    var diff = Math.floor(AMOUNTY - socketData.a) / 2;
    for ( var ix = 0; ix < AMOUNTX; ix ++ ) {

      for ( var iy = 0; iy < AMOUNTY; iy ++ ) {

        particle = particles[ i++ ];
        if (newParticleColor) {
          particle.material.color.r = (256 - colors[0]%256) / 256;
          particle.material.color.g = (256 - colors[1]%256) / 256;
          particle.material.color.b = (256 - colors[2]%256) / 256;
        }
        var newScale = particle.scale.x;
        if (ix < diff || ix > AMOUNTY - diff) {
          newScale = particle.scale.x - 1;
          if (newScale <= 3) {
            newScale = 3;
          }
        } else {
          newScale = particle.scale.x + 1;
          if (newScale >= 20) {
            newScale = 20;
          }
        }
        particle.position.y = ( Math.sin( ( ix + count ) * 0.3 ) * oldWaveHeight );
        particle.scale.x = newScale;
        particle.scale.y = newScale;

      }

    }
    count += newPercentage/50 * (socketData.c ? -1 : 1);
  }

  renderer.render( scene, camera );

}