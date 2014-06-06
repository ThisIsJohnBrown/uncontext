(function() {
  uncontext.socket_.onmessage = function (event) {
    sockData = JSON.parse(event.data);  // stinky

    var shouldFire = sockData.c == 1;
    var fireAll    = sockData.b == 20.33;

    if (shouldFire || fireAll) {
      var firingPattern = generateFiringPattern(sockData);

      if (fireAll != true) {
        var whichFire = firingPattern.whichFire;
        var whereFire = firingPattern.whereFire;
        var howFire   = firingPattern.howFire;

        tryFire(firingPattern.whichFire, whereFire, howFire);
      }
      else
      {
        for (var i = 0; i < 32; ++i)
        {
          var whichFire = i;

          var whereFire = new THREE.Vector3(
            getRandomValue(-groundSpread, groundSpread),
            0,
            getRandomValue(-groundSpread, groundSpread));

          var fireY = getRandomValue(minThrust, maxThrust);

          var howFire = new THREE.Vector3(
            getRandomValue(-skySpread, skySpread),
            fireY,
            getRandomValue(-skySpread, skySpread)
          ).normalize().multiplyScalar(fireY);

          tryFire(whichFire, whereFire, howFire);
        }
      }
    }
  };

  var minStepRate        = 1 / 30;   // limit long frames to 30fps
  var lastFrame          = 0;
  var cameraAccumulator  = 0;        // used for moving camera
  var works              = [];
  var particleSystem     = {};
  var gravity            = new THREE.Vector3(0, -20, 0);
  var cameraStandoff     = 7500;
  var cameraPosition     = new THREE.Vector3(cameraStandoff / 3.1, 100, 0);
  var controls           = {};
  var controlsTarget     = new THREE.Vector3(0, cameraStandoff / 4, 0);
  var worksVertices      = {};
  var minThrust          = 2800;
  var maxThrust          = 3800;
  var skySpread          = 1000;
  var groundSpread       = 800;
  var skyMesh            = {};
  var particleAttributes = {};
  var particleUniforms   = {};
  var tabIsActive        = true; // is this tab focused. only seems to work
                                 // in chrome for loss of focus but contents
                                 // still visible. That is, switching to another
                                 // tab seems to stop animframe request

  function Work() {
    this.position  = new THREE.Vector3();
    this.velocity  = new THREE.Vector3();
    this.lifetime  = 0;
    this.workItems = [];
    this.burst     = false;
    this.alive     = false;
  }
  Work.prototype = {
    add: function(workItem) {
      workItem.parent = this;
      this.workItems.push(workItem);
    },
    fire: function(initialPosition, initialVelocity, lifetime) {
      this.position.copy(initialPosition);
      this.velocity.copy(initialVelocity);
      this.lifetime = lifetime;
      this.alive    = true;
      this.burst    = false;

      for (var i = 0; i < this.workItems.length; ++i) {
        var workItem = this.workItems[i];
        workItem.velocity.copy(workItem.initialVelocity);
        workItem.setAlpha(1);
      }
    },
    update: function(dt) {
      if (this.alive == false) {
        return;
      }

      if (this.burst == false) {
        var grav = (new THREE.Vector3()).copy(gravity);
        grav.add(this.velocity);

        if (grav.y < 0) {
          this._burst(this.position, this.velocity);
        }
        else {
          this.velocity = grav;

          var vel = (new THREE.Vector3()).copy(this.velocity);;
          vel.multiplyScalar(dt);

          this.position.add(vel);

          this._updateWorkItemsPositions(this.position);
        }
      }
      else {
        if (this.lifetime > 0) {
          this.lifetime -= dt;
          for (var i = 0; i < this.workItems.length; ++i) {
            var workItem = this.workItems[i];
            workItem.setAlpha(this.lifetime);
            workItem.update(dt);
          }
        }
        else {
          this.alive = false;
          this.position = new THREE.Vector3(0, -40, 0);
          this._updateWorkItemsPositions(this.position);
        }
      }
    },
    _updateWorkItemsPositions: function(pos) {
      for (var i = 0; i < this.workItems.length; ++i) {
        var workItem = this.workItems[i];
        workItem.position.copy(pos);
      }
    },
    _burst: function(startingPosition, impartVelocity) {
      this.burst = true;
      for (var i = 0; i < this.workItems.length; ++i) {
        var workItem = this.workItems[i];
        workItem.velocity.add(impartVelocity);
      }
    }
  }

  function WorkItem(geoVertex, color, vel, attributeIndex) {
    this.velocity        = (new THREE.Vector3()).copy(vel);
    this.initialVelocity = (new THREE.Vector3()).copy(vel);
    this.position        = geoVertex;
    this.color           = new THREE.Color(color);
    this.parent          = parent;
    this.attributeIndex  = attributeIndex;
    this.color.offsetHSL(0, 1, 0.25);
  }
  WorkItem.prototype = {
    update: function(dt) {
      var grav = (new THREE.Vector3()).copy(gravity);

      this.velocity.add(grav);

      var vel = (new THREE.Vector3()).copy(this.velocity);
      vel.multiplyScalar(dt);

      this.position.add(vel);
    },
    setAlpha: function(alpha) {
      particleAttributes.alpha.value[this.attributeIndex] = alpha;
    }
  }

  // handlers for inactive tab
  // http://stackoverflow.com/questions/17218938/
  window.addEventListener('blur', function () {
    tabIsActive = false;
  }, false);

  window.addEventListener('focus', function () {
    tabIsActive = true;
  }, false);

  function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
    camera.up = new THREE.Vector3(0, 1, 0);
    camera.position.copy(cameraPosition);

    controls = new THREE.OrbitControls(camera);
    controls.up = new THREE.Vector3(0, 1, 0);
    controls.autoRotate = true;
    controls.autoRotateSpeed = -0.5;
    controls.noPan = true;
    controls.minPolarAngle = 2.2117052346056183;
    controls.maxPolarAngle = 2.2117052346056183;
    controls.target.copy(controlsTarget);

    renderer = new THREE.WebGLRenderer({ alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    var particles = new THREE.Geometry();
    particles.alphas = [];
    particles.colors = [];

    particleAttributes = {
      alpha: {
        type: 'f',
        value: []
      },
      color: {
        type: 'c',
        value: []
      }
    };

    particleUniforms = {
      texture: {
        type: 't',
        value: THREE.ImageUtils.loadTexture('/img/literature/worksParticle.png')
      }
    }

    generateWorks(particles);

    particleAttributes.alpha.value = particles.alphas;
    particleAttributes.color.value = particles.colors;

    var vertShader = new String('                                \n\
      attribute float alpha;                                     \n\
      attribute vec3 color;                                      \n\
                                                                 \n\
      varying float vAlpha;                                      \n\
      varying vec3 vColor;                                       \n\
                                                                 \n\
      void main()                                                \n\
      {                                                          \n\
        vAlpha = alpha;                                          \n\
        vColor = color;                                          \n\
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); \n\
        gl_PointSize = 16.0;                                     \n\
        gl_Position = projectionMatrix * mvPosition;             \n\
      }                                                          \n\
    ');

    var fragShader = new String('            \n\
      varying float vAlpha;                  \n\
      varying vec3 vColor;                   \n\
                                             \n\
      uniform sampler2D texture;             \n\
                                             \n\
      void main()                            \n\
      {                                      \n\
        vec2 uv = gl_PointCoord;             \n\
        vec4 color = texture2D(texture, uv); \n\
        vec3 nColor = color.w * vColor.rgb;  \n\
        float alpha = color.w * vAlpha;      \n\
        gl_FragColor = vec4(nColor, alpha);  \n\
      }                                      \n\
    ');

    var partMat = new THREE.ShaderMaterial({
        uniforms:       particleUniforms,
        attributes:     particleAttributes,
        vertexShader:   vertShader,
        fragmentShader: fragShader,
        transparent:    true
    });

    particleSystem = new THREE.ParticleSystem(particles, partMat);
    particleSystem.sortParticles = true;

    scene.add(particleSystem);

    var light = new THREE.DirectionalLight();
    light.position.set(1, 1, 1);
    scene.add(light);

    var ambLight = new THREE.AmbientLight(0x020202);
    ambLight.position.set(0, 1, 1);
    scene.add(ambLight);

    var tree = null;
    for (var i = 0; i < 20; ++i) {
      tree = generateTree();
      tree.position.x = getRandomValue(-groundSpread * 4, groundSpread * 4);
      tree.position.z = getRandomValue(-groundSpread * 4, groundSpread * 4);
      scene.add(tree);
    }

    var skyGeo  = new THREE.SphereGeometry(50000, 16, 16);
    var texture = THREE.ImageUtils.loadTexture('/img/literature/paulbourke.net-starfield-4096x2048.png');
    var skyMat  = new THREE.MeshBasicMaterial({
      color: 'white',
      map: texture,
      wireframe: false,
      side: THREE.DoubleSide
    });
    skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);

    var groundGeo = new THREE.CircleGeometry(50000, 16);
    var groundMat = new THREE.MeshLambertMaterial({
      color: '#002200',
      wireframe: false
    });
    var groundMesh = new THREE.Mesh(groundGeo, groundMat);

    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y;
    scene.add(groundMesh);

    window.addEventListener('resize', onWindowResize, false);

    loop();
  }

  // the randomest of random trees. Sometimes the leaves don't touch the trunk
  function generateTree() {
    var treeObject = new THREE.Object3D();

    var leafGeometry = new THREE.SphereGeometry(80);
    var leafMaterial = new THREE.MeshLambertMaterial({
      color: 'green'
    });

    var leafMesh = new THREE.Mesh(leafGeometry, leafMaterial);

    for (var i = 0; i < 10; ++i) {
      var newLeaf = leafMesh.clone();
      treeObject.add(newLeaf);

      newLeaf.position.x += getRandomValue(-120, 120);
      newLeaf.position.y += 400 + getRandomValue(0, 120);
      newLeaf.position.z += getRandomValue(-120, 120);
    }

    var trunkGeometry = new THREE.CylinderGeometry(30, 60, 600, 16);
    var trunkMaterial = new THREE.MeshLambertMaterial({
      color: 'brown'
    });
    var trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunkMesh.position.y += 200;
    treeObject.add(trunkMesh);

    return treeObject;
  }

  function generateFiringPattern(sockData) {
    var fireY = (sockData.e.f / sockData.e.g) *
      (maxThrust - minThrust) + minThrust;
    var firingPattern = {
      whichFire: sockData.a,
      whereFire: new THREE.Vector3(
        getRandomValue(-groundSpread, groundSpread),
        0,
        getRandomValue(-groundSpread, groundSpread)
      ),
      howFire: new THREE.Vector3(
        getRandomValue(-skySpread, skySpread),
        fireY,
        getRandomValue(-skySpread, skySpread)
      ).normalize().multiplyScalar(fireY),
    };

    return firingPattern;
  }

  function generateWorks(particles) {
    for (var i = 0; i < 32; ++i) {
      var color = generateRandomColor();

      var work = new Work();

      var aX     = getRandomValue(-1, 1);
      var aY     = getRandomValue(-1, 1);
      var aZ     = getRandomValue(-1, 1);
      var axis   = new THREE.Vector3(aX, aY, aZ);
      var angle  = getRandomValue(0, 2 * Math.PI);
      var matrix = new THREE.Matrix4().makeRotationAxis(axis, angle);
      var type   = getRandomIntValue(0, 5);

      for (var p = 0; p < 400; ++p) {
        var vert   = new THREE.Vector3();
        var vel    = new THREE.Vector3();
        var scalar = getRandomValue(600, 1400);

        switch (type) {
          case 0:
            vel.x = getRandomValue(-1, 1);
            vel.y = getRandomValue(-1, 1);
            vel.z = getRandomValue(-1, 1);

            scalar = getRandomValue(900, 1100);
            break;
          case 1:
            vel.x = getRandomValue(-0.5, 0.5);
            vel.y = getRandomValue(-0.5, 0.5);
            vel.z = getRandomValue(-10, 10);

            scalar = getRandomValue(50, 3000);

            color = generateRandomColor();
            break;
          case 2:
            vel.x = getRandomValue(-1, 1);
            vel.y = getRandomValue(-0.1, 0.1);
            vel.z = getRandomValue(-1, 1);
            break;
          case 3:
            vel.x = getRandomValue(-0.1, 0.1);
            vel.y = getRandomValue(-0.1, 0.1);
            vel.z = getRandomValue(-1, 1);
            break;
          case 4:
            vel.x = getRandomValue(-1, 1);
            vel.y = getRandomValue(-1, 1);
            vel.z = getRandomValue(-1, 1);

            scalar = getRandomValue(900, 1100);

            color = generateRandomColor();
            break;
          case 5:
            vel.x = getRandomValue(-0.5, 0.5);
            vel.y = getRandomValue(-0.5, 0.5);
            vel.z = getRandomValue(-10, 10);

            scalar = getRandomValue(50, 3000);
            break;
        }
        vel.applyMatrix4(matrix);

        vel.normalize().multiplyScalar(scalar);

        var workItem = new WorkItem(vert, color, vel, particles.alphas.length);
        work.add(workItem);

        particles.vertices.push(vert);
        particles.colors.push(workItem.color);
        particles.alphas.push(1);
      }
      works.push(work);
    }
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
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

  function tryFire(workType, position, velocity) {
    var work = works[workType];
    if (work != undefined && work.alive == false) {
      var life = getRandomValue(0.8, 1.3);
      work.fire(position, velocity, life);
    }
  }

  function update(dt) {
    if (dt == 0)
    {
      return;
    }

    controls.update();
    skyMesh.position.copy(camera.position);

    cameraAccumulator += dt;

    for (var i = 0; i < works.length; ++i) {
      var work = works[i];
      work.update(dt);
    }

    // particleSystem.geometry.verticesNeedUpdate = true;
    particleAttributes.alpha.needsUpdate = true;
  }

  function getRandomIntValue(min, max) {
    var val = getRandomValue(min, max);
    val = Math.round(val);
    return val;
  }

  function getRandomValue(min, max) {
    var p  = Math.random();
    var dt = max - min;

    p = min + p * dt;

    return p;
  }

  function render() {
    renderer.render(scene, camera);
  }

  require(["/js/literature/OrbitControls.js"], init);
})();