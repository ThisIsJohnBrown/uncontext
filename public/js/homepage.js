var socketData = {};
var speed = .3;
var max_rows = 6;
if (document.documentElement.clientWidth > 500) {
  max_rows = 17;
}

var items_ = [];
var dividers = [];

$(function() {
  init();
  animate();

  uncontext.socket_.onmessage = function (event) {
    data = JSON.parse(event.data);

    if ($('.data').length) {
      $('.data table tbody').prepend('<tr>\
        <td>' + data.a + '</td>\
        <td>' + data.b + '</td>\
        <td>' + data.c + '</td>\
        <td>' + data.d + '</td>\
        <td><span>f: ' + data.e.f + '</span><span>g: ' + data.e.g + '</span></td>\
      </tr>');
    }
    $('.data table tr:eq(' + max_rows + ')').remove();

    if (socketData.a !== data.a) {
      var now = new Date().getTime();
      for (var i = 0; i < data.a; i++) {
        var item = addItem(i, data.a, data.b, data.c, data.e.f / data.e.g, now);
        items_.push(item);
      }
    }

    socketData = data;
  };
})

function addItem(i, iTotal, size, direction, yOffset, now) {
  var item = {};
  item.position = [direction ? i/iTotal : 1 - i/iTotal, yOffset];
  item.finalSize = size;
  item.currSize = 0;
  item.start = now;
  item.delay = i * 100;
  return item;
}

function init() {
  var dividerNames = ['divider1'];
  for (var i = 0; i < dividerNames.length; i++) {
    var canvas = document.getElementById(dividerNames[i]);
    var context = canvas.getContext('2d');
    dividers.push(new window[canvas.getAttribute('data-divider-type')](canvas, context));
  }
  
  window.onresize();
}

function animate() {
  for (var i = 0; i < dividers.length; i++) {
    dividers[i].animate();
  }
  requestAnimationFrame( animate );
}

window.onresize = function(event) {
  // canvas.width = canvas.offsetWidth;
  // canvas.height = canvas.offsetHeight;
};


//  This is an animation for the first header on the homepage
headerAnimationLines = function(canvas, context) {
  this.canvas = canvas;
  this.context = context;
  this.type = 'tris';
  this.count = 0;
  this.lines = [];
  this.missingLines = [];
  this.previousMissing = -1;
  for (var i = 0; i < 26; i++) {
    this.lines.push({
      'direction': i % 2,
      'opacity': 1
    });
  }

  this.animate = function() {
    if (socketData.a) {
      if (socketData.a !== this.previousMissing && this.missingLines.indexOf(socketData.a) === -1) {
        this.previousMissing = socketData.a;
        this.missingLines.push(socketData.a);
        if (this.missingLines.length >= socketData.d) {
          this.missingLines.shift();
        }
      }
    }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var i = 0; i < this.lines.length; i++) {
      if (this.missingLines.indexOf(i) === -1) {
        if (this.lines[i].opacity < 1) {
          this.lines[i].opacity += .02;
        }
      } else {
        if (this.lines[i].opacity > 0) {
          this.lines[i].opacity -= .02;
        }
        if (this.lines[i].opacity < 0) {
          this.lines[i].opacity = 0;
        }
      }
      this.context.beginPath();
      this.context.strokeStyle = 'rgba(0, 0, 0, ' + this.lines[i].opacity + ')';
      this.context.moveTo(i * 10, 10 * this.lines[i].direction);
      this.context.lineTo((i + 1) * 10, 10 * (this.lines[i].direction ? 0 : 1));
      this.context.stroke();
    }
  }
}