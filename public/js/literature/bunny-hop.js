(function () {
  function generateRandomColor() {
    var rand = Math.random();
    return '#' + ('00000' + (rand * (1 << 24) | 0).toString(16)).slice(-6)
  }

  function generateBuilding() {
    var rand = Math.random();

    var height = Math.floor(rand * 300) + 10;
    var width = Math.floor(rand * 100) + 40;
    var color = generateRandomColor();

    var building = new Kinetic.Rect({
      width: width,
      height: height,
      fill: color,
      stroke: 'black',
      strokeWidth: 4
    });

    return building;
  }

  function generateBuildings(numBuildings, images, callback) {
    var numConverted = 0;
    var maxBuildings = numBuildings;
    var buildings = [];

    var layer = new Kinetic.Layer();

    for (var i = 0; i < numBuildings; ++i) {
      var building = generateBuilding();

      layer.add(building);

      building.toImage({
        callback: function (img) {
          buildings.push(img);
          numConverted++;
          if (numConverted >= maxBuildings) {
            callback(buildings, images);
          }
        }
      });
    }

    layer.destroy();
  }

  function loadImages(params, callback) {
    var loadedImages = 0;
    var numImages = params.numSources;
    var sources = params.sources;
    var assetPath = params.assetPath;
    var images = {};

    for (var src in sources) {
      var img = new Image();
      images[src] = img;

      img.onload = function () {
        loadedImages++;

        if (loadedImages >= numImages) {
          params.images = images;
          callback(params, loadBuildings);
        }
      };
      img.src = assetPath + sources[src];
    }
  }

  function loadBuildings(params, callback) {
    generateBuildings(params.numBuildings, params.images, initStage);
  }

  function initStage(buildings, images) {
    // handlers for inactive tab
    // http://stackoverflow.com/questions/17218938/
    window.addEventListener('blur', function () {
      bunnyObjects.tabIsActive = false;
    }, false);

    window.addEventListener('focus', function () {
      bunnyObjects.tabIsActive = true;
    }, false);

    var stage = bunnyObjects.stage;
    var heights = [];

    for (var bld in buildings) {
      var bldImage = buildings[bld];

      var building = new Kinetic.Image({
        offset: {
          y: bldImage.height
        },
        y: bunnyObjects.stageInfo.height,
        image: bldImage,
      });
      bunnyObjects.buildings[bld] = building;
      heights.push(bldImage.height);
    }

    for (var img in images) {
      var image = images[img];
      var kImage = new Kinetic.Image({
        image: image,
        offset: {
          y: image.height
        }
      });

      bunnyObjects[img] = kImage;
    }

    var bunnyLayer = new Kinetic.Layer();

    heights.sort(function (a, b) {
      return b - a
    });
    var lastHeight = -1;
    for (var i = 0; i < heights.length; ++i) {
      var height = heights[i];
      if (height == lastHeight) {
        continue;
      }
      lastHeight = height;

      var layer = new Kinetic.Layer();
      stage.add(layer);
      bunnyObjects.buildingLayers[height] = layer;
    }

    stage.add(bunnyLayer);
    bunnyObjects.bunnyLayer = bunnyLayer;

    var bunnyGroup = new Kinetic.Group();
    bunnyGroup.add(bunnyObjects.bike);
    bunnyGroup.add(bunnyObjects.bunny);
    bunnyLayer.add(bunnyGroup);
    bunnyGroup.x(20);
    bunnyGroup.y(bunnyObjects.stageInfo.height);
    bunnyGroup.width(bunnyObjects.bunny.width());
    bunnyGroup.yForce = 0;
    bunnyObjects.bunnyGroup = bunnyGroup;

    update();
  }

  function fireNewBuilding(index, speed) {
    if (index == bunnyObjects.lastFired || speed == 0) {
      return;
    }

    bunnyObjects.lastFired = index;

    var bldOg = bunnyObjects.buildings[index];
    var bld = bldOg.clone();

    var layer = bunnyObjects.buildingLayers[bldOg.height()];

    layer.add(bld);

    bld.x(bunnyObjects.stageInfo.width);
    bld.speed = speed;

    bunnyObjects.activeBuildings.push(bld);
  }

  function bunnyHop(jump) {
    if (jump == 1 && bunnyObjects.lastHop == 0) {
      if (isBunnyOnSurface() != 0) {
        bunnyObjects.bunnyGroup.yForce = -bunnyObjects.jumpForce;
      }

      bunnyObjects.lastHop = jump;
    }
    else if (jump == 0) {
      bunnyObjects.lastHop = jump;
    }
  }

  function update() {
    // try to handle loss of focus
    // as requestAnimationFrame throttles in some browsers
    if (bunnyObjects.tabIsActive) {
      requestAnimationFrame(update);
    }
    else {
      setTimeout(update, 16);
    }

    var now = new Date().getTime() / 1000;
    var dt = now - (bunnyObjects.lastTime || now);
    bunnyObjects.lastTime = now;

    var removes = [];

    for (var activeIndex in bunnyObjects.activeBuildings) {
      var building = bunnyObjects.activeBuildings[activeIndex];
      var speed = building.speed;

      var x = -speed * dt;
      building.move({
        x: x
      });

      if (building.getX() <= 0 - building.width()) {
        building.remove();
        building.destroy();
        removes.push(activeIndex);
      }
    }

    for (var i = removes.length - 1; i >= 0; --i) {
      bunnyObjects.activeBuildings.splice(removes[i], 1);
    }

    var bunnyOnSurface = isBunnyOnSurface();
    var bunny = bunnyObjects.bunnyGroup;

    if (bunnyOnSurface != 0) {
      if (bunny.yForce > 0) {
        bunny.yForce = 0;
        bunny.y(bunnyOnSurface);
      }
    }
    else {
      bunny.yForce += bunnyObjects.gravity * dt;
    }

    bunny.move({
      y: bunny.yForce * dt
    });

    if (bunny.getY() >= bunnyObjects.stageInfo.height) {
      bunny.y(bunnyObjects.stageInfo.height);
    }

    bunnyObjects.stage.draw();
  }

  function isBunnyOnSurface() {
    var bunny = bunnyObjects.bunnyGroup;
    var left = bunny.getX() + 5;
    var right = bunny.getX() + bunny.width() - 5;
    var y = bunny.y();

    if (y >= bunnyObjects.stageInfo.height) {
      return bunnyObjects.stageInfo.height;
    }

    if (bunny.yForce < 0) {
      return 0;
    }

    // bunny can be on an object that is anywhere within his width
    // and only if the height of the object is within some margin
    // of his y (bottom, due to image offset)
    // building heights are rounded down, so int compare should be okay
    // so first let's see if there are any active buildings
    // that are near bunnyBottom in height
    var buildings = [];

    for (var bldIndex in bunnyObjects.activeBuildings) {
      var building = bunnyObjects.activeBuildings[bldIndex];
      var bldHeight = bunnyObjects.stageInfo.height - building.height();
      if (y >= bldHeight - 2 &&
        y <= bldHeight + 2) {
        buildings.push(building);
      }
    }

    // starting from highest layer
    // determine if bunny is on a building
    buildings.sort(function (a, b) {
      return a.height() - b.height();
    });

    for (var i = 0; i < buildings.length; ++i) {
      var building = buildings[i];
      var bldLeft = building.getX();
      var bldRight = building.getX() + building.width();
      if ((left >= bldLeft && left <= bldRight) ||
        (right <= bldRight && right >= bldLeft)) {
        return bunnyObjects.stageInfo.height - building.height();
      }
    }

    return 0;
  }

  var containerDiv = document.createElement('div');
  containerDiv.id = 'container';
  document.body.appendChild(containerDiv);

  bunnyObjects = {};
  bunnyObjects.buildings = {};
  bunnyObjects.bunny = {};
  bunnyObjects.bike = {};
  bunnyObjects.bunnyGroup = {};
  bunnyObjects.bunnyLayer = {};
  bunnyObjects.buildingLayers = {};
  bunnyObjects.activeBuildings = [];
  bunnyObjects.stageInfo = {};
  bunnyObjects.tabIsActive = true;
  bunnyObjects.gravity = 300;
  bunnyObjects.jumpForce = 200;
  bunnyObjects.stageInfo.height = 480;
  bunnyObjects.stageInfo.width = 960;
  bunnyObjects.lastTime = 0;
  bunnyObjects.lastFired = -1;
  bunnyObjects.lastHop = 0;
  bunnyObjects.stage = new Kinetic.Stage({
    container: 'container',
    width: bunnyObjects.stageInfo.width,
    height: bunnyObjects.stageInfo.height
  });

  var params = {
    assetPath: '/img/literature/bunny-hop/',
    sources: {
      bike: 'bike.png',
      bunny: 'bunny.png'
    },
    numSources: 2,
    numBuildings: 26,
    images: {}
  }

  loadImages(params, loadBuildings);

  uncontext.socket_.onmessage = function (message) {
    var data = JSON.parse(event.data);
    var bldIndex = data.a;
    var speed = data.b * data.d;
    var bunnyFire = data.c;

    fireNewBuilding(bldIndex, speed);
    bunnyHop(bunnyFire);
  };
})();