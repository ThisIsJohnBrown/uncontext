var width = 14,
    height = 20,
    canvas_id = 'uncontextris',
    block_size = 20,
    calculated_width = width * block_size,
    calculated_height = height * block_size,
    board,
    colors,
    base_colors,
    current_colors,
    pending_shape,
    active_shape,
    next_shape,
    canvas,
    context,
    level,
    score,
    lines;

var BLOCK_EMPTY = 0,
    BLOCK_FULL = 1,
    BLOCK_ACTIVE = 2;

// keys
var UP = 38, DOWN = 40, LEFT = 37, RIGHT = 39;

base_colors = ['#39f044', '#00ff00', '#0000ff'];
current_colors = base_colors;

function Shape() {
  var self = this;

  this.offsetX = 0;
  this.offsetY = 0;
  this.level = 1;
  if (socketData) {
    this.level = Math.ceil(socketData.d / 14);
  }

  var shapes = [
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
    [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
    [[0, 0, 0, 0], [0, 1, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0]],
    [[0, 0, 0, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 1, 1, 0]],
    [[0, 0, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0]],
    [[0, 0, 0, 0], [0, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 0]],
    [[0, 0, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0]]
  ];
  var xOffsets = [0, 0, 0, 0, 0, 0, 0];
  var yOffsets = [0, -1, 0, -1, -1, -1, -1];

  this.rotate = function() {
    var new_shape = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];

    for (var j = 0; j < 4; j++)
      for (var i = 0; i < 4; i++) {
        new_shape[i][j] = self.shape[4 - j - 1][i];
      }

    self.shape = new_shape;
  }

  this.reset = function(data) {
    var new_shape = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    var shape_num = parseInt(Math.random() * shapes.length);
    if (data) {
      shape_num = ~~((data.a / 26) * shapes.length);
    }
    self.shape = shapes[shape_num];
    self.offsetX = xOffsets[shape_num];
    self.offsetY = yOffsets[shape_num];

    for (var j = 0; j < 4; j++)
      for (var i = 0; i < 4; i++) {
        new_shape[i][j] = self.shape[4 - j - 1][i];
      }
    self.shape = new_shape;
    // for (var h = 0; h < 3; h++)
    //   self.rotate();
    self.color = current_colors[0];
  }

  this.left_edge = function() {
    for (var x = 0; x < 4; x++)
      for (var y = 0; y < 4; y++)
        if (self.shape[y][x] == BLOCK_FULL)
          return x;
  }

  this.right_edge = function() {
    for (var x = 3; x >= 0; x--)
      for (var y = 0; y < 4; y++)
        if (self.shape[y][x] == BLOCK_FULL)
          return x;
  }

  this.bottom_edge = function() {
    for (var y = 3; y >= 0; y--)
      for (var x = 0; x < 4; x++)
        if (self.shape[y][x] == BLOCK_FULL)
          return y;
  }

  this.initialize = function() {
    var rotations = parseInt(Math.random() * 4),
        shape_idx = parseInt(Math.random() * shapes.length);

    // grab a random shape
    self.shape = shapes[shape_idx];
    self.color = current_colors[0];

    // rotate it a couple times
    for (var i = 0; i < rotations; i++)
      self.rotate();
  }

  this.clone = function() {
    s = new Shape();
    s.x = self.x;
    s.y = self.y;
    s.shape = self.shape;
    s.color = self.color;
    s.level = self.level;
    return s;
  }
}

function score_callback() {
  // passthru
}

function reset() {
  board = [];
  colors = [];
  for (var y = 0; y < height; y++) {
    var row = [];
    for (var x = 0; x < width; x++)
      row.push(0);
    board.push(row);
    row = [];
    for (var x = 0; x < width; x++)
      row.push(0);
    colors.push(row);
  }

  score = 0;
  lines = 0;
  level = 1;
  if (score_callback)
    score_callback(score, lines, level);

  pending_shape = new Shape();
  pending_shape.initialize();

  next_shape = pending_shape.clone();

  add_shape();
}

function add_shape() {
  active_shape = next_shape.clone();
  active_shape.x = width / 2 - 2;
  active_shape.y = -1;

  pending_shape = new Shape();
  pending_shape.initialize();

  if (is_collision(active_shape))
    reset();

  // next_shape.reset();
}

function rotate_shape() {
  rotated_shape = active_shape.clone();
  rotated_shape.rotate();

  if (rotated_shape.left_edge() + rotated_shape.x < 0)
    rotated_shape.x = -rotated_shape.left_edge();
  else if (rotated_shape.right_edge() + rotated_shape.x >= width)
    rotated_shape.x = width - rotated_shape.right_edge() - 1;

  if (rotated_shape.bottom_edge() + rotated_shape.y > height)
    return false;

  if (!is_collision(rotated_shape))
    active_shape = rotated_shape;
}

function reset_shape() {
  rotated_shape = active_shape.clone();
  rotated_shape.reset();

  if (rotated_shape.left_edge() + rotated_shape.x < 0)
    rotated_shape.x = -rotated_shape.left_edge();
  else if (rotated_shape.right_edge() + rotated_shape.x >= width)
    rotated_shape.x = width - rotated_shape.right_edge() - 1;

  if (rotated_shape.bottom_edge() + rotated_shape.y > height)
    return false;

  if (!is_collision(rotated_shape))
    active_shape = rotated_shape;
}

function move_left() {
  active_shape.x--;
  if (out_of_bounds() || is_collision(active_shape)) {
    active_shape.x++;
    return false;
  }
  return true;
}

function move_right() {
  active_shape.x++;
  if (out_of_bounds() || is_collision(active_shape)) {
    active_shape.x--;
    return false;
  }
  return true;
}

function move_down() {
  active_shape.y++;
  if (check_bottom() || is_collision(active_shape)) {
    active_shape.y--;
    shape_to_board();
    add_shape();
    return false;
  }
  return true;
}

function out_of_bounds() {
  if (active_shape.x + active_shape.left_edge() < 0)
    return true;
  else if (active_shape.x + active_shape.right_edge() >= width)
    return true;
  return false;
}

function check_bottom() {
  return (active_shape.y + active_shape.bottom_edge() >= height);
}

function is_collision(shape) {
  for (var y = 0; y < 4; y++)
    for (var x = 0; x < 4; x++) {
      if (y + shape.y < 0)
        continue;
      if (shape.shape[y][x] && board[y + shape.y][x + shape.x])
        return true;
    }
  return false;
}

function test_for_line() {
  for (var y = height - 1; y >= 0; y--) {
    var counter = 0;
    for (var x = 0; x < width; x++)
      if (board[y][x] == BLOCK_FULL)
        counter++;
    if (counter == width) {
      process_line(y);
      return true;
    }
  }
  return false;
}

function process_line(y_to_remove) {
  lines++;
  score += level;
  if (lines % 10 == 0)
    level++;

  for (var y = y_to_remove - 1; y >= 0; y--)
    for (var x = 0; x < width; x++) {
      board[y + 1][x] = board[y][x];
      colors[y + 1][x] = colors[y][x];
    }

  if (score_callback)
    score_callback(score, lines, level);
}

function shape_to_board() {
  // transpose onto board
  for (var y = 0; y < 4; y++)
    for (var x = 0; x < 4; x++) {
      var dx = x + active_shape.x,
          dy = y + active_shape.y;
      if (dx < 0 || dx >= width || dy < 0 || dy >=height)
        continue;
      if (active_shape.shape[y][x] == BLOCK_FULL) {
        board[dy][dx] = BLOCK_FULL;
        colors[dy][dx] = active_shape.color;
      }
    }

  var lines_found = 0;
  while (test_for_line())
    lines_found++;

  return lines_found;
}

function move_piece(motion) {
  if (motion == LEFT)
    move_left();
  else if (motion == RIGHT)
    move_right();
  else if (motion == UP)
    rotate_shape();
  else if (motion == DOWN)
    move_down();
}

function draw_game_board() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  context.fillStyle = "#000";
  var midWidth = 
  context.fillRect(window.innerWidth / 2 - calculated_width / 2 - block_size * 3.5,
    window.innerHeight / 2 - calculated_height / 2,
    calculated_width, calculated_height);

  context.fillRect(window.innerWidth / 2 + calculated_width / 2 - block_size * 2.5 ,
    window.innerHeight / 2 - calculated_height / 2  + block_size,
    block_size * 6, block_size * 5);

  context.font = "bold 16px sans-serif";
  context.fillText('Level: ' + (level || 1),
    window.innerWidth / 2 + calculated_width / 2 + block_size,
    window.innerHeight / 2 - calculated_height / 2  + block_size * 7);

  context.fillStyle = "#0f0";

  for (var y = 0; y < height; y++)
    for (var x = 0; x < width; x++)
      if (board[y][x] == BLOCK_FULL) {
        // context.fillStyle = current_colors[colors[y][x]];
        context.fillStyle = colors[y][x];
        draw_block(x, y);
      }

  context.fillStyle = "#f00";

  for (var y = 0; y < height; y++)
    for (var x = 0; x < width; x++)
      if (board[y][x] == BLOCK_ACTIVE)
        draw_block(x, y);

  context.fillStyle = "#fff";

  for (var y = 0; y < 4; y++)
    for (var x = 0; x < 4; x++) {
      var dx = x + active_shape.x,
          dy = y + active_shape.y;
      if (active_shape.shape[y][x] == BLOCK_FULL) {
        // context.fillStyle = current_colors[active_shape.color];
        context.fillStyle = active_shape.color;
        draw_block(dx, dy);
      }
    }

  for (var y = 0; y < 4; y++)
    for (var x = 0; x < 4; x++) {
      if (next_shape.shape[y][x] == BLOCK_FULL) {
        context.fillStyle = next_shape.color;
        draw_block(x + 16 + next_shape.offsetX, y + 2 + next_shape.offsetY);
      }
    }

  t = setTimeout(function() { draw_game_board(); }, 30);
}

function draw_block(x, y) {
  context.fillRect(
    window.innerWidth / 2 - calculated_width / 2 - block_size * 3.5 + x * block_size,
    window.innerHeight / 2 - calculated_height / 2 + y * block_size,
    block_size + .5, block_size);
}

function handleKeys(e) {
  var k;
  var evt = (e) ? e : window.event;

  k = (evt.charCode) ?
    evt.charCode : evt.keyCode;
  if (k > 36 && k < 41) {
    move_piece(k);
    return false;
  };
  return true;
}

function update_board() {
  move_down();
  console.log(active_shape.level);
  t = setTimeout(function() { update_board(); }, 1000 - (90 * (level || 1)));
}

function initialize() {
  canvas = document.getElementById(canvas_id);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context = canvas.getContext('2d');

  // create handlers
  document.onkeyup = function(e) { return handleKeys(e) };

  reset();
  draw_game_board();
  update_board();
}

function shiftColors(degree) {
  current_colors = [
    changeHue(base_colors[0], degree),
    changeHue(base_colors[1], degree),
    changeHue(base_colors[2], degree)
  ]
}

function changeHue(rgb, degree) {
    var hsl = rgbToHSL(rgb);
    hsl.h += degree;
    if (hsl.h > 360) {
        hsl.h -= 360;
    }
    else if (hsl.h < 0) {
        hsl.h += 360;
    }
    return hslToRGB(hsl);
}

// exepcts a string and returns an object
function rgbToHSL(rgb) {
    // strip the leading # if it's there
    rgb = rgb.replace(/^\s*#|\s*$/g, '');

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if(rgb.length == 3){
        rgb = rgb.replace(/(.)/g, '$1$1');
    }

    var r = parseInt(rgb.substr(0, 2), 16) / 255,
        g = parseInt(rgb.substr(2, 2), 16) / 255,
        b = parseInt(rgb.substr(4, 2), 16) / 255,
        cMax = Math.max(r, g, b),
        cMin = Math.min(r, g, b),
        delta = cMax - cMin,
        l = (cMax + cMin) / 2,
        h = 0,
        s = 0;

    if (delta == 0) {
        h = 0;
    }
    else if (cMax == r) {
        h = 60 * (((g - b) / delta) % 6);
    }
    else if (cMax == g) {
        h = 60 * (((b - r) / delta) + 2);
    }
    else {
        h = 60 * (((r - g) / delta) + 4);
    }

    if (delta == 0) {
        s = 0;
    }
    else {
        s = (delta/(1-Math.abs(2*l - 1)))
    }

    return {
        h: h,
        s: s,
        l: l
    }
}

// expects an object and returns a string
function hslToRGB(hsl) {
    var h = hsl.h,
        s = hsl.s,
        l = hsl.l,
        c = (1 - Math.abs(2*l - 1)) * s,
        x = c * ( 1 - Math.abs((h / 60 ) % 2 - 1 )),
        m = l - c/ 2,
        r, g, b;

    if (h < 60) {
        r = c;
        g = x;
        b = 0;
    }
    else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    }
    else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    }
    else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    }
    else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    }
    else {
        r = c;
        g = 0;
        b = x;
    }

    r = normalize_rgb_value(r, m);
    g = normalize_rgb_value(g, m);
    b = normalize_rgb_value(b, m);

    return rgbToHex(r,g,b);
}

function normalize_rgb_value(color, m) {
    color = Math.floor((color + m) * 255);
    if (color < 0) {
        color = 0;
    }
    return color;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

var socketData = {};

uncontext.socket_.onmessage = function(message) {
  var tempData = JSON.parse(message.data);
  if (socketData) {
    if (tempData.c !== socketData.c) {
      if (active_shape) {
        next_shape.reset(tempData);
      }
    }
    if (tempData.d !== socketData.d) {
      if (active_shape) {
        level = Math.ceil(tempData.d / 14 * 1.3 * 10);
        level = level > 10 ? 10 : level;
      }
    }
  }
  shiftColors(tempData.e.f / tempData.e.g * 360);
  next_shape.color = current_colors[0];
  socketData = tempData;
}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw_game_board();
}

initialize();