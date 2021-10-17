/**
 * @typedef {Object} Box
 * @property {THREE.Mesh} threejs
 * @property {number} width
 * @property {number} depth
 * @property {'x' | 'y'} direction
 */

/** @type {Array<Box>} */
let stack = [];
/** @type {Array<Box>} */
let overhangs = [];
/** @type {number} Height of each layer */
const boxHeight = 1;

/**
 * Add top layer
 * @param {number} x x axis position
 * @param {number} z z axis position
 * @param {number} width width of the box
 * @param {number} depth depth of the box
 * @param {'x' | 'y'} direction direction of the box
 */
function addLayer(x, z, width, depth, direction) {
  const y = stack.length * boxHeight;

  const layer = generateBox(x, y, z, width, depth, false);
  layer['direction'] = direction;
  stack.push(layer);
}

/**
 * Add overhang layer
 * @param {number} x x-axis position
 * @param {number} z z-axis position
 * @param {number} width width of the box
 * @param {number} depth depth of the box
 */
function addOverhang(x, z, width, depth) {
  const y = boxHeight * (stack.length - 1);
  const overhang = generateBox(x, y, z, width, depth, true);
  overhangs.push(overhang);
}

/**
 * Generate Box and add it to the scene
 * @param {number} x x axis position
 * @param {number} y y axis position
 * @param {number} z z axis position
 * @param {number} width width of the box
 * @param {number} depth depth of the box
 * @param {boolean} falls whether the box falls or not
 */
function generateBox(x, y, z, width, depth, falls) {
  // three.js
  const geometry = new THREE.BoxGeometry(width, boxHeight, depth);

  const color = new THREE.Color(`hsl(${30 + stack.length * 4}, 100%, 50%)`);
  const material = new THREE.MeshLambertMaterial({ color });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);

  scene.add(mesh);

  // start of cannon.js part
  const shape = new CANNON.Box(
    new CANNON.Vec3(width / 2, boxHeight / 2, depth / 2)
  );
  
  let mass = (falls) ? 5 : 0;
  
  const body = new CANNON.Body({ mass, shape});
  body.position.set(x, y, z);
  
  world.addBody(body);

  return {
    threejs: mesh,
    cannonjs: body,
    width,
    depth,
  };
}

/**
 * Cut layer into top layer and overhang based on overlap
 * @param {Box} topLayer top layer of the stack
 * @param {number} overlap the overlapping layer
 * @param {number} size the size of the overlapping layer
 * @param {number} delta difference between top later and previous layer
 */
function cutBox(topLayer, overlap, size, delta) {
  const direction = topLayer.direction;
  const newWidth = (direction === 'x') ? overlap : topLayer.width;
  const newDepth = (direction === 'z') ? overlap : topLayer.depth;

  topLayer.width = newWidth;
  topLayer.depth = newDepth;

  topLayer.threejs.scale[direction] = overlap / size;
  topLayer.threejs.position[direction] -= delta / 2;

  topLayer.cannonjs.position[direction] -= delta / 2;

  const shape = new CANNON.Box(
    new CANNON.Vec3(newWidth / 2, boxHeight / 2, newDepth / 2)
  );
  topLayer.cannonjs.shapes = [];
  topLayer.cannonjs.addShape(shape);
}
