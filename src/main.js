"use strict";

require([
  "libs/text!shaders/terrain.vert",
  "libs/text!shaders/example.frag",
  "libs/text!shaders/simplex-noise.glsl",
  "libs/orbit-controls"
],

function (exampleVert, exampleFrag, simplexNoise) {
  var camera, controls, renderer, scene;
  var tileGeometry;
  var heightTex, normalTex;
  var t = new Date();
  var midPos = new THREE.Vector2(0, 0);

  // Global Consts
  var TERRAIN_WIDTH = 1024, TERRAIN_HEIGHT = 1024;
  var TILE_RES = 32;
  var LOD_LEVELS = 6;

  var MORPH = {
    NONE: new THREE.Vector2(0, 0),

    TOP: new THREE.Vector2(0, 1),
    RIGHT: new THREE.Vector2(1, 0),
    BOTTOM: new THREE.Vector2(0, -1),
    LEFT: new THREE.Vector2(-1, 0)
  };

  heightTex = THREE.ImageUtils.loadTexture('textures/heightmap-blur.png', {}, function() {
    normalTex = THREE.ImageUtils.loadTexture('textures/normalmap-blur.png', {}, function() {
      init();
      animate();
    });
  });

  function init() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 1, 99999);
    camera.position.set(0, 0, 2048);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    scene = new THREE.Scene();

    tileGeometry = new THREE.PlaneGeometry(1, 1, TILE_RES, TILE_RES);
    var moveAnchor = new THREE.Matrix4();
    moveAnchor.makeTranslation(0.5, 0.5, 0);
    tileGeometry.applyMatrix(moveAnchor);

    var lodMaxScale = TERRAIN_WIDTH/Math.pow(2, LOD_LEVELS);

    /**
     * Add center tiles
     */
    addTile(0, 0, lodMaxScale, MORPH.NONE);
    addTile(0, -lodMaxScale, lodMaxScale, MORPH.NONE);
    addTile(-lodMaxScale, -lodMaxScale, lodMaxScale, MORPH.NONE);
    addTile(-lodMaxScale, 0, lodMaxScale, MORPH.NONE);

    /**
     * Add clipmap "shells"
     *          -->
     *    +---+---+---+---+
     *    | L | T | T | T |
     *    +---+---+---+---+
     *    | L |   |   | R | |
     *  ^ +---+---+---+---+ v
     *  | | L |   |   | R |
     *    +---+---+---+---+
     *    | B | B | B | R |
     *    +---+---+---+---+
     *            <--
     */
    for (var scale = lodMaxScale; scale < TERRAIN_WIDTH; scale *= 2) {
      // T
      addTile(-scale, scale, scale, MORPH.TOP);
      addTile(0, scale, scale, MORPH.TOP);
      addTile(scale, scale, scale, MORPH.TOP.clone().add(MORPH.RIGHT));

      // R
      addTile(scale, 0, scale, MORPH.RIGHT);
      addTile(scale, -scale, scale, MORPH.RIGHT);
      addTile(scale, -2*scale, scale, MORPH.RIGHT.clone().add(MORPH.BOTTOM));

      // B
      addTile(0, -2*scale, scale, MORPH.BOTTOM);
      addTile(-scale, -2*scale, scale, MORPH.BOTTOM);
      addTile(-2*scale, -2*scale, scale, MORPH.BOTTOM.clone().add(MORPH.LEFT));

      // L
      addTile(-2*scale, -scale, scale, MORPH.LEFT);
      addTile(-2*scale, 0, scale, MORPH.LEFT);
      addTile(-2*scale, scale, scale, MORPH.LEFT.clone().add(MORPH.TOP));
    }

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x222222, 1);

    // renderer.sortObjects = false;
    // renderer.autoClear = false;

    controls = new THREE.OrbitControls(camera);
    document.body.appendChild(renderer.domElement);
  }

  function addTile(x, y, scale, morph) {
    var tileUniforms = {
      heightmap: {type: "t", value: heightTex},
      normalmap: {type: "t", value: normalTex},
      scale: {type: "f", value: scale},
      offset: {type: "v2", value: new THREE.Vector2(x, y)},
      midPos: {type: "v2", value: midPos},
      terrainDims: {type: "v2", value: new THREE.Vector2(TERRAIN_WIDTH, TERRAIN_HEIGHT)},
      tileRes: {type: "f", value: TILE_RES},
      morph: {type: "v2", value: morph}
    };

    var tileMaterial = new THREE.ShaderMaterial({
      uniforms: tileUniforms,
      vertexShader: simplexNoise + exampleVert,
      fragmentShader: exampleFrag
    });

    // tileMaterial.wireframe = true;
    // tileMaterial.wireframeLinewidth = 1.0;

    var tile = new THREE.Mesh(
      tileGeometry,
      tileMaterial
    );

    // Draw tile even if translated outside viewport
    tile.frustumCulled = false;
    scene.add(tile);
  }

  function animate() {
    var dt = new Date() - t;
    t = new Date();
    // planeUniforms.dt.value += dt;

    // var cameraDir = new THREE.Vector3(0, 0, -1);
    // cameraDir.applyQuaternion(camera.quaternion);
    // // L = camPos + camDir*t
    // // xy-plane intersection => t = camPos.z/camDir.z
    // var t = camera.position.z/cameraDir.z;
    // var xyIntersection = camera.position.clone().add(cameraDir.multiplyScalar(t));
    // midPos = new THREE.Vector2(xyIntersection.x, xyIntersection.y);
    // console.log(xyIntersection);

    var newMidPos = new THREE.Vector2(camera.position.x, camera.position.y);
    var midPosDiff = newMidPos.clone().sub(midPos);
    midPos = newMidPos;

    for (var c in scene.children) {
      var tile = scene.children[c];
      tile.material.uniforms.midPos.value = midPos;
    }

    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(animate);
  }
});
