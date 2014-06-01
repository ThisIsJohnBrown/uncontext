(function() {
  uncontext.socket_.onmessage = function (event) {
    socketData = JSON.parse(event.data);

    var newTarget = socketData.c;

    if (newTarget == 1 && lastTarget == 0) {
      var target = ribbonTarget;

      target.x = getRandomValue(-arenaHalfSize, arenaHalfSize);
      target.y = getRandomValue(-arenaHalfSize, arenaHalfSize);
      target.z = getRandomValue(-arenaHalfSize, arenaHalfSize);

      lastTarget = newTarget;
    }
    else if (newTarget == 0) {
      lastTarget = newTarget;
    }
  };

  var lastTarget        = 0;    // used for tracking incoming data for new target
  var maxRibbonLength   = 400;
  var numCubes          = 700;  // canvas suffers with more than ... 75?
  var arenaHalfSize     = 100;  
  var maxCubeSize       = 6;    // <--
  var ribbonTube        = {};   // ribbon body
  var headMaterials     = [];   // for multi material mesh object
  var ribbonHead        = {};   // chomp chomp
  var container         = {};
  var renderer          = {};
  var camera            = {};
  var pointLight        = {};
  var ribbonPositions   = [];   // historical position
  var maxRibbonVelocity = 40;
  var ribbonVelocity    = new THREE.Vector3(20, 0, 0);
  var ribbonTarget      = new THREE.Vector3(100, 100, 0);
  var ribbonMass        = 75;   // affects turn radius
  var minStepRate       = 1 / 30;  // limit long frames to 30fps
  var lastFrame         = 0;
  var cameraAccumulator = 0;    // used for offsetting head
  var headSwapTimer     = 0;
  var headSwapInterval  = 0.25; // seconds between toggling head texture
  var tabIsActive       = true; // is this tab focused. only seems to work
                                // in chrome for loss of focus but contents
                                // still visible. That is, switching to another
                                // tab seems to stop animframe request

  // handlers for inactive tab
  // http://stackoverflow.com/questions/17218938/
  window.addEventListener('blur', function () {
    tabIsActive = false;
  }, false);

  window.addEventListener('focus', function () {
    tabIsActive = true;
  }, false);

  init();
  loop();

  function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    
    for (var i = 0; i < maxRibbonLength; ++i) {
      ribbonPositions.push(new THREE.Vector3());
    }

    camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 1, 100000 );
    camera.up = new THREE.Vector3(0, 1, 0);

    ribbonTube = null;

    var cubeSpace = arenaHalfSize * 1.55;
    for (var i = 0; i < numCubes; ++i) {
      var x = getRandomValue(-cubeSpace, cubeSpace);
      var y = getRandomValue(-cubeSpace, cubeSpace);
      var z = getRandomValue(-cubeSpace, cubeSpace);

      var size = getRandomValue(0, maxCubeSize);
      var color = generateRandomColor();

      var geom = new THREE.BoxGeometry(size, size, size);
      var mat = new THREE.MeshPhongMaterial({
        color: color,
        specular: color
      });
      var cube = new THREE.Mesh(geom, mat);
      cube.position = new THREE.Vector3(x, y, z);

      scene.add(cube);
    }
    
    var path = '/img/literature/ribbon/';
    var chomp1Tex = THREE.ImageUtils.loadTexture(path + 'chomp1face.png');
    var chomp2Tex = THREE.ImageUtils.loadTexture(path + 'chomp2face.png');

    var chomp1Mat = new THREE.MeshLambertMaterial( {
      color       : 'white',
      emissive   : 'black',
      map         : chomp1Tex,
      opacity     : 1.0,
      transparent : false
    })
    var chomp2Mat = new THREE.MeshLambertMaterial( {
      color      : 'white',
      emissive   : 'black',
      map        : chomp2Tex,
      opacity    : 0.0,
      transparent : true
    })

    headMaterials.push(chomp1Mat);
    headMaterials.push(chomp2Mat);

    var headGeo = new THREE.SphereGeometry(2.1, 16, 16);
    ribbonHead = THREE.SceneUtils.createMultiMaterialObject(headGeo, headMaterials);
    scene.add(ribbonHead);

    pointLight = new THREE.PointLight(0xffffff, 2, 400);
    scene.add(pointLight);

    var ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    scene.fog = new THREE.FogExp2('black', 0.015);

    renderer = new THREE.WebGLRenderer( { alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild( renderer.domElement );

    window.addEventListener('resize', onWindowResize, false);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function generateRandomColor() {
    var rand = Math.random();
    return '#' + ('00000' + (rand * (1 << 24) | 0).toString(16)).slice(-6)
  }

  function loop() {
    if (tabIsActive) {
      requestAnimationFrame(loop);
    }
    else {
      setTimeout(loop, 16);
    }

    var now = new Date().getTime() / 1000;
    var dt = now - (lastFrame || now);
    if (dt > minStepRate) {
      dt = minStepRate;
    }

    lastFrame = now;

    update(dt); 
    render(dt);
  }

  function getRandomValue(min, max) {
    var p = Math.random();
    var dt = max - min;
    p = min + p * dt;

    return p;
  }

  function seek(target) {
    var desiredVelocity = (new THREE.Vector3().copy(target));
    desiredVelocity.sub(ribbonPositions[0]).multiplyScalar(maxRibbonVelocity);
    desiredVelocity.sub(ribbonVelocity);

    var steering = desiredVelocity;
    var mag = steering.length();
    steering.setLength(Math.min(mag, maxRibbonVelocity));
    steering.divideScalar(ribbonMass);

    var velocity = (new THREE.Vector3().addVectors(steering, ribbonVelocity));
    mag = velocity.length();
    velocity.setLength(Math.min(mag, maxRibbonVelocity));

    return velocity;
  }

  function updatePosition(dt) {
    ribbonPositions.pop();

    var newVelocity = seek(ribbonTarget);
    ribbonVelocity.copy(newVelocity);
    pos = (new THREE.Vector3()).copy(ribbonPositions[0])
    pos.add(newVelocity.multiplyScalar(dt));

    ribbonPositions.unshift(pos);

    var curvePath = new THREE.CurvePath();

    for (var i = 0; i < maxRibbonLength - 1; ++i) {
      var p1    = ribbonPositions[i + 0];
      var p2    = ribbonPositions[i + 1];
      var curve = new THREE.LineCurve3(p1, p2);
      curvePath.add(curve);
    }

    var curveGeometry = curvePath.createGeometry(ribbonPositions);
    var tubeGeo = new THREE.TubeGeometry(curvePath, maxRibbonLength / 2, 2, 12, false);

    if (ribbonTube == null) {
      var rainbow = THREE.ImageUtils.loadTexture('/img/literature/ribbon/rainbow.png');
      ribbonTube = new THREE.Mesh(tubeGeo,
        new THREE.MeshPhongMaterial({
            color    : 'white',
            emissive : 'black',
            map      : rainbow,
            side     : THREE.DoubleSide
        }));

      scene.add(ribbonTube);
    }

    var headLook = (new THREE.Vector3().addVectors(ribbonPositions[0], ribbonVelocity));
    ribbonHead.position.copy(ribbonPositions[0]);
    ribbonHead.lookAt(headLook);

    ribbonTube.geometry.vertices = tubeGeo.vertices;
    ribbonTube.geometry.verticesNeedUpdate = true;
    ribbonTube.geometry.computeBoundingSphere();
  }

  function update(dt) {
    if (dt == 0)
    {
      return;
    }

    headSwapTimer += dt;
    cameraAccumulator += dt;

    updatePosition(dt);

    if (headSwapTimer >= headSwapInterval)
    {
      var temp = headMaterials[0].opacity;
      headMaterials[0].opacity = headMaterials[1].opacity;
      headMaterials[1].opacity = temp;

      var temp = headMaterials[0].transparent;
      headMaterials[0].transparent = headMaterials[1].transparent;
      headMaterials[1].transparent = temp;

      headSwapTimer = 0;
    }
  }

  function render() {
    var vel = (new THREE.Vector3().copy(ribbonVelocity)).normalize();
    vel.multiplyScalar(20);

    camera.position.copy(vel).add(ribbonPositions[0]);

    vel.multiplyScalar(2);
    pointLight.position.copy(vel).add(ribbonPositions[0]);

    camera.position.x += 10 * Math.cos(cameraAccumulator * 0.1);
    camera.position.y += 10 * Math.sin(cameraAccumulator * 0.1);
    camera.position.z += 10 * Math.sin(cameraAccumulator * 0.1);

    camera.lookAt(ribbonPositions[0]);

    renderer.render(scene, camera);
  }
})();