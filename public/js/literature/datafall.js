var s = (function(sketch) {
  uncontext.socket_.onmessage = function (event) {
    socketData = JSON.parse(event.data);

    var g = {
      'x': socketData.e.g,
      'color': colors.g,
      'new': plotData.g != undefined && socketData.e.g != plotData.g.x,
    }
    var f = {
      'x': socketData.e.f,
      'color': colors.f,
      'new': plotData.f != undefined && socketData.e.f != plotData.f.x,
    }
    var d = {
      'x': socketData.d,
      'color': colors.d,
      'new': plotData.d != undefined && socketData.d != plotData.d.x,
    }
    var c = {
      'x': socketData.c,
      'color': colors.c,
      'new': plotData.c != undefined && socketData.c != plotData.c.x,
    }
    var b = {
      'x': socketData.b,
      'color': colors.b,
      'new': plotData.b != undefined && socketData.b != plotData.b.x,
    }
    var a = {
      'x': socketData.a,
      'color': colors.a,
      'new': plotData.a != undefined && socketData.a != plotData.a.x,
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
  var fill     = sketch.color(15);
  var img      = {};
  var colors   = {};
  var bg       = {};
  var fg       = {};

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

    bg = sketch.createGraphics(width, height);
    fg = sketch.createGraphics(width, height);

    bg.background(fill);
    fg.clear();
  });

  sketch.draw = (function() {
    fg.clear();

    bg.strokeWeight(2);
    fg.strokeWeight(2);

    y = (y + 1) % height;

    bg.stroke(fill);
    bg.fill(fill);
    bg.line(0, y, width, y);

    fg.stroke(line);
    fg.line(0, y, width, y);

    for (var k in plotData) {
      if (typeof plotData[k] == 'function') {
        continue;
      }

      var data = plotData[k];
      var x = data.x * 2 + xOffset;
      var color = data.color;
      bg.stroke(color);
      bg.fill(color);
      bg.ellipse(x, y, 5, 5);

      fg.noStroke();
      fg.fill(color);
      fg.ellipse(x, y, 11, 11);

      if (data.new) {
        fg.ellipse(x, y, 14, 14);
        data.new = false;
      }
    }

    sketch.image(bg, 0, 0);
    sketch.image(fg, 0, 0);
  })
});

var p5 = new p5(s);