"use strict";

require([
  "libs/text!shaders/example.vert",
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

  heightTex = THREE.ImageUtils.loadTexture('textures/heightmap-blur.png', {}, function() {
    normalTex = THREE.ImageUtils.loadTexture('textures/normalmap-blur.png', {}, function() {
      init();
      animate();
    });
  });

  function init() {
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 999999);
    camera.position.set(0, 0, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    scene = new THREE.Scene();

    tileGeometry = new THREE.PlaneGeometry(1, 1, TILE_RES, TILE_RES);
    var moveAnchor = new THREE.Matrix4();
    moveAnchor.makeTranslation(0.5, 0.5, 0);
    tileGeometry.applyMatrix(moveAnchor);

    var lMaxScale = TERRAIN_WIDTH/Math.pow(2, LOD_LEVELS);

    /**
     * Add middle tiles
     */
    addTile(0, 0, lMaxScale);
    addTile(0, -lMaxScale, lMaxScale);
    addTile(-lMaxScale, -lMaxScale, lMaxScale);
    addTile(-lMaxScale, 0, lMaxScale);

    /**
     * Add clipmap "shells"
     */
    for (var scale = lMaxScale; scale < TERRAIN_WIDTH; scale *= 2) {
      // top
      addTile(0, scale, scale);
      addTile(scale, scale, scale);
      addTile(-scale, scale, scale);

      // right
      addTile(scale, 0, scale);
      addTile(scale, -scale, scale);
      addTile(scale, -2*scale, scale);

      // bottom
      addTile(0, -2*scale, scale);
      addTile(-scale, -2*scale, scale);
      addTile(-2*scale, -2*scale, scale);

      // left
      addTile(-2*scale, scale, scale);
      addTile(-2*scale, 0, scale);
      addTile(-2*scale, -scale, scale);
    }

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x222222, 1);

    // renderer.sortObjects = false;
    // renderer.autoClear = false;

    controls = new THREE.OrbitControls(camera);
    document.body.appendChild(renderer.domElement);
  }

  function addTile(x, y, scale) {
    var tileUniforms = {
      heightmap: {type: "t", value: heightTex},
      normalmap: {type: "t", value: normalTex},
      scale: {type: "f", value: scale},
      offset: {type: "v2", value: new THREE.Vector2(x, y)},
      midPos: {type: "v2", value: midPos},
      terrainDims: {type: "v2", value: new THREE.Vector2(TERRAIN_WIDTH, TERRAIN_HEIGHT)},
      tileRes: {type: "f", value: TILE_RES}
    };

    var tileMaterial = new THREE.ShaderMaterial({
      uniforms: tileUniforms,
      vertexShader: exampleVert,
      fragmentShader: exampleFrag
    });

    tileMaterial.wireframe = true;
    tileMaterial.wireframeLinewidth = 1.0;

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
