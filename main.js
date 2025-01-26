import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/Addons.js'
import { RenderPass } from 'three/examples/jsm/Addons.js';
import { UnrealBloomPass } from 'three/examples/jsm/Addons.js';
import { OutputPass } from 'three/examples/jsm/Addons.js';

import { GUI } from 'lil-gui';

import { vertexShader } from './scripts/shaders/vertexShader';
import { fragmentShader } from './scripts/shaders/fragmentShader';

const scene = new THREE.Scene();

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

const visualizer_canvas = document.getElementById('visualizer');
visualizer_canvas.appendChild(renderer.domElement);

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
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

const geometry = new THREE.IcosahedronGeometry(4, 30); // Radius is 4, detail is what makes it smooth.
const mesh = new THREE.Mesh(geometry, mat); 
scene.add(mesh);

// Using Audio Frequencies to animate the sphere.

const listener = new THREE.AudioListener();
camera.add(listener);

// Analysis of the audio.
const fft_size = 32; // Number of bins to analyze the audio frequencies.
//const analyser = new THREE.AudioAnalyser(sound, fft_size);
let analyser;
let audio, audioContext, sound, audioLoader, frequencyData;

let dragging = false;
let clientClickX, clientClickY;

// Handle YouTube input and fetch audio
async function fetchAudio(videoId) {
    const loadingIcon = document.getElementById('loading-icon');
    loadingIcon.style.display = 'block';

    console.log("Showing loading icon")

    const response = await fetch('/download-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
    });

    loadingIcon.style.display = 'none';

    if (response.ok) {
        const { url } = await response.json();
        return url;
    } else {
        console.error('Failed to fetch audio');
        return null;
    }
}

async function playAudio(videoId) {

    console.log("PlayAudio(videoID)")
    console.log('Fetching Audio URL');

    if (audio) {
        console.log('Stopping existing audio');
        audio.pause();
        audio.currentTime = 0;
    }

    const audioUrl = await fetchAudio(videoId);
    if (!audioUrl) return;

    audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    audio.play();

    console.log("playing audio")

    // Set up Web Audio API
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        
        // Initialize the frequencyData array to match the analyser's frequencyBinCount
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
    }
    
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Set up THREE.Audio for the scene
    const listener = new THREE.AudioListener();
    camera.add(listener);

    sound = new THREE.Audio(listener);
    audioLoader = new THREE.AudioLoader();
    audioLoader.load(audioUrl, (buffer) => {
        sound.setBuffer(buffer);
    });
}

// Extract YouTube video ID from URL
function getYouTubeVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})|(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] || match[2] : null;
}

const toggleAudio = () => {
    console.log('Toggling audio');
    const button = document.getElementById('play-pause');
    if (!audio) {
        console.log('No audio to toggle');

        let confirmFetch = confirm('No audio is playing. Do you want to fetch audio?');
        if (!confirmFetch) return;

        console.log('Clicking fetch audio');

        document.getElementById('fetch-audio').click();
        return;
    }
    //audio.isPlaying ? audio.pause() : audio.play();
    audio.paused ? audio.play() : audio.pause();
    button.textContent = audio && !audio.paused ? '⏸' : '▶';
};

document.getElementById('fetch-audio').addEventListener('click', async () => {
    const input = document.getElementById('youtube-link');
    const youtubeLink = input.value.trim();

    const videoId = getYouTubeVideoId(youtubeLink);
    if (!videoId) {
        alert('Invalid YouTube URL');
        return;
    }

    await playAudio(videoId);
    const button = document.getElementById('play-pause');
    button.textContent = audio && !audio.paused ? '⏸' : '▶';
});

document.getElementById('play-pause').addEventListener('click', toggleAudio);

// Detect dragging for OrbitControls
window.addEventListener('mousedown', (event) => {
    clientClickX = event.clientX;
    clientClickY = event.clientY;
});

window.addEventListener('mouseup', (event) => {
    dragging = !(clientClickX === event.clientX && clientClickY === event.clientY);
});

window.addEventListener('click', (event) => {
    if (event.target.tagName !== 'CANVAS') return; // Ignore non-canvas clicks
    if (dragging) return; // Ignore drag events
    toggleAudio();
});



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
    //uniforms.u_frequency.value = analyser.getAverageFrequency();
    if (analyser && frequencyData) {
        analyser.getByteFrequencyData(frequencyData);
        const averageFrequency = frequencyData.reduce((a, b) => a + b) / frequencyData.length;
        uniforms.u_frequency.value = averageFrequency;
    }

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