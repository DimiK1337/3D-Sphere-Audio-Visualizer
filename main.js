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


/*
const sound = new THREE.Audio(listener);
const file_name = '/franchise_remix.mp3';
const audio_loader = new THREE.AudioLoader();
audio_loader.load(file_name + "ERROR", (buffer) => {
    sound.setBuffer(buffer);

    const toggleSound = () => {
        sound.isPlaying ? sound.pause() : sound.play();
    };

    let clientClickX;
    let clientClickY;
    let dragging = false;
    window.addEventListener('mousedown', (event) => {
        clientClickX = event.clientX;
        clientClickY = event.clientY;
    });

    window.addEventListener('mouseup', (event) => {
        dragging = !(clientClickX === event.clientX && clientClickY === event.clientY);
    });

    window.addEventListener('click', (event) => {
        if (event.target.tagName !== 'CANVAS') return;
        if (dragging) return;
        toggleSound();
    });

    
});
*/

// Analysis of the audio.
const fft_size = 32; // Number of bins to analyze the audio frequencies.
//const analyser = new THREE.AudioAnalyser(sound, fft_size);
let analyser;

// TEMP SECTION: Play Youtube videos.

// Explicitly set the onYouTubeIframeAPIReady function as a global property of window
let youtubePlayer;
const youTubeVideoID = "sIwfYvruKKM";

let audioContext, frequencyData;

window.onYouTubeIframeAPIReady = function () {
    console.log('YouTube API is ready');
    youtubePlayer = new YT.Player('youtube-video', {
        height: '0', // Hides the video display
        width: '0',
        videoId: youTubeVideoID, // Replace with your desired YouTube video ID
        events: {
            onReady: (event) => {
                console.log('YouTube Player is ready');
                event.target.playVideo();
                initializeAudio();
            },
            onError: (event) => {
                console.error('YouTube Player error:', event.data);
            },
        },
    });
};

YT.ready(function () {
    console.log("YT.ready triggered");
    youtubePlayer = new YT.Player("youtube-video", {
        height: "0",
        width: "0",
        videoId: "sIwfYvruKKM",
        events: {
            onReady: (event) => {
                console.log("YouTube Player is ready via YT.ready");
                event.target.playVideo();
                initializeAudio();
            },
        },
    });
});



function initializeAudio() {
    console.log('Initializing Audio');
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Extract audio from the YouTube iframe
    const mediaElement = youtubePlayer.getIframe();
    const mediaElementSource = audioContext.createMediaElementSource(mediaElement);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    frequencyData = new Uint8Array(analyser.frequencyBinCount);

    mediaElementSource.connect(analyser);
    analyser.connect(audioContext.destination);
    console.log('Audio initialized');
}



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
    if (analyser) {
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