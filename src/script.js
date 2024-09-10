import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";

// initialize pane
const pane = new Pane();

// initialize the scene
const scene = new THREE.Scene();

// intialize the textures
const textureLoader = new THREE.TextureLoader();
// adding textures
const sunTexture = textureLoader.load("/textures/2k_sun.jpg");
const mercuryTexture = textureLoader.load("/textures/2k_mercury.jpg");
const venusTexture = textureLoader.load("/textures/2k_venus_surface.jpg");
const earthTexture = textureLoader.load("/textures/2k_earth_daymap.jpg");
const marsTexture = textureLoader.load("/textures/2k_mars.jpg");
const moonTexture = textureLoader.load("/textures/2k_moon.jpg");

//  adding background to the scene
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath("/textures/cubeMap/");

// geometry
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

//? sun
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sphereGeometry, sunMaterial);
sun.scale.setScalar(5);
scene.add(sun);

//  adding materials
const mercuryMaterial = new THREE.MeshBasicMaterial({
    map: mercuryTexture,
});
const venusMaterial = new THREE.MeshBasicMaterial({
    map: venusTexture,
});
const earthMaterial = new THREE.MeshBasicMaterial({
    map: earthTexture,
});
const marsMaterial = new THREE.MeshBasicMaterial({
    map: marsTexture,
});
const moonMaterial = new THREE.MeshBasicMaterial({
    map: moonTexture,
});

const backgroundCubemap = cubeTextureLoader.load([
    "px.png",
    "nx.png",
    "py.png",
    "ny.png",
    "pz.png",
    "nz.png",
]);
scene.background = backgroundCubemap;

// planets array to avoid repetition
const planets = [
    {
        name: "Mercury",
        radius: 0.5,
        distance: 10,
        speed: 0.01,
        material: mercuryMaterial,
        moons: [],
    },
    {
        name: "Venus",
        radius: 0.8,
        distance: 15,
        speed: 0.007,
        material: venusMaterial,
        moons: [],
    },
    {
        name: "Earth",
        radius: 1,
        distance: 20,
        speed: 0.005,
        material: earthMaterial,
        moons: [
            {
                name: "Moon",
                radius: 0.3,
                distance: 3,
                speed: 0.015,
            },
        ],
    },
    {
        name: "Mars",
        radius: 0.7,
        distance: 25,
        speed: 0.003,
        material: marsMaterial,
        moons: [
            {
                name: "Phobos",
                radius: 0.1,
                distance: 2,
                speed: 0.02,
            },
            {
                name: "Deimos",
                radius: 0.2,
                distance: 3,
                speed: 0.015,
                color: 0xffffff,
            },
        ],
    },
];

// ? create planet function
const createPlanet = (planet) => {
    const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);
    planetMesh.scale.setScalar(planet.radius);
    planetMesh.position.x = planet.distance;
    return planetMesh;
};

// ? create moon function
const createMoon = (moon) => {
    const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
    moonMesh.scale.setScalar(moon.radius);
    moonMesh.position.x = moon.distance;
    return moonMesh;
};

// ? create planets and moons and add them to the scene
const planetMeshes = planets.map((planet) => {
    const planetMesh = createPlanet(planet);
    scene.add(planetMesh);

    planet.moons.forEach((moon) => {
        const moonMesh = createMoon(moon);
        planetMesh.add(moonMesh);
    });
    return planetMesh;
});

// add light
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
const pointLight = new THREE.PointLight(0xffffff, 5);
scene.add(pointLight);

// initialize the camera
const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 25, 70);

// initialize the renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// add controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 20;

// add resize listener
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// initialize the clock
const clock = new THREE.Clock();

// note:  render loop
/**
 * The renderloop function updates the positions and rotations of planets and moons in the solar system.
 * It uses the elapsed time to calculate the new positions and rotations based on the speed and distance of each planet and moon.
 * The function also updates the controls and renders the scene using the provided renderer, scene, and camera.
 * It recursively calls itself using window.requestAnimationFrame to create a continuous animation loop.
 */
const renderloop = () => {
    const elapsedTime = clock.getElapsedTime();

    //!  rotation planets and moons
    planetMeshes.forEach((planet, planetIndex) => {
        planet.rotation.y += planets[planetIndex].speed;
        planet.position.x =
            Math.sin(planet.rotation.y) * planets[planetIndex].distance;
        planet.position.z =
            Math.cos(planet.rotation.y) * planets[planetIndex].distance;

        planet.children.forEach((moon, moonIndex) => {
            moon.rotation.y += planets[planetIndex].moons[moonIndex].speed;
            moon.position.x =
                Math.sin(moon.rotation.y) *
                planets[planetIndex].moons[moonIndex].distance;
            moon.position.z =
                Math.cos(moon.rotation.y) *
                planets[planetIndex].moons[moonIndex].distance;
        });
    });

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(renderloop);
};

renderloop();
