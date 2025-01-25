import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js'
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { OutputPass } from 'three/examples/jsm/Addons.js';

import { GUI } from 'lil-gui';

const params = {

    red: 1.0,
    green: 1.0,
    blue: 1.0,

    // Bloom parameters.
    threshold: 0.5,
    strength: 0.4,
    radius: 0.8,
};

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Sets the color of the background.
// renderer.setClearColor(0xfefefe);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45, // FOV
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
);

// Sets orbit control to move the camera around.
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning.
camera.position.set(6, 8, 14);
// Has to be done everytime we update the camera position.
orbit.update();

// Uniforms are constants that are passed to the shaders for every vertex and fragment.
const uniforms = {
    u_time: { value: 0.0 },
    u_frequency: { value: 0.0 },


    u_red: { value: params.red },
    u_green: { value: params.green },
    u_blue: { value: params.blue },
};

// Create a sphere using IcosahedronGeometry instead of SphereGeometry.
const mat = new THREE.ShaderMaterial({
    wireframe: true,
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexShader').textContent,
    fragmentShader: document.getElementById('fragmentShader').textContent,
});
const geometry = new THREE.IcosahedronGeometry(4, 30); // Radius is 4, detail is what makes it smooth.
const mesh = new THREE.Mesh(geometry, mat); 
scene.add(mesh);

// Using Audio Frequencies to animate the sphere.

const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);

const file_name = '/franchise_remix.mp3';
const audio_loader = new THREE.AudioLoader();
audio_loader.load(file_name, (buffer) => {
    sound.setBuffer(buffer);
    window.addEventListener('click', (event) => {
        if (event.target.tagName !== 'CANVAS') return;
        console.log(event)
        sound.isPlaying ? sound.pause() : sound.play();
    });
});

// Analysis of the audio.
const fft_size = 32; // Number of bins to analyze the audio frequencies.
const analyser = new THREE.AudioAnalyser(sound, fft_size);

// Post processing.

renderer.outputColorSpace = THREE.SRGBColorSpace;

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
);
bloomPass.strength = params.strength;
bloomPass.threshold = params.threshold;
bloomPass.radius = params.radius;

const outputPass = new OutputPass();

const bloomComposer = new EffectComposer(renderer);
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);
bloomComposer.addPass(outputPass);


// GUI. Changing the colors of the sphere and scene

const gui = new GUI();

// Controls for the colors.
const colorsFolder = gui.addFolder('Colors');
colorsFolder.add(params, 'red', 0.0, 1.0).onChange((value) => {
    uniforms.u_red.value = Number(value);
});

colorsFolder.add(params, 'green', 0.0, 1.0).onChange((value) => {
    uniforms.u_green.value = Number(value);
});

colorsFolder.add(params, 'blue', 0.0, 1.0).onChange((value) => {
    uniforms.u_blue.value = Number(value);
});

// Controls for the Bloom parameters.
const bloomFolder = gui.addFolder('Bloom');
bloomFolder.add(params, 'threshold', 0.0, 1.0).onChange((value) => {
    bloomPass.threshold = Number(value);
});

bloomFolder.add(params, 'strength', 0.0, 2.0).onChange((value) => {
    bloomPass.strength = Number(value);
});

bloomFolder.add(params, 'radius', 0.0, 2.0).onChange((value) => {
    bloomPass.radius = Number(value);
});



// Animation loop.
const clock = new THREE.Clock();

function animate() { 
    uniforms.u_frequency.value = analyser.getAverageFrequency();

    uniforms.u_time.value = clock.getElapsedTime();
    //renderer.render(scene, camera);
    bloomComposer.render();
    requestAnimationFrame(animate);
}

// Render the scene.
//renderer.setAnimationLoop(animate);
animate();
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});