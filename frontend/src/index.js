import { createScene } from './components/Scene.js';
import { setupPostProcessing } from './components/PostProcessing.js';
import { setupControls } from './components/Controls.js';
import { setupGUI } from './components/GUI.js';
import { animate } from './components/AnimationLoop.js';

const params = { 
    red: 1.0, 
    green: 1.0, 
    blue: 1.0, 
    threshold: 0.5, 
    strength: 0.4,
    radius: 0.8     
};

const uniforms = { 
    u_time: { value: 0.0 }, 
    u_frequency: { value: 0.0 }, 
    u_red: { value: params.red }, 
    u_green: { value: params.green }, 
    u_blue: { value: params.blue } 
};

// Create scene, camera, and renderer
const { scene, camera, renderer } = createScene(params, uniforms);

// Setup post-processing
const { composer: bloomComposer, bloomPass } = setupPostProcessing(
    scene, camera, renderer, params
);

let audio = null;
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

window.analyser = null;
window.audio = audio;
window.frequencyData = null;

setupGUI(params, uniforms, bloomPass);

console.info("camera not null ?", camera)
setupControls(audio, audioContext, window.analyser, window.frequencyData, camera);
animate(uniforms, bloomComposer);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
