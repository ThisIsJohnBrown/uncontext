var camera = {};               // Three.js scene objects
var renderer = {};
var projector = {};
var scene = {};
var wall = {};                 // Touch points intersect the wall to find scene positions
var allMeshes = [];            // Generated mesh items stored here
var selectionMeshes = [];      // In-progress selection meshes
var geoTri = {};               // Master object used to create new meshes
var materialSelection = {};    // Material applied to selection meshes
var materials = [];            // Currently selected material array
var materialsSolid = [];       // Solid material array, used by default
var materialsWire = [];        // Wireframe material array
var starfield = {};
var socket = {};               // Connection to Uncontext

/**
 * Inlining THREEx.WindowResize
 */
var THREEx = THREEx || {};

/**
 * Update renderer and camera when the window is resized
 *
 * @param {Object} renderer the renderer to update
 * @param {Object} Camera the camera to update
 */
THREEx.WindowResize = function (renderer, camera) {
    var callback = function () {
        // notify the renderer of the size change
        renderer.setSize(window.innerWidth, window.innerHeight);
        // update the camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    // bind the resize event
    window.addEventListener('resize', callback, false);
    // return .stop() the function to stop watching window resize
    return {
        /**
         * Stop watching window resize
         */
        stop: function () {
            window.removeEventListener('resize', callback);
        }
    };
};

// Trimeshter is self-initializing!
init();

/**
 * Calls all init modules
 */
function init() {
    config = initConfig();
    initThree();
    initMaterials();
    initStarfield();
    initBranding();
    initInput();
    animate();
}

/**
 * Setup the Uncontext connection
 */
function initInput(){
    // Start with no drift
    config.drift.x = config.drift.y = config.drift.z = 0;

    // process incoming socket data
    uncontext.socket_.onmessage = processUncontextMessage;
}

/**
 * Setup custom config settings
 */
function initConfig() {
    return {
        mirror: true,
        connectToSelf: false,
        randomZ: 10,
        wireframe: false,
        tween: {
            active: true,
            growDuration: 1,
            lifetime: 30
        },
        drift: {
            x: 0.0,
            y: 0.0,
            z: 0.0
        },
        starfield: {
            bounds: {
                x: 220,
                y: 90,
                z: 300
            },
            count: 1000
        }
    }
}

function initBranding() {
    $("body").prepend("<div id='branding'><img src='/img/literature/trimeshter/branding.png'></div>");
}

/**
 * Set up THREE.js scene
 */
function initThree() {
    renderer = new THREE.WebGLRenderer({ antialias: true});

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    projector = new THREE.Projector();
    camera.position.z = 100;

    // THREEx plugins
    THREEx.WindowResize(renderer, camera);

    scene = new THREE.Scene();

    // Make wall for pointer intersection
    wall = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshBasicMaterial({color: 0x89898900}));

    // Set Default objects
    geoTri = buildMasterObject();
    materialSelection = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: false, side: THREE.DoubleSide });
}

/**
 * Create materials array to use
 * There are several palettes to choose from
 * And we generate a solid and wireframe array of our chosen palette
 */
function initMaterials() {

    var paletteUncontext = [
        [110, 29, 181],
        [255, 243, 231],
        [255, 255, 255],
        [54, 54, 54],
        [96, 24, 72],
        [192, 72, 72],
        [240, 114, 65],
        [63, 176, 148],
        [125, 180, 181]
    ];

    materialsSolid = buildMaterials(paletteUncontext, false);
    materialsWire = buildMaterials(paletteUncontext, true);

    materials = materialsSolid;
}

/**
 * Create the object that will be cloned to create all new objects
 * @returns Geometry
 */
function buildMasterObject() {
    var triangle = new THREE.Shape([
        new THREE.Vector2(-0.5, -0.75),
        new THREE.Vector2(0.5, -0.75),
        new THREE.Vector2(0, 0)
    ]);

    //	var geometry = new THREE.ExtrudeGeometry(triangle, { amount:2 });
    var geometry = triangle.makeGeometry();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    geometry.faceVertexUvs[0][0][0] = new THREE.Vector2(-1, 0);
    geometry.faceVertexUvs[0][0][2] = new THREE.Vector2(1, 0);
    geometry.faceVertexUvs[0][0][1] = new THREE.Vector2(0, 1);

    return geometry;
}

/**
 * Generate materials from color palette
 * @param palette
 * @param wireframe
 * @returns {Array}
 */
function buildMaterials(palette, wireframe) {
    var result = [];
    var width = 256;
    var height = 256;

    for (var i in palette) {
        var color = palette[i];

        // Prepare off-screen canvas
        var bitmap = document.createElement('canvas');
        var ctx = bitmap.getContext('2d');
        bitmap.width = 256;
        bitmap.height = 256;

        // Draw Gradient
        var grd = ctx.createLinearGradient(0, 0, 0, height);  //x0, y0, x1, y1
        grd.addColorStop(0, 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',0)');
        grd.addColorStop(1, 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',1)');

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, width, height);

        var texture = new THREE.Texture(bitmap);
        texture.needsUpdate = true;

        // Push generated texture into array as Material
        result.push(
            new THREE.MeshBasicMaterial({
                transparent: true,
                map: texture,
                wireframe: wireframe,
                side: THREE.DoubleSide
            })
        );
    }

    return result;
}

/**
 * Create starfield particles
 */
function initStarfield() {
    starfield = new THREE.Object3D();

    var star;
    var material = generateStarMaterial();

    for (var i = 0; i < config.starfield.count; ++i) {
        star = new THREE.Particle(material);
        star.position.x = getRandomArbitrary(-config.starfield.bounds.x, config.starfield.bounds.x);
        star.position.y = getRandomArbitrary(-config.starfield.bounds.y, config.starfield.bounds.y);
        star.position.z = getRandomArbitrary(-config.starfield.bounds.z, config.starfield.bounds.z / 4);

        starfield.add(star);
    }

    scene.add(starfield);
}

/**
 * Create star-like material
 * From http://threejs.org/examples/#canvas_particles_sprites
 * @returns {THREE.SpriteMaterial}
 */
function generateStarMaterial() {
    // Prepare off-screen canvas
    var bitmap = document.createElement('canvas');
    var ctx = bitmap.getContext('2d');
    bitmap.width = 16;
    bitmap.height = 16;

    // Draw Gradient
    var gradient = ctx.createRadialGradient(bitmap.width / 2, bitmap.height / 2, 0, bitmap.width / 2, bitmap.height / 2, bitmap.width / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.4, 'rgba(64,64,64,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, bitmap.width, bitmap.height);

    var texture = new THREE.Texture(bitmap);
    texture.needsUpdate = true;

    var material = new THREE.SpriteMaterial({
        map: texture,
        blending: THREE.AdditiveBlending
    });

    return material;
}

/**
 * Add selection mesh to scene and selectionMeshes array
 * @param touchid
 */
function addSelectionMeshes(touchid) {
    var numSelectionsToMake = config.mirror ? 2 : 1;
    // Create and Add all selection meshes
    for (var i = 0; i < numSelectionsToMake; i++) {
        //        var material = getRandomMaterial();
        //        var material = materialsSolid[3];
        var material = materialSelection;
        var mesh = new THREE.Mesh(geoTri.clone(), material.clone());
        mesh.geometry.dynamic = true;
        mesh.touchid = touchid;
        selectionMeshes.push(mesh);
        scene.add(mesh);
    }
}

/**
 * Removes selection mesh created by target touch id
 * Splices from selectionMeshes array and removes from scene
 * @param touchid
 */
function removeSelectionMeshes(touchid) {
    for (var i = selectionMeshes.length - 1; i >= 0; i--) {
        if (selectionMeshes[i].touchid == touchid) {
            var mesh = selectionMeshes.splice(i, 1)[0];
            scene.remove(mesh);
        }
    }
}

/**
 * Update all selection meshes
 * Render Scene
 * Call requestAnimationFrame(self)
 */
function animate(time) {

    if (config.drift.x != 0 || config.drift.y != 0 || config.drift.z != 0) {
        for (var i = 0; i < allMeshes.length; i++) {
            var mesh = allMeshes[i];
            for (var v = 0; v < mesh.geometry.vertices.length; v++) {
                var vertex = mesh.geometry.vertices[v];
                vertex.x += config.drift.x;
                vertex.y += config.drift.y;
                vertex.z += config.drift.z;
            }
            mesh.geometry.verticesNeedUpdate = true;
        }

        starfield.children.forEach(function (star) {
            star.position.x += config.drift.x;
            star.position.y += config.drift.y;
            star.position.z += config.drift.z;

            if (star.position.x > config.starfield.bounds.x) {
                star.position.x = -config.starfield.bounds.x;
            }
            if (star.position.x < -config.starfield.bounds.x) {
                star.position.x = config.starfield.bounds.x;
            }
            if (star.position.y > config.starfield.bounds.y) {
                star.position.y = -config.starfield.bounds.y;
            }
            if (star.position.y < -config.starfield.bounds.y) {
                star.position.y = config.starfield.bounds.y;
            }
            if (star.position.z > config.starfield.bounds.z) {
                star.position.z = -config.starfield.bounds.z;
            }
            if (star.position.z < -config.starfield.bounds.z) {
                star.position.z = config.starfield.bounds.z;
            }
        });

    }

    for (var i = selectionMeshes.length - 1; i >= 0; i--) {
        selectionMeshes[i].geometry.verticesNeedUpdate = true;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

/**
 * Process incoming Uncontext messages
 * @param message
 */
function processUncontextMessage(message) {
    // track high numbers for a, b, f and g
    var maxA = 25;
    var maxB = 20;
    var maxF = 400;
    var maxG = 467;

    var data = JSON.parse(message.data);

    // Convert A and B to X and Y
    var aDiff = window.innerWidth / maxA;
    var bDiff = window.innerHeight / maxB;

    var aNorm = data.a / maxA;
    var windowWidthQuarter = window.innerWidth * 0.25;
    var x = aNorm * (windowWidthQuarter * 2) + windowWidthQuarter;
    var y = bDiff * data.b;

    var event = {x: x, y: y, id: 0};

    // Convert F and G to Drifts
    var fDiff = 1 / maxF;
    var gDiff = 1 / maxG;
    var xDrift = (data.c === 1) ? -0.1 : 0.1;
    var yDrift = fDiff * data.e.f;
    var zDrift = gDiff * data.e.g;

    // make drifts dip into negative
    yDrift -= 0.25;
    zDrift -= 0.25;

    // Apply new drift amounts
    TweenMax.to(config.drift, 2, {y: yDrift, z: zDrift, ease: Cubic.easeInOut});

    // Set mirror mode from C
//    config.mirror = data.c === 1;

    // Call all three events to immediately build a new face
    onStart(event);
    onMove(event);
    onEnd(event);

}

/**
 * Main hook for Inputs
 * Adds new selection mesh
 * @param event has x, y, id
 */
function onStart(event) {
    addSelectionMeshes(event.id);
}

/**
 * Main hook for Inputs
 * Updates geometry of selection mesh based on nearest points
 * TODO: make search its own function?
 * @param event has x, y, id
 */
function onMove(event) {
    var x = ( event.x / window.innerWidth ) * 2 - 1;
    var y = -( event.y / window.innerHeight ) * 2 + 1;
    var z = event.z || 0;

    var position = getWorldPosition(x, y);
    if (position) {
        for (var i = selectionMeshes.length - 1; i >= 0; i--) {

            var mesh = selectionMeshes[i];

            if (mesh.touchid == event.id) {

                // set third vertex to cursor position
                var vertex = mesh.geometry.vertices[2];
                var isEven = (i % 2 == 0);

                if (isEven && config.mirror) {
                    var middle = window.innerWidth / 2;
                    var isRightSide = (position.x > 0);
                    var offset = Math.abs(position.x);
                    if (isRightSide) {
                        // Flip to Left Side
                        vertex.x = -offset;
                    } else {
                        // Flip to Right Side
                        vertex.x = offset;
                    }
                } else {
                    vertex.x = position.x;
                }

                var sortedPoints = [];
                var allPoints = [];

                // construct allPoints from allMeshes
                allMeshes.forEach(function (mesh) {
                    mesh.geometry.vertices.forEach(function (vertex) {
                        allPoints.push(vertex);
                    });
                });

                // clear dupes
                allPoints = allPoints.filter(function (item, index, inputArray) {
                    return inputArray.indexOf(item) == index;
                });

                allPoints.forEach(function (point) {
                    sortedPoints.push({ x: point.x, y: point.y, d: point.distanceTo(vertex)});
                });

                // search through selection meshes, too
                if (config.connectToSelf) {
                    selectionMeshes.forEach(function (mesh) {
                        if (mesh.touchid != event.id) {
                            for (var i = 0; i < 3; i++) {
                                var point = mesh.geometry.vertices[i];
                                sortedPoints.push({x: point.x, y: point.y, d: point.distanceTo(vertex)});
                            }
                        }
                    });
                }

                sortByKey(sortedPoints, "d");

                vertex.y = position.y;
                vertex.z = z;

                vertex = mesh.geometry.vertices[0];
                var targetPoint = sortedPoints[0] || new THREE.Vector2(0, 0);
                vertex.x = targetPoint.x;
                vertex.y = targetPoint.y;

                // Make sure picked points have some space between them
                var secondPointIndex = 1;
                var tooSmall = true;
                while (tooSmall) {
                    var secondPoint = sortedPoints[ secondPointIndex ];
                    if (secondPoint) {
                        var innerDistance = new THREE.Vector2(secondPoint.x, secondPoint.y).distanceTo(sortedPoints[0]);
                        tooSmall = ( innerDistance < 2 );
                        secondPointIndex++;
                    } else {
                        secondPointIndex = 0;
                        tooSmall = false;
                    }
                }

                var targetVertex = mesh.geometry.vertices[1];
                targetPoint = sortedPoints[ secondPointIndex ] || new THREE.Vector2(0, 0);
                targetVertex.x = targetPoint.x;
                targetVertex.y = targetPoint.y;

            }
        }
    }

}

/**
 * Main hook for Inputs
 * Creates new mesh from selection mesh, then deletes selection
 * New mesh is assigned a lifetime and grown in with a Tween
 * @param event
 */
function onEnd(event) {

    var x = ( event.x / window.innerWidth ) * 2 - 1;
    var y = -( event.y / window.innerHeight ) * 2 + 1;
    var z = event.z || getRandomArbitrary(config.randomZ, -config.randomZ);
    var self = this;    // store this for use in Tween functions below

    var position = getWorldPosition(x, y);
    if (position) {
        // get material to share for all new meshes
        var material = getRandomMaterial();
        for (var i = 0; i < selectionMeshes.length; i++) {

            var mesh = selectionMeshes[i];

            if (mesh.touchid == event.id) {
                mesh.geometry.vertices[2].z = z;

                // add new Mesh to scene
                var meshClone = new THREE.Mesh(mesh.geometry.clone(), material);
                var meshWire = new THREE.Mesh(mesh.geometry.clone(), materialsWire[1]);
                meshWire.position.z -= 1.5;

                // Add the meshes to the scene
                var newMeshes = [meshClone, meshWire];
                for (m in newMeshes) {
                    growNewObject(newMeshes[m]);
                }

            }

        }
        // kill selection meshes once the piece has been grown
        removeSelectionMeshes(event.id);
    }
}

/**
 * Add Mesh to allMeshes and scene
 * Grow it in, tween it out
 * @param mesh
 */
function growNewObject(mesh) {
    mesh.geometry.dynamic = true;
    allMeshes.push(mesh);
    scene.add(mesh);

    if (config.tween.active) {

        // initial growth tween
        var vertex = mesh.geometry.vertices[2];
        var targetPoint = vertex.clone();
        var ungrownPoint = mesh.geometry.vertices[0];
        vertex.set(ungrownPoint.x, ungrownPoint.y, ungrownPoint.z);
        TweenMax.to(vertex, config.tween.growDuration, {
            ease: Cubic.easeOut,
            x: targetPoint.x,
            y: targetPoint.y,
            z: targetPoint.z
        });

        // Lifetime tween - update geometry every frame, kill it when finished
        TweenMax.to(mesh, config.tween.lifetime, {
            onComplete: killMesh,
            onCompleteParams: ["{self}"],
            onUpdate: function () {
                this.target.geometry.verticesNeedUpdate = true;
            }
        });

        // Transition out at end of lifetime
        TweenMax.to(vertex, config.tween.growDuration, {
            delay: config.tween.lifetime - config.tween.growDuration,
            ease: Expo.easeIn,
            onStart: function () {
                this.updateTo({
                    x: mesh.geometry.vertices[0].x,
                    y: mesh.geometry.vertices[0].y,
                    z: mesh.geometry.vertices[0].z
                });
            }
        })
    }

}

/**
 * Remove mesh from allMeshes and scene
 * @param tween
 */
function killMesh(tween) {
    var idx = allMeshes.indexOf(tween.target);
    if (idx > -1) {
        allMeshes.splice(idx, 1);
    }
    scene.remove(tween.target);
}

/**
 * Gets a random selection from the selected materials array
 * @returns THREE.Material
 */
function getRandomMaterial() {
    return materials[ Math.floor(Math.random() * materials.length)];
}

/**
 * Finds the world position from x&y screen positions
 * @param x
 * @param y
 * @returns {*}
 */
function getWorldPosition(x, y) {
    var vector = new THREE.Vector3(x, y, 0);
    projector.unprojectVector(vector, camera);

    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    var intersects = raycaster.intersectObjects([wall]);

    if (intersects.length > 0) {
        return( intersects[0].point );
    } else {
        return false;
    }
}

/**
 * Sorts an array by one of its keys
 * @param array
 * @param key
 * @returns sorted {Array}
 */
function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

/**
 * Returns a random number between min and max
 * @param min
 * @param max
 * @returns {*}
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}