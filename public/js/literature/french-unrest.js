var socketData = {a: 5, b: 12, c: 0, d: 3, e:{f: 0, g: 100 }};

uncontext.socket_.onmessage = function (event) {
  var tempJSON = JSON.parse(event.data);
  tempJSON.onUpdate = function() {
    radius = socketData.c * 100;
    ctx.lineWidth = socketData.b * socketData.b / 15;
  }
  TweenLite.to(socketData, 5, tempJSON, {});
};

var canvas = document.querySelector('canvas'),
    ctx = canvas.getContext('2d'),
    width = window.innerWidth,
    height = window.innerHeight;

canvas.width = width;
canvas.height = height;

function update() {
    var points = [],
        power = 64,
        displacement = Math.random() * 10;

    points[0] = Math.random() * displacement;
    points[power] = points[0];

    for (var i = 1; i < power; i *= 2) {
        for (var j = (power / i) / 2; j < power; j += power / i) {
            points[j] = ((points[j - (power / i) / 2] + points[j + (power / i) / 2]) / 2) + (Math.random() * -displacement + displacement);
        }
        displacement *= 3;
    }
    return points;
}

var points = update(),
    pointsMorph = update(),
    grads = [],
    cycle = 3.8,
    angle = 0,
    radius = 1,
    offset = -300,
    offsetY = height / 2,
    lastMorph = 0,
    morphDelay = 1000,
    angleY = 0;

function ribbonAnimation() {
    angle -= (socketData.c - .5) / 100;
    if (socketData) {
        offset += (125 * socketData.d % 1000) + 100;
    }
    
    if (offset > width + 500) {
        offset = -500;
        //offsetY += 80;
        ctx.strokeStyle = colorCycle();
      
    }
    
    
    ctx.save();
    ctx.translate(offset - radius, (offsetY - radius) + Math.sin(angleY += 0.01) * 50);
    ctx.transform(1, 0, 0.8, 1, 0, 0);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(radius , radius + points[0]);

    for (var i = 0; i <= points.length; i++) {
        ctx.rotate((Math.PI * 2) / points.length);
        ctx.lineTo(radius, radius + points[i]);
        if (points[i] !== pointsMorph[i]) {
            if (points[i] > pointsMorph[i]) {
                points[i] -= 0.2;
            } else {
                points[i] += 0.2;
            }
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  //ctx.transform(0, 0, 0, 0, 0, 0);
  //ctx.translate(0, 0)
  ctx.globalCompositeOperation = "source-over";
  
    ctx.fillStyle = "rgba(0, 0, 0," + (parseInt(socketData.c * 400) / 400 - .1) + ")";
    console.log((parseInt(socketData.c * 400) / 400 - .1));
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0,0,0,0.01)";
  ctx.globalCompositeOperation = "lighter";

    if (Date.now() > lastMorph + morphDelay) {
        lastMorph = Date.now();
        pointsMorph = update();
    }

}

function render(){
    if (socketData) {
      for(var i = 0; i < 1; i++){
        ribbonAnimation();
      }
    }
    requestAnimationFrame(render);
}

function colorCycle(offset) {
    offset = offset || 0;

    cycle += 3;
    if (cycle > 100) {
        cycle = 0;
    }

    var offset1 = .3;
    if (socketData) {
        offset1 = socketData.a / 100;
    }
    // offset1 = .02;
    var r = Math.floor(Math.sin(offset1 * cycle + offset + 0) * 127 + 128),
        g = Math.floor(Math.sin(offset1 * cycle + offset + 2) * 127 + 128),
        b = Math.floor(Math.sin(offset1 * cycle + offset + 4) * 127 + 128),
        a = .5;
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

window.addEventListener('resize', setDims, false);

function setDims() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;
}

// some people said it only showed in the top left, wait a bit to get dimensions
setTimeout(function(){
    setDims();
  
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 5;
  ctx.strokeStyle = colorCycle();
  //ctx.globalCompositeOperation = "lighter";
  
    render();
}, 200);