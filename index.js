/** @type {THREE.OrthographicCamera} */
let camera;
/** @type {THREE.Scene} */
let scene;
/** @type {THREE.WebGLRenderer} */
let renderer;

(function init() {
  scene = new THREE.Scene();

  // Add a cube to the scene
  const geometry = new THREE.BoxGeometry(3, 1, 3);
  const material = new THREE.MeshLambertMaterial({ color: 0xfb8e00 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, 0);
  scene.add(mesh);

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
