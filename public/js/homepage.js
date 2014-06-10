var canvas = null;
var context = null;
var speed = .3;
var max_rows = 6;
if (document.documentElement.clientWidth > 500) {
  max_rows = 17;
}
var items_ = [];
var examples_ = [];

var dividers = [];
$trs = null;
$(function() {
  init();

  uncontext.socket_.onmessage = function (event) {
    window.onresize();
    data = JSON.parse(event.data);
    if ($('#demo-table').length) {
      // console.log($(this).find('tr').length);
      $trs = $('#demo-table tbody tr');
      $($trs[0]).find('td:eq(1)').prepend('<span>' + data.a + '</span>');
      $($trs[1]).find('td:eq(1)').prepend('<span>' + data.b + '</span>');
      $($trs[2]).find('td:eq(1)').prepend('<span>' + data.c + '</span>');
      $($trs[3]).find('td:eq(1)').prepend('<span>' + data.d + '</span>');
      $($trs[4]).find('td:eq(1)').prepend('<span>' + data.e.f + '</span>');
      $($trs[5]).find('td:eq(1)').prepend('<span>' + data.e.g + '</span>');
      $trs.each(function() {
        // console.log($(this));
        $(this).find('td:eq(1) span:eq(5)').remove();
      })
    }
    if (canvas) {
      if (uncontext.socketData_.a !== data.a) {
        var now = new Date().getTime();
        for (var i = 0; i < data.a; i++) {
          var item = addItem(
            i,
            data.a,
            data.b,
            data.c,
            data.e.f / data.e.g,
            now);
          items_.push(item);
        }
      }
    }

    uncontext.socketData_ = data;
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

function animate() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  var now = new Date().getTime();

  for (var i = items_.length - 1; i >= 0; i--) {
    var item = items_[i];
    if (item.start + item.delay + 1000 < now) {
      items_.splice(i, 1);
    } else if (item.start + item.delay < now) {
      if (item.currSize < item.finalSize) {
        item.currSize += speed;
        context.beginPath();
        context.arc(item.position[0] * canvas.width, item.position[1] * canvas.height, item.currSize * 3, 0, 2 * Math.PI, false);
        context.strokeStyle = 'rgba(110, 29, 181, ' + (1 - (item.currSize / item.finalSize)) + ')';
        context.stroke();
        context.closePath();
      } else {
        items_.splice(i, 1);
      }
    }
  }

  for (var i = 0; i < examples_.length; i++) {
    examples_[i].animate();
  }

  requestAnimationFrame( animate );
}

function init() {
  canvas = document.getElementById('hero-canvas');
  context = canvas.getContext('2d');
  $('.homepage-example').each(function() {
    var letter = this.getAttribute('data-example');
    examples_.push(new window['example' + letter](this, this.getContext('2d'), letter));
  })

  animate();
  window.onresize();
}

window.onresize = function(event) {
  var $hero = $('#hero');
  canvas.width = $hero.width() + parseInt($hero.css('padding-left'), 10) + parseInt($hero.css('padding-right'), 10);
  canvas.height = $hero.height() + parseInt($hero.css('padding-top'), 10) + parseInt($hero.css('padding-bottom'), 10);
  for (var i = 0; i < examples_.length; i++) {
    if (examples_[i].canvas.width !== examples_[i].holder.width()) {
      examples_[i].canvas.width = examples_[i].holder.width();
    }
    if (examples_[i].canvas.height !== examples_[i].holder.height()) {
      examples_[i].canvas.height = examples_[i].holder.height();
    }
  }
};

var examplea = function(canvas, context, letter) {
  this.canvas = canvas;
  this.context = context;
  this.letter = letter;
  this.holder = $('#viz-' + letter);
  this.currNum = 0;
  this.seekNum = 0;

  this.animate = function() {
    if (this.currNum !== this.seekNum) {
      var diff = this.currNum - this.seekNum;
      if (Math.abs(diff) <= 1) {
        this.currNum = this.seekNum;
      } else if (diff < 0) {
        this.currNum += 1;
      } else {
        this.currNum -= 1;
      }
    }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (uncontext.socketData_.a) {
      if (uncontext.socketData_.b !== this.seekNum) {
        this.seekNum = uncontext.socketData_.a;
      }
      var radius = parseInt(this.canvas.width / 13, 10);
      this.context.fillStyle = "#fff3e7";
      for (var i = 0; i < this.currNum; i++) {
        this.context.beginPath();
        this.context.arc(radius/2 + (i * radius) / 2, radius/2, radius/2, 0, 2 * Math.PI, false);
        this.context.stroke();
        this.context.fill();
      }
    }
  }
}

var exampleb = function(canvas, context, letter) {
  this.canvas = canvas;
  this.context = context;
  this.letter = letter;
  this.holder = $('#viz-' + letter);
  this.currRot = 0;
  this.seekRot = 0;

  this.animate = function() {
    if (this.currRot !== this.seekRot) {
      var diff = this.currRot - this.seekRot;
      if (Math.abs(diff) < .5) {
        this.currRot = this.seekRot;
      } else if (diff < 0) {
        this.currRot += .5;
      } else {
        this.currRot -= .5;
      }
    }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (uncontext.socketData_.b) {
      if (uncontext.socketData_.b !== this.seekRot) {
        this.seekRot = uncontext.socketData_.b;
      }

      var size = this.canvas.height - 6;
      var numSquares = Math.floor(this.canvas.width / (size + 10));
      var offset = (this.canvas.width - (numSquares * (size + 10)) - 10) / 2;
      for (var i = 0; i < numSquares; i++) {
        var x = i * (size + 10)  +10;
        var y = this.canvas.height / 2 - size / 2;
        var width = size;
        var height = size;
        this.context.save();

        this.context.beginPath();
        this.context.translate(x + width / 2, y + height / 2);
        this.context.rotate(this.currRot * Math.PI / 180);

        this.context.rect(-width / 2, -height / 2, width, height);

        this.context.fillStyle = "#fff3e7";
        this.context.fill();

        this.context.restore();
      }
    }
  }
}

var examplec = function(canvas, context, letter) {
  this.canvas = canvas;
  this.context = context;
  this.letter = letter;
  this.holder = $('#viz-' + letter);
  this.currOpac = 0;
  this.seekOpac = 0;

  this.animate = function() {
    if (this.currOpac !== this.seekOpac) {
      var diff = this.currOpac - this.seekOpac;
      if (Math.abs(diff) < .05) {
        this.currOpac = this.seekOpac;
      } else if (diff < 0) {
        this.currOpac += .05;
      } else {
        this.currOpac -= .05;
      }
    }
    this.currOpac = Math.floor(this.currOpac * 100)/100;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (uncontext.socketData_.a) {
      if (uncontext.socketData_.c !== this.seekOpac) {
        this.seekOpac = uncontext.socketData_.c;
      }
      this.context.fillStyle = 'rgba(255, 243, 231, ' + this.currOpac + ')';
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

var exampled = function(canvas, context, letter) {
  this.canvas = canvas;
  this.context = context;
  this.letter = letter;
  this.holder = $('#viz-' + letter);
  this.currStroke = 0;
  this.seekStroke = 0;

  this.animate = function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    var size = this.canvas.height;
    if (this.currStroke !== this.seekStroke) {
      var diff = this.currStroke - this.seekStroke;
      if (Math.abs(diff) < .03) {
        this.currStroke = this.seekStroke;
      } else if (diff < 0) {
        this.currStroke += .03;
      } else {
        this.currStroke -= .03;
      }
    }
    if (uncontext.socketData_.d) {
      if (uncontext.socketData_.d !== this.seekStroke) {
        this.seekStroke = uncontext.socketData_.d;
      }
      var numTriangles = Math.floor(this.canvas.width / (size + 10));
      var offset = (this.canvas.width - (numTriangles * (size + 10)) - 10) / 2;
      for (var i = 0; i < numTriangles; i++) {
        var currOffset = (i * (size + 10) + offset);
        this.context.save();
        this.context.beginPath();
        this.context.moveTo(currOffset + 0, size);
        this.context.lineTo(currOffset + size / 2, 0);
        this.context.lineTo(currOffset + size, size);
        this.context.closePath();
        this.context.clip();
        this.context.strokeStyle = '#fff3e7';
        this.context.lineWidth = this.currStroke * 2;
        this.context.beginPath();
        this.context.moveTo(currOffset + 0, size);
        this.context.lineTo(currOffset + size / 2, 0);
        this.context.lineTo(currOffset + size, size);
        this.context.closePath();
        this.context.stroke();
        this.context.restore();
      }
    }
  }
}

var exampleef = function(canvas, context, letter) {
  this.canvas = canvas;
  this.context = context;
  this.letter = letter;
  this.holder = $('#viz-' + letter);
  this.currNum = 0;
  this.seekNum = 0;

  this.animate = function() {
    if (this.currNum !== this.seekNum) {
      var diff = this.currNum - this.seekNum;
      if (Math.abs(diff) < 5) {
        this.currNum = this.seekNum;
      } else if (diff < 0) {
        this.currNum += 3;
      } else {
        this.currNum -= 3;
      }
    }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (uncontext.socketData_.e) {
      if (uncontext.socketData_.d !== this.seekNum) {
        this.seekNum = uncontext.socketData_.e.f;
      }
      for (var h = 0; h < 2; h++) {
        for (var i = 0; i < this.currNum / 2; i++) {
          this.context.beginPath();
          this.context.strokeStyle = '#fff3e7';
          this.context.moveTo(.5 + i * 2, (h * this.canvas.height / 2) + (i % 2) * (this.canvas.height / 4));
          this.context.lineTo(.5 + i * 2, (h * this.canvas.height / 2) + (this.canvas.height / 4) + (i % 2) * (this.canvas.height / 4));
          this.context.stroke();
          this.context.closePath();
        }
      }
    }
  }
}

var exampleeg = function(canvas, context, letter) {
  this.canvas = canvas;
  this.context = context;
  this.letter = letter;
  this.holder = $('#viz-' + letter);
  this.currNum = 0;
  this.seekNum = 0;

  this.animate = function() {
    if (this.currNum !== this.seekNum) {
      var diff = this.currNum - this.seekNum;
      if (Math.abs(diff) < 5) {
        this.currNum = this.seekNum;
      } else if (diff < 0) {
        this.currNum += 3;
      } else {
        this.currNum -= 3;
      }
    }
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (uncontext.socketData_.e) {
      if (uncontext.socketData_.d !== this.seekNum) {
        this.seekNum = uncontext.socketData_.e.g;
      }
      for (var h = 0; h < 2; h++) {
        for (var i = 0; i < this.currNum / 2; i++) {
          this.context.beginPath();
          this.context.strokeStyle = '#fff3e7';
          this.context.moveTo(.5 + i * 2, (h * this.canvas.height / 2) + (i % 2) * (this.canvas.height / 4));
          this.context.lineTo(.5 + i * 2, (h * this.canvas.height / 2) + (this.canvas.height / 4) + (i % 2) * (this.canvas.height / 4));
          this.context.stroke();
          this.context.closePath();
        }
      }
    }
  }
}
