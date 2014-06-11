function Uncontext() {
  this.readyToLog_ = false;
  this.socket_ = null;
  this.socketData_ = {};

  this.dividers_ = [];
}

Uncontext.prototype.init = function() {
  var self = this;
  var max_rows = 6;
  if (document.documentElement.clientWidth > 500) {
    max_rows = 17;
  }

  try {
    self.socket_ = new WebSocket('ws://literature.uncontext.com');
  } catch (e) {
    // Sockets not initialized.
  }


  $('.divider').each(function(divider) {
    if (this.getAttribute('data-divider-type')) {
      self.dividers_.push(new self[this.getAttribute('data-divider-type')](this, this.getContext('2d')));
    }
  })
  this.animate();

  self.socket_.onmessage = function (event) {
    data = JSON.parse(event.data);
    uncontext.socketData_ = data;
  };
}

//  This is an animation for the first header on the homepage
Uncontext.prototype.headerAnimationLines = function(canvas, context) {
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
    if (uncontext.socketData_.a) {
      if (uncontext.socketData_.a !== this.previousMissing && this.missingLines.indexOf(uncontext.socketData_.a) === -1) {
        this.previousMissing = uncontext.socketData_.a;
        this.missingLines.push(uncontext.socketData_.a);
        if (this.missingLines.length >= uncontext.socketData_.d) {
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
Uncontext.prototype.headerAnimationSteps = function(canvas, context) {
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

    if (uncontext.socketData_.b && this.ticks % 30 === 0) {
      this.currLine++;
      this.lines[this.currLine % this.lines.length].seek += uncontext.socketData_.b / 20.33;
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
Uncontext.prototype.headerAnimationWide = function(canvas, context) {
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

    if (uncontext.socketData_.b) {
      this.lines[0].seek = uncontext.socketData_.b / 20.33;
      this.lines[1].seek = uncontext.socketData_.b / 14;
      this.lines[2].seek = uncontext.socketData_.e.f / uncontext.socketData_.e.g;
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

Uncontext.prototype.animate = function() {
  for (var i = 0; i < uncontext.dividers_.length; i++) {
    uncontext.dividers_[i].animate();
  }
  requestAnimationFrame( uncontext.animate );
}

var uncontext = new Uncontext();
uncontext.init();