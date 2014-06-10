var socketData = {};
var speed = .3;
var maxRows = 5;

var dividers = [];
$trs = null;
$(function() {
  init();
  animate();

  uncontext.socket_.onmessage = function (event) {
    data = JSON.parse(event.data);

    if ($('#demo-table').length && socketData.a) {
      // console.log($(this).find('tr').length);
      $trs = $('#demo-table tbody tr');
      $($trs[0]).find('td:eq(1)').prepend('<span>' + socketData.a + '</span>');
      $($trs[1]).find('td:eq(1)').prepend('<span>' + socketData.b + '</span>');
      $($trs[2]).find('td:eq(1)').prepend('<span>' + socketData.c + '</span>');
      $($trs[3]).find('td:eq(1)').prepend('<span>' + socketData.d + '</span>');
      $($trs[4]).find('td:eq(1)').prepend('<span>' + socketData.e.f + '</span>');
      $($trs[5]).find('td:eq(1)').prepend('<span>' + socketData.e.g + '</span>');
      $trs.each(function() {
        // console.log($(this));
        $(this).find('td:eq(1) span:eq(5)').remove();
      })
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
  var dividerNames = ['divider1', 'divider2', 'divider3'];
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

//  This is an animation for the second header on the homepage
headerAnimationSteps = function(canvas, context) {
  this.canvas = canvas;
  this.context = context;
  this.lines = [];
  this.currLine = 0;
  this.ticks = 0;

  for (var i = 0; i < 5; i++) {
    this.lines.push({
      'curr': .5,
      'seek': .5
    })
  }

  this.animate = function() {
    this.ticks++;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (socketData.b && this.ticks % 30 === 0) {
      this.currLine++;
      this.lines[this.currLine % this.lines.length].seek += socketData.b / 20.33;
    }

    for (var i = 0; i < this.lines.length; i++) {
      if (this.lines[i].curr !== this.lines[i].seek) {
        var diff = this.lines[i].curr - this.lines[i].seek;
        if (Math.abs(diff) < .02) {
          this.lines[i].curr = this.lines[i].seek;
        } else if (diff < 0) {
          this.lines[i].curr += .02;
        } else {
          this.lines[i].curr -= .02;
        }
      }
      this.context.beginPath();
      var drawY = Math.floor((this.lines[i].curr % 1) * 10) + .5;
      this.context.moveTo(i * 20, drawY);
      this.context.lineTo((i + 1) * 20, drawY);
      this.context.stroke();
    }
  }
}

//  This is an animation for the third header on the homepage
headerAnimationWide = function(canvas, context) {
  this.canvas = canvas;
  this.context = context;
  this.lines = [];

  for (var i = 0; i < 3; i++) {
    this.lines.push({
      'curr': 1,
      'seek': .5
    })
  }

  this.animate = function() {
    this.ticks++;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (socketData.b) {
      this.lines[0].seek = socketData.b / 20.33;
      this.lines[1].seek = socketData.b / 14;
      this.lines[2].seek = socketData.e.f / socketData.e.g;
    }

    for (var i = 0; i < this.lines.length; i++) {
      var diff = this.lines[i].curr - this.lines[i].seek;
      if (Math.abs(diff) < .01) {
        this.lines[i].curr = this.lines[i].seek;
      } else if (diff < 0) {
        this.lines[i].curr += .01;
      } else {
        this.lines[i].curr -= .01;
      }
      this.context.beginPath();
      this.context.lineWidth = 2;
      var drawWidth = this.lines[i].curr * canvas.width;
      this.context.moveTo((canvas.width - drawWidth) / 2, i * 5 + 1);
      this.context.lineTo((canvas.width - drawWidth) / 2 + drawWidth, i * 5 + 1);
      this.context.stroke();
    }
  }
}
