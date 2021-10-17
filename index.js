/** @type {THREE.OrthographicCamera} */
let camera;
/** @type {THREE.Scene} */
let scene;
/** @type {THREE.WebGLRenderer} */
let renderer;
/** @type {CANNON.World} */
let world;

/** @type {number} */
const originalBoxSize = 3;

(function init() {
  // set up cannon.js
  world = new CANNON.World();
  world.gravity.set(0, -10, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 40;

  // set up three.js
  scene = new THREE.Scene();

  // Foundation
  addLayer(0, 0, originalBoxSize, originalBoxSize);

  addLayer(-10, 0, originalBoxSize, originalBoxSize, 'x');

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 20, 0);
  scene.add(directionalLight);

  // Camera
  const width = 10;
  const height = width * (window.innerHeight / window.innerWidth);
  camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    100
  );
  camera.position.set(4, 4, 4);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  document.body.appendChild(renderer.domElement);
})();

let gameStarted = false;
window.addEventListener('click', () => {
  if (!gameStarted) {
    console.log('start');
    renderer.setAnimationLoop(animation);
    gameStarted = true;
  } else {
    // Add new box on top
    const topLayer = stack[stack.length - 1];
    // track previous layer
    const previousLayer = stack[stack.length - 2];

    const direction = topLayer.direction;

    // Calculate the overlapping part between top and previous layer
    const delta = 
      topLayer.threejs.position[direction] -
      previousLayer.threejs.position[direction];

    const overhangSize = Math.abs(delta);
    const size = (direction == 'x') ? topLayer.width : topLayer.depth;
    const overlap = size - overhangSize;

    if (overlap > 0) {
      cutBox(topLayer, overlap, size, delta);

      // overhang
      const overhangShift = (overlap / 2 + overhangSize / 2) * Math.sign(delta);
      const overhangX = 
        (direction === 'x')
          ? topLayer.threejs.position.x + overhangShift
          : topLayer.threejs.position.x;
      const overhangZ = 
        (direction === 'z')
          ? topLayer.threejs.position.z + overhangShift
          : topLayer.threejs.position.z;
      
      const overhangWidth = (direction === 'x') ? overhangSize : topLayer.width;
      const overhangDepth = (direction === 'z') ? overhangSize : topLayer.depth;

      addOverhang(overhangX, overhangZ, overhangWidth, overhangDepth);

      // Next Layer
      const nextX = (direction === 'x') ? topLayer.threejs.position.x : -10;
      const nextZ = (direction === 'z') ? topLayer.threejs.position.z : -10;
      const newWidth = topLayer.width;
      const newDepth = topLayer.depth;
      const nextDirection = (direction === 'x') ? 'z' : 'x';

      addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
    }
  }
});

function animation() {
  const speed = 0.15;

  const topLayer = stack[stack.length - 1];
  topLayer.threejs.position[topLayer.direction] += speed;
  topLayer.cannonjs.position[topLayer.direction] += speed;

  //  initial camera height = 4
  if (camera.position.y < boxHeight * (stack.length - 2) + 4) {
    camera.position.y += speed;
  }

  updatePhysics();
  renderer.render(scene, camera);
}

function updatePhysics() {
  world.step(1 / 60);

  overhangs.forEach((element) => {
    element.threejs.position.copy(element.cannonjs.position);
    element.threejs.quaternion.copy(element.cannonjs.quaternion);
  });
}
