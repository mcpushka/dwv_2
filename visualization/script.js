let scene, camera, renderer, globe;
let controls;
let isUserRotating = false;
let isUserZooming = false;
let activityChart = null;
let allPackages = [];
let currentFilter = 'all';

const points = [];
let locationsMap = {};

init();
animate();
setInterval(fetchData, 2000);

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const globeContainer = document.getElementById('globe-container');
  const width = globeContainer.clientWidth;
  const height = globeContainer.clientHeight;
  
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "high-performance",
    logarithmicDepthBuffer: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  globeContainer.appendChild(renderer.domElement);

  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const textureLoader = new THREE.TextureLoader();
  
  textureLoader.load('earth_texture.jpg', (texture) => {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 10,
      transparent: true,
      opacity: 0.95
    });

    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    const pointsGeometry = new THREE.BufferGeometry();
    const pointsMaterial = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      transparent: true,
      depthWrite: false
    });

    pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
    globe.add(pointsMesh);
  });

  const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 3, 5);
  scene.add(ambientLight, directionalLight);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.3;
  controls.minDistance = 2.0;
  controls.maxDistance = 8.0;
  controls.enablePan = false;

  const onWindowResize = () => {
    camera.aspect = globeContainer.clientWidth / globeContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
  };

  window.addEventListener('resize', onWindowResize, { passive: true });
}

function animate() {
  requestAnimationFrame(animate);

  if (globe) {
    if (!isUserRotating) {
      globe.rotation.y += 0.001;
    }

    if (isUserZooming) {
      controls.autoRotate = true;
    } else {
      controls.autoRotate = !isUserRotating;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}


function fetchData() {
  fetch('http://localhost:5000/data')
    .then(res => res.json())
    .then(data => {
      allPackages = data;
      applyFilter(currentFilter);
    })
    .catch(console.error);
}

function applyFilter(filter) {
  points.forEach(point => globe.remove(point));
  points.length = 0;
  locationsMap = {};

  const filteredData = allPackages.filter(pkg => {
    if (filter === 'suspicious') return pkg.suspicious === 1;
    if (filter === 'reliable') return pkg.suspicious === 0;
    return true;
  });

  filteredData.forEach(pkg => {
    const point = createPoint(pkg.latitude, pkg.longitude, pkg.suspicious);
    globe.add(point);
    points.push(point);
  });

  updateSidebar();
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    applyFilter(currentFilter);
  });
});

function createPoint(lat, lon, suspicious) {
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);
  
  const radius = 1.0;

  const x = radius * Math.cos(latRad) * Math.cos(lonRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.sin(-lonRad);

  const color = suspicious === 1 ? 0xff0000 : 0x00ff00;
  const size = suspicious === 1 ? 0.015 : 0.009;
  const geom = new THREE.SphereGeometry(size, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ 
    color: color,
    depthTest: true,
    depthWrite: true
  });
  
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.set(x, y, z);
  return mesh;
}

function updateSidebar() { 
  const list = document.getElementById('location-list');
  list.innerHTML = '';

  const grouped = allPackages.reduce((acc, pkg) => {
    const key = `${pkg.latitude.toFixed(1)},${pkg.longitude.toFixed(1)}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([loc, count]) => {
      const item = document.createElement('li');
      item.textContent = `${loc} — ${count} hits`;
      list.appendChild(item);
    });
}
