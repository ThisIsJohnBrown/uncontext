var socketData = {a: 5, b: 12, c: 0, d: 3, e:{f: 0, g: 100 }};

uncontext.socket_.onmessage = function (event) {
  var tempJSON = JSON.parse(event.data);
  socketData = tempJSON;
  if (offsets[tempJSON.a % 20][0] === 1) {
    var from = {m: 1, yoyo:true, repeat:-1, ease:Back.easeInOut}
    var to = {m: 0, yoyo:true, repeat:-1, ease:Back.easeInOut};
    to.onUpdate = function(e) {
      offsets[tempJSON.a % 20][0] = from.m;
    }
    to.onComplete = function() {
      to.m = 1;
      to.onComplete = function() {

      };
      TweenLite.to(from, tempJSON.b % 3 + 1, to);
    }
    TweenLite.to(from, tempJSON.b % 3 + 1, to);
  }
};

var cvs = document.createElement('canvas'),
    context = cvs.getContext("2d"),
    points = [],
    lines = [],
    offsets = [],
    centerPt = {x:0, y:0},
    width = window.innerWidth,
    height = window.innerHeight;

document.body.appendChild(cvs);

function init(){
  context.lineCap="round";
  for(var pId in objectCoords.vertices){
    
    objectCoords.vertices[pId].index = points.length;
    points.push(objectCoords.vertices[pId]);
    
    n = 1;
    if (Math.random() < .2) {
      //n = Math.random() * 100 + 30;
    }
    
    offsets.push([1, pId, n]);
  }
  //offsets[3][2] = 30;
  //offsets[0][2] = 15;
  //offsets[2][2] = 90;
  //offsets[15][2] = 30;
  
  for(var lId in objectCoords.edges){
    var edge = objectCoords.edges[lId];
    lines.push([
      objectCoords.vertices[edge.a].index,
      objectCoords.vertices[edge.b].index,
      
      edge.a,
      
      edge.b
    ]);
  }
  update();
}

var ang = 0,
    ang2 = 0,
    ang3 = 0,
    ang4 = 0,
    ang5 = 0;

var tick = 0;

function update(){
  tick += socketData.d;
  
  // o = offsets.length;
  // while(o--){
  //   off = offsets[o];
  //   if(off[2] !== 1) {
  //     off[0] = .8 + Math.sin(tick/off[2]);
  //   }
  // }
  // clear canvas
  console.log((socketData.e.f / socketData.e.g));
  context.fillStyle = 'rgba(0, 0, 0, ' + (socketData.e.f / socketData.e.g) / 2 + ')';
  context.fillRect(0, 0, cvs.width, cvs.height);
  // context.clearRect(0, 0, cvs.width, cvs.height);
  
  var topSize = cvs.height < cvs.width ? cvs.height : cvs.width;

  drawObject(ang, topSize * .1);
  // drawObject(ang2, 150);
  // drawObject(ang3, 200);
  // drawObject(ang4, 250);
  drawObject(ang5, topSize * (.4  + (.2 * Math.sin(tick / 100))));
  // rotate
  ang += 0.01;
  ang2 -= 0.02;
  ang3 += .003;
  ang4 -= .004;
  ang5 += .005;
  
  //points[3].x += .01;
  //points[15].x -= .01;
  //console.log(points[0].x);
  
  window.requestAnimationFrame(update);
}

function drawObject(_ang, size){
  var n = points.length,
      _context = context,
      pt, new_pt, ln,
      mat;
  
  // create a matrix with current rotation
  mat = createRotateMatrix(_ang);
  
  // position points
  while(n--){
    pt = points[n];
    new_pt = pt_x_matrix(pt, mat);
    pt._x = centerPt.x + (new_pt.x*size * offsets[n][0]);
    pt._y = centerPt.y + (new_pt.y*size * offsets[n][0]);
  }
  
  n = lines.length;
  while(n--){
    ln = lines[n];
    
    drawLine(_context, points[ln[0]], points[ln[1]], offsets[ln[0]], offsets[ln[1]], size);
  }
  
  n = points.length;
  while(n--){
    pt = points[n];
    drawPoint(_context, pt, n, offsets[n]);
  }
  
}

function drawPoint(_context, pt, num, off){
  _context.lineCap="round";
  _context.fillStyle = 'white';
  _context.fillRect(pt._x-2, pt._y-2, 4, 4);
}

function drawLine(_context, ptA, ptB, off1, off2){
  if (off1[0] !== 1 || off2[0] !== 1) {
    _context.strokeStyle = "#666666";
    _context.lineWidth = 1 + (off1[0] * off2[0]) * (cvs.width / 400 / 3 * 2);
    // _context.lineWidth = 3;
  } else {
    _context.lineWidth = cvs.width / 400;
    _context.strokeStyle = "#666666";
  }
  _context.beginPath();
  _context.strokeStyle = 'rgba(' + parseInt(Math.abs(ptA.x * 255)) + ', ' + parseInt(Math.abs(ptA.y * 255)) + ', ' + parseInt(Math.abs(ptA.z * 255)) + ', 1)';
  var gradient=_context.createLinearGradient(ptA._x, ptA._y, ptA._x + (ptB._x - ptA._x) * .5, ptA._y + (ptB._y - ptA._y) * .5);
  gradient.addColorStop("0",'rgba(' + parseInt(Math.abs(ptA.x * 255)) + ', ' + parseInt(Math.abs(ptA.y * 255)) + ', ' + parseInt(Math.abs(ptA.z * 255)) + ', 1)');
  gradient.addColorStop("1.0",'rgba(' + parseInt(Math.abs(ptB.x * 255)) + ', ' + parseInt(Math.abs(ptB.y * 255)) + ', ' + parseInt(Math.abs(ptB.z * 255)) + ', 1)');
  _context.strokeStyle = gradient;
  _context.moveTo(ptA._x, ptA._y);
  _context.lineTo(ptA._x + (ptB._x - ptA._x), ptA._y + (ptB._y - ptA._y));
  _context.stroke();
  _context.closePath();
  _context.beginPath();
}

function pt_x_matrix(pt, matrix){
  return {
    x: (pt.x*matrix[0])+(pt.z*matrix[1]),
    y: pt.y
  };
  // full return version
  /*return {
    x: (pt.x*matrix[0])+(pt.y*matrix[3])+(pt.z*matrix[6]),
    y: (pt.x*matrix[1])+(pt.y*matrix[4])+(pt.z*matrix[7]),
    z: (pt.x*matrix[2])+(pt.y*matrix[5])+(pt.z*matrix[8]),
  };*/
}

function createRotateMatrix(ang){
  // shortened because I didn't need the other values
  return [
    Math.cos(ang), Math.sin(ang) 
  ];
  /*return [
    Math.cos(ang),   0,    -Math.sin(ang),
    0,               1,    0,
    Math.sin(ang),   0,    Math.cos(ang) 
  ];*/
}

function resizeHandler(){
  var box = cvs.getBoundingClientRect();
  var w = box.width;
  var h = box.height;
  cvs.width = w;
  cvs.height = h;
  centerPt.x = Math.round(w/2);
  centerPt.y = Math.round(h/2);
}

resizeHandler();
window.onresize = resizeHandler;





var objectCoords = {
  "vertices" : {
    'you' : { x:  0.607, y:  0.000, z:  0.795, n: 0 },
    'sha' : { x:  0.188, y:  0.577, z:  0.795, n: 1 },
    'llh' : { x: -0.491, y:  0.357, z:  0.795, n: 2 },
    'ave' : { x: -0.491, y: -0.357, z:  0.795, n: 3 },
    'noo' : { x:  0.188, y: -0.577, z:  0.795, n: 4 },
    'the' : { x:  0.982, y:  0.000, z:  0.188, n: 5 },
    'rgo' : { x:  0.304, y:  0.934, z:  0.188, n: 6 },
    'dsb' : { x: -0.795, y:  0.577, z:  0.188, n: 7 },
    'efo' : { x: -0.795, y: -0.577, z:  0.188, n: 8 },
    'rea' : { x:  0.304, y: -0.934, z:  0.188, n: 9 },
    'me4' : { x:  0.795, y:  0.577, z: -0.188, n: 10 },
    'ous' : { x: -0.304, y:  0.934, z: -0.188, n: 11 },
    'hal' : { x: -0.982, y:  0.000, z: -0.188, n: 12 },
    'lno' : { x: -0.304, y: -0.934, z: -0.188, n: 13 },
    'tma' : { x:  0.795, y: -0.577, z: -0.188, n: 14 },
    'kef' : { x:  0.491, y:  0.357, z: -0.795, n: 15 },
    'ory' : { x: -0.188, y:  0.577, z: -0.795, n: 16 },
    'our' : { x: -0.607, y:  0.000, z: -0.795, n: 17 },
    'sel' : { x: -0.188, y: -0.577, z: -0.795, n: 18 },
    'fan' : { x:  0.491, y: -0.357, z: -0.795, n: 19 }
  },
  "edges" : {
    'ima' : { a: 'you', b: 'sha' },
    'gei' : { a: 'sha', b: 'llh' },
    'nth' : { a: 'llh', b: 'ave' },
    'for' : { a: 'ave', b: 'noo' },
    'mof' : { a: 'noo', b: 'you' },
    'any' : { a: 'llh', b: 'dsb' },
    'thi' : { a: 'dsb', b: 'hal' },
    'ngi' : { a: 'hal', b: 'efo' },
    'nhe' : { a: 'efo', b: 'ave' },
    'ven' : { a: 'dsb', b: 'ous' },
    'abo' : { a: 'ous', b: 'rgo' },
    'veo' : { a: 'rgo', b: 'sha' },
    'ron' : { a: 'efo', b: 'lno' },
    'hee' : { a: 'lno', b: 'rea' },
    'art' : { a: 'rea', b: 'noo' },
    'hbe' : { a: 'ous', b: 'ory' },
    'nea' : { a: 'ory', b: 'our' },
    'tho' : { a: 'our', b: 'hal' },
    'rin' : { a: 'sel', b: 'fan' },
    'hew' : { a: 'fan', b: 'tma' },
    'ate' : { a: 'tma', b: 'rea' },
    'rsb' : { a: 'our', b: 'sel' },
    'elo' : { a: 'sel', b: 'lno' },
    'w5y' : { a: 'tma', b: 'the' },
    'ush' : { a: 'the', b: 'you' },
    'all' : { a: 'ory', b: 'kef' },
    'not' : { a: 'kef', b: 'fan' },
    'bow' : { a: 'rgo', b: 'me4' },
    'dow' : { a: 'me4', b: 'the' },
    'nto' : { a: 'kef', b: 'me4' }
  }
};

init();