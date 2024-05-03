import * as THREE from 'three';
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { createRenderer, createCamera, createSky, createControls, createWater } from './landscape';

let state = {
  orientation: 0,
  position: 0,
  speed: 0,
}


document.addEventListener('keydown', (event) => {
  if (event.key === "ArrowUp") {
    if (state.speed > 1) return
    state.speed += 0.1
  }
  if (event.key === "ArrowDown") {
    if (state.speed < -1) return
    state.speed += -0.1
  }
  if (event.key === "ArrowRight") {
    state.orientation += -0.1
  }
  if (event.key === "ArrowLeft") {
    state.orientation += 0.1
  }
})


async function main() {
  const app = document.getElementById("app")
  if (!app) return

  const scene = new THREE.Scene()
  const renderer = createRenderer(app)
  const camera = createCamera(app, 75)
  const water = createWater(scene)
  createSky(water, scene, renderer)
  app.appendChild(renderer.domElement)
  createControls(camera, renderer)


  var planeGeometry = new THREE.PlaneGeometry(1000, 1000, 32, 32); // Width, Height, WidthSegments, HeightSegments
  var planeMaterial = new THREE.MeshBasicMaterial({ color: "white", side: THREE.DoubleSide });
  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = Math.PI / 2;
  scene.add(plane);

  // Plot axis to help thinking about rotations
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const toyota = await load_model("/toyota/scene.gltf") as any
  toyota.scale.set(1000, 1000, 1000)
  toyota.position.set(0, 0, 0)
  scene.add(toyota)

  animate();

  function animate() {
    requestAnimationFrame(animate);
    const speed = state.speed
    const orientation = state.orientation
    const position = state.position
    toyota.position.x += Math.sin(orientation) * speed
    toyota.position.z += Math.cos(orientation) * speed
    toyota.rotation.y = orientation

    renderer.render(scene, camera);
  }
}

main()


function load_model(path: string) {
  return new Promise((resolve, _) => {
    const voile_loader = new GLTFLoader()
    voile_loader.load(path, function (gltf) {
      resolve(gltf.scene)
    })
  })
}



