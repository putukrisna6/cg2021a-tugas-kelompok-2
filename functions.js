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
 *
 * @param {number} x x axis position
 * @param {number} z z axis position
 * @param {number} width width of the box
 * @param {number} depth depth of the box
 * @param {'x' | 'y'} direction direction of the box
 */
function addLayer(x, z, width, depth, direction) {
  const y = stack.length * boxHeight;

  const layer = generateBox(x, y, z, width, depth);
  layer['direction'] = direction;
  stack.push(layer);
}

/**
 * @param {number} x x-axis position
 * @param {number} z z-axis position
 * @param {number} width width of the box
 * @param {number} depth depth of the box
 */
function addOverhang(x, z, width, depth) {
  const y = boxHeight * (stack.length - 1);
  const overhang = generateBox(x, y, z, width, depth);
  overhangs.push(overhang);
}

/**
 * Generate Box and add it to the scene
 * @param {number} x x axis position
 * @param {number} y y axis position
 * @param {number} z z axis position
 * @param {number} width width of the box
 * @param {number} depth depth of the box
 */
function generateBox(x, y, z, width, depth) {
  const geometry = new THREE.BoxGeometry(width, boxHeight, depth);

  const color = new THREE.Color(`hsl(${30 + stack.length * 4}, 100%, 50%)`);
  const material = new THREE.MeshLambertMaterial({ color });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);

  scene.add(mesh);

  return {
    threejs: mesh,
    width,
    depth,
  };
}
