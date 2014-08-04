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
  this.isMobile_ = (function(e,t){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(e)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(e.substr(0,4)))return true;else return false})(navigator.userAgent||navigator.vendor||window.opera,"http://detectmobilebrowser.com/mobile");

  if (this.isMobile_) {
    $('body').addClass('-mobile');
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

  $(window).on('resize', this.resize);
  this.resize();

  $('.info-close').on('click', function(e) {
    e.preventDefault();
    $('.info-panel').addClass('-hide');
  });
  $('.js-toggle-info').on('click', function(e) {
    e.preventDefault();
    $('.info-panel').toggleClass('-hide');
    self.resize();
  })

  self.socket_.onmessage = function (event) {
    data = JSON.parse(event.data);
    uncontext.socketData_ = data;
  };
}

Uncontext.prototype.resize = function() {
  $('.info-panel .col-group').css({
    left: ($(window).width() - $('.info-panel .col-group').outerWidth()) / 2
  });
}

//  This is an animation for the first header on the homepage
Uncontext.prototype.headerAnimationLines = function(canvas, context) {
  this.canvas = canvas;
  this.context = context;
  if (window.devicePixelRatio) {
    this.canvas.width = this.canvas.width  * window.devicePixelRatio;
    this.canvas.height = this.canvas.height  * window.devicePixelRatio;
    this.context.scale(window.devicePixelRatio, window.devicePixelRatio);  
  }
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
  if (window.devicePixelRatio) {
    this.canvas.width = this.canvas.width  * window.devicePixelRatio;
    this.canvas.height = this.canvas.height  * window.devicePixelRatio;
    this.context.scale(window.devicePixelRatio, window.devicePixelRatio);  
  }

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
      var drawY = Math.floor((this.lines[i].curr % 1) * (this.canvas.height / window.devicePixelRatio)) + .5;
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
  if (window.devicePixelRatio) {
    this.canvas.width = this.canvas.width  * window.devicePixelRatio;
    this.canvas.height = this.canvas.height  * window.devicePixelRatio;
    this.context.scale(window.devicePixelRatio, window.devicePixelRatio);  
  }
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
      var drawWidth = this.lines[i].curr * (this.canvas.width / window.devicePixelRatio);
      this.context.moveTo(((this.canvas.width / window.devicePixelRatio) - drawWidth) / 2, i * 5 + 1);
      this.context.lineTo(((this.canvas.width / window.devicePixelRatio) - drawWidth) / 2 + drawWidth, i * 5 + 1);
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