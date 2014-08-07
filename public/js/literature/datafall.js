var s = (function(sketch) {
  uncontext.socket_.onmessage = function (event) {
    socketData = JSON.parse(event.data);

    var g = {
      'x': socketData.e.g,
      'color': colors.g,
    }
    var f = {
      'x': socketData.e.f,
      'color': colors.f,
    }
    var d = {
      'x': socketData.d,
      'color': colors.d,
    }
    var c = {
      'x': socketData.c,
      'color': colors.c,
    }
    var b = {
      'x': socketData.b,
      'color': colors.b,
    }
    var a = {
      'x': socketData.a,
      'color': colors.a,
    }

    plotData = {
      'a': a,
      'b': b,
      'c': c,
      'd': d,
      'f': f,
      'g': g,
    };
  };

  var plotData = {};
  var y        = 0;
  var width    = 980;
  var height   = 480;
  var xOffset  = 10;
  var line     = sketch.color(255);
  var fill     = sketch.color(0);
  var img      = {};
  var colors   = {};

  sketch.setup = (function() {
    sketch.createCanvas(width, height);
    sketch.frameRate(60);

    colors = {
      'a': sketch.color(166, 206, 227),
      'b': sketch.color(31,  120, 180),
      'c': sketch.color(178, 223, 138),
      'd': sketch.color(51,  160, 44),
      'f': sketch.color(251, 154, 153),
      'g': sketch.color(227, 26,  28),
    }
  });

  sketch.draw = (function() {
    sketch.strokeWeight(2);

    sketch.stroke(fill);
    sketch.line(0, y, width, y);
    y = (y + 1) % height;

    sketch.stroke(line);
    sketch.line(0, y, width, y);

    for (var k in plotData) {
      if (typeof plotData[k] == 'function') {
        continue;
      }

      var data = plotData[k];
      var x = data.x * 2 + xOffset;
      var color = data.color;
      sketch.stroke(color);
      sketch.ellipse(x, y, 5, 5);
    }
  })
});

var p5 = new p5(s);