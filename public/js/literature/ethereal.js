var socketData;

var num = 20;
var step, sz, offSet, theta, angle;
var speed;
var rings;

var Ring = function(isLeft) {
  this.left = isLeft;
  this.speedMod = 1;
  this.active = false;
  this.color = 0;
  this.seekColor = 0;
  this.theta = isLeft ? -1 : 1;
  this.delay = 0;

  this.update = function() {
    this.delay -= .05;
    if (this.delay <= 0) {
      this.delay = 0;
    }
    if (!this.delay) {
      this.color += .01;
      if (this.color >= 1) {
        this.color = 0;
      }
    }
    if (this.active && !this.delay) {
      if (this.left) {
        this.theta += speed * (1 + (this.speedMod * 3));
        if (this.theta > 1) {
          this.theta = 1;
          this.active = false;
        }
      } else {
        this.theta -= speed * (1 + (this.speedMod * 3));
        if (this.theta < -1) {
          this.theta = -1;
          this.active = false;
        }
      }
    } else {
      if (this.left) {
        this.theta -= speed / 4;
        if (this.theta < -1) {
          this.theta = -1;
        }
      } else {
        this.theta += speed / 4;
        if (this.theta > 1) {
          this.theta = 1;
        }
      }
    }
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeWeight(5 * (windowWidth / 600));
  step = windowWidth / 20;
  
  speed = .1;
  
  rings = [];
  for (var i = 0; i < num * 2; i++) {
    rings.push(new Ring(i < num));
  }

  fill(0);
  rect(0, 0, width, height);
}

function draw() {
  fill(0, 0, 0, 25);
  rect(0, 0, width, height);
  for (var i=0; i<rings.length; i++) {
    var ring = rings[i];
    ring.update();
    colorMode(HSB,255,100,100);
    stroke(255 - ring.color * 255, 255, 255);
    noFill();
    sz = (i - Math.floor(i / num) * 20) * step + (ring.left ? 0 : step / 2);
    var offSet = TWO_PI/num*i;
    var arcEnd = map(ring.theta,-1,1, PI, TWO_PI);
    arc(windowWidth/2, windowHeight, sz, sz, (ring.left ? PI : arcEnd), (ring.left ? arcEnd : TWO_PI));
  }
  colorMode(RGB);
}

uncontext.socket_.onmessage = function (event) {
  socketData = JSON.parse(event.data);
  var a = Math.floor(socketData.a / 26 * 40);
  var b = socketData.b / 20.33;
  var d = socketData.d / 14;
  var e = socketData.e.f / socketData.e.g;
  for (var i = 0; i < e * 5; i++) {
    var ringNum = (a + (i * socketData.d)) % (num * 2);
    rings[ringNum].active = true;
    rings[ringNum].color = b;
    rings[ringNum].speedMod = d;
    rings[ringNum].delay = i;
  }
};