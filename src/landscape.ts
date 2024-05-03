import * as THREE from "three";
import { Water } from "three/addons/objects/Water.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Sky } from "three/addons/objects/Sky.js";

export function resetCameraPosition(controls: OrbitControls, flightWindowRadius: number) {
    controls.target.set(0, flightWindowRadius / 2, 0)
    controls.object.position.set(-flightWindowRadius, flightWindowRadius / 2, 0)
}


export function createWater(scene: THREE.Scene) {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    const water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load(
            "/assets/waternormals.jpg",
            function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }
        ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined,
    });

    water.rotation.x = -Math.PI / 2;

    return water;
}

export function createCamera(app: HTMLElement, cameraFov: number) {
    const w = app.clientWidth
    const h = app.clientHeight
    const camera = new THREE.PerspectiveCamera(cameraFov, w / h, 0.1, 1000)
    camera.position.set(30, 30, 100);
    return camera;
}

export function createRenderer(app: HTMLElement) {
    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(
        app.getBoundingClientRect().width,
        app.getBoundingClientRect().height
    );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    return renderer;
}

export function createControls(camera: THREE.Camera, renderer: THREE.Renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();
    return controls;
}

export function createSky(
    water: Water,
    scene: THREE.Scene,
    renderer: THREE.WebGLRenderer
) {
    const sky = new Sky();
    sky.scale.setScalar(1000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms["turbidity"].value = 10;
    skyUniforms["rayleigh"].value = 2;
    skyUniforms["mieCoefficient"].value = 0.005;
    skyUniforms["mieDirectionalG"].value = 0.8;

    const parameters = {
        elevation: 5,
        azimuth: -90,
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const sceneEnv = new THREE.Scene();

    let renderTarget: any;
    // Sun
    const sun = new THREE.Vector3();
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms["sunPosition"].value.copy(sun);
    water.material.uniforms["sunDirection"].value.copy(sun).normalize();

    if (renderTarget !== undefined) renderTarget.dispose();

    sceneEnv.add(sky);
    renderTarget = pmremGenerator.fromScene(sceneEnv);
    scene.add(sky);

    scene.environment = renderTarget.texture;
    return sky;
}