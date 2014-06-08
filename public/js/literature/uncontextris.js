var width = 14,
    height = 20,
    canvasId = 'uncontextris',
    blockSize = 20,
    calculatedWidth = width * blockSize,
    calculatedHeight = height * blockSize,
    board,
    colors,
    baseColors,
    currColors,
    pendingShape,
    activeShape,
    nextShape,
    canvas,
    context,
    level,
    score,
    lines;

var BLOCK_EMPTY = 0,
    BLOCK_FULL = 1,
    BLOCK_ACTIVE = 2;

var crazyLevel = 1;

// keys
var UP = 38, DOWN = 40, LEFT = 37, RIGHT = 39;

baseColors = ['#39f044', '#00ff00', '#0000ff'];
currColors = baseColors;

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
    var newShape = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];

    for (var j = 0; j < 4; j++)
      for (var i = 0; i < 4; i++) {
        newShape[i][j] = self.shape[4 - j - 1][i];
      }

    self.shape = newShape;
  }

  this.reset = function(data) {
    var newShape = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    var shapeNum = parseInt(Math.random() * shapes.length);
    if (data) {
      shapeNum = ~~((data.a / 26) * shapes.length);
    }
    self.shape = shapes[shapeNum];
    self.offsetX = xOffsets[shapeNum];
    self.offsetY = yOffsets[shapeNum];

    for (var j = 0; j < 4; j++)
      for (var i = 0; i < 4; i++) {
        newShape[i][j] = self.shape[4 - j - 1][i];
      }
    self.shape = newShape;
    // for (var h = 0; h < 3; h++)
    //   self.rotate();
    self.color = currColors[0];
  }

  this.leftEdge = function() {
    for (var x = 0; x < 4; x++)
      for (var y = 0; y < 4; y++)
        if (self.shape[y][x] == BLOCK_FULL)
          return x;
  }

  this.rightEdge = function() {
    for (var x = 3; x >= 0; x--)
      for (var y = 0; y < 4; y++)
        if (self.shape[y][x] == BLOCK_FULL)
          return x;
  }

  this.bottomEdge = function() {
    for (var y = 3; y >= 0; y--)
      for (var x = 0; x < 4; x++)
        if (self.shape[y][x] == BLOCK_FULL)
          return y;
  }

  this.initialize = function() {
    var rotations = parseInt(Math.random() * 4),
        shapeIdx = parseInt(Math.random() * shapes.length);

    // grab a random shape
    self.shape = shapes[shapeIdx];
    self.color = currColors[0];

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

function scoreCallback() {
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
  if (scoreCallback)
    scoreCallback(score, lines, level);

  pendingShape = new Shape();
  pendingShape.initialize();

  nextShape = pendingShape.clone();

  addShape();
}

function addShape() {
  activeShape = nextShape.clone();
  activeShape.x = width / 2 - 2;
  activeShape.y = -1;

  pendingShape = new Shape();
  pendingShape.initialize();

  if (isCollision(activeShape))
    reset();

  // nextShape.reset();
}

function rotateShape() {
  rotatedShape = activeShape.clone();
  rotatedShape.rotate();

  if (rotatedShape.leftEdge() + rotatedShape.x < 0)
    rotatedShape.x = -rotatedShape.leftEdge();
  else if (rotatedShape.rightEdge() + rotatedShape.x >= width)
    rotatedShape.x = width - rotatedShape.rightEdge() - 1;

  if (rotatedShape.bottomEdge() + rotatedShape.y > height)
    return false;

  if (!isCollision(rotatedShape))
    activeShape = rotatedShape;
}

function resetShape() {
  rotatedShape = activeShape.clone();
  rotatedShape.reset();

  if (rotatedShape.leftEdge() + rotatedShape.x < 0)
    rotatedShape.x = -rotatedShape.leftEdge();
  else if (rotatedShape.rightEdge() + rotatedShape.x >= width)
    rotatedShape.x = width - rotatedShape.rightEdge() - 1;

  if (rotatedShape.bottomEdge() + rotatedShape.y > height)
    return false;

  if (!isCollision(rotatedShape))
    activeShape = rotatedShape;
}

function moveLeft() {
  activeShape.x--;
  if (outOfBounds() || isCollision(activeShape)) {
    activeShape.x++;
    return false;
  }
  return true;
}

function moveRight() {
  activeShape.x++;
  if (outOfBounds() || isCollision(activeShape)) {
    activeShape.x--;
    return false;
  }
  return true;
}

function moveDown() {
  activeShape.y++;
  if (checkBottom() || isCollision(activeShape)) {
    activeShape.y--;
    shapeToBoard();
    addShape();
    return false;
  }
  return true;
}

function outOfBounds() {
  if (activeShape.x + activeShape.leftEdge() < 0)
    return true;
  else if (activeShape.x + activeShape.rightEdge() >= width)
    return true;
  return false;
}

function checkBottom() {
  return (activeShape.y + activeShape.bottomEdge() >= height);
}

function isCollision(shape) {
  for (var y = 0; y < 4; y++)
    for (var x = 0; x < 4; x++) {
      if (y + shape.y < 0)
        continue;
      if (shape.shape[y][x] && board[y + shape.y][x + shape.x])
        return true;
    }
  return false;
}

function testForLine() {
  for (var y = height - 1; y >= 0; y--) {
    var counter = 0;
    for (var x = 0; x < width; x++)
      if (board[y][x] == BLOCK_FULL)
        counter++;
    if (counter == width) {
      processLine(y);
      return true;
    }
  }
  return false;
}

function processLine(yToRemove) {
  lines++;
  score += level;
  if (lines % 10 == 0)
    level++;

  for (var y = yToRemove - 1; y >= 0; y--)
    for (var x = 0; x < width; x++) {
      board[y + 1][x] = board[y][x];
      colors[y + 1][x] = colors[y][x];
    }

  if (scoreCallback)
    scoreCallback(score, lines, level);
}

function shapeToBoard() {
  // transpose onto board
  for (var y = 0; y < 4; y++)
    for (var x = 0; x < 4; x++) {
      var dx = x + activeShape.x,
          dy = y + activeShape.y;
      if (dx < 0 || dx >= width || dy < 0 || dy >=height)
        continue;
      if (activeShape.shape[y][x] == BLOCK_FULL) {
        board[dy][dx] = BLOCK_FULL;
        colors[dy][dx] = activeShape.color;
      }
    }

  var linesFound = 0;
  while (testForLine())
    linesFound++;

  return linesFound;
}

function movePiece(motion) {
  if (motion == LEFT)
    moveLeft();
  else if (motion == RIGHT)
    moveRight();
  else if (motion == UP)
    rotateShape();
  else if (motion == DOWN)
    moveDown();
}

function drawGameBoard() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  context.fillStyle = "#000";
  var midWidth = 
  context.fillRect(window.innerWidth / 2 - calculatedWidth / 2 - blockSize * 3.5,
    window.innerHeight / 2 - calculatedHeight / 2,
    calculatedWidth, calculatedHeight);

  if (crazyLevel === 0) {
    context.fillRect(window.innerWidth / 2 + calculatedWidth / 2 - blockSize * 2.5 ,
      window.innerHeight / 2 - calculatedHeight / 2  + blockSize * 2,
      blockSize * 6, blockSize * 5);
  }

  context.font = "bold 16px sans-serif";
  context.fillText('Level: ' + (level || 1),
    window.innerWidth / 2 + calculatedWidth / 2 - blockSize * 2,
    window.innerHeight / 2 - calculatedHeight / 2  + blockSize);

  context.fillStyle = "#0f0";

  for (var y = 0; y < height; y++)
    for (var x = 0; x < width; x++)
      if (board[y][x] == BLOCK_FULL) {
        // context.fillStyle = currColors[colors[y][x]];
        context.fillStyle = colors[y][x];
        drawBlock(x, y);
      }

  context.fillStyle = "#f00";

  for (var y = 0; y < height; y++)
    for (var x = 0; x < width; x++)
      if (board[y][x] == BLOCK_ACTIVE)
        drawBlock(x, y);

  context.fillStyle = "#fff";

  for (var y = 0; y < 4; y++) {
    for (var x = 0; x < 4; x++) {
      var dx = x + activeShape.x,
          dy = y + activeShape.y;
      if (activeShape.shape[y][x] == BLOCK_FULL) {
        // context.fillStyle = currColors[activeShape.color];
        context.fillStyle = activeShape.color;
        drawBlock(dx, dy);
      }
    }
  }

  if (crazyLevel === 0) {
    for (var y = 0; y < 4; y++) {
      for (var x = 0; x < 4; x++) {
        if (nextShape.shape[y][x] == BLOCK_FULL) {
          context.fillStyle = nextShape.color;
          drawBlock(x + 16 + nextShape.offsetX, y + 3 + nextShape.offsetY);
        }
      }
    }
  }

  t = setTimeout(function() { drawGameBoard(); }, 30);
}

function drawBlock(x, y) {
  context.fillRect(
    window.innerWidth / 2 - calculatedWidth / 2 - blockSize * 3.5 + x * blockSize,
    window.innerHeight / 2 - calculatedHeight / 2 + y * blockSize,
    blockSize + .5, blockSize);
}

function handleKeys(e) {
  var k;
  var evt = (e) ? e : window.event;

  k = (evt.charCode) ?
    evt.charCode : evt.keyCode;
  if (k > 36 && k < 41) {
    movePiece(k);
    return false;
  };
  return true;
}

function updateBoard() {
  moveDown();
  console.log(activeShape.level);
  t = setTimeout(function() { updateBoard(); }, 1000 - (90 * (level || 1)));
}

function initialize() {
  canvas = document.getElementById(canvasId);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context = canvas.getContext('2d');

  // create handlers
  document.onkeyup = function(e) { return handleKeys(e) };

  reset();
  drawGameBoard();
  updateBoard();
}

function shiftColors(degree) {
  currColors = [
    changeHue(baseColors[0], degree),
    changeHue(baseColors[1], degree),
    changeHue(baseColors[2], degree)
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

    r = normalizeRGBValue(r, m);
    g = normalizeRGBValue(g, m);
    b = normalizeRGBValue(b, m);

    return rgbToHex(r,g,b);
}

function normalizeRGBValue(color, m) {
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
      if (activeShape) {
        if (crazyLevel === 0) {

        } else {
          activeShape.reset(tempData);
        }
      }
    }
    if (tempData.d !== socketData.d) {
      if (activeShape) {
        level = Math.ceil(tempData.d / 14 * 1.3 * 10);
        level = level > 10 ? 10 : level;
      }
    }
  }
  shiftColors(tempData.e.f / tempData.e.g * 360);
  nextShape.color = currColors[0];
  socketData = tempData;
}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawGameBoard();
}

initialize();