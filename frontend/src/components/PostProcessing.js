import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

import * as THREE from 'three';

/**
 * Initializes post-processing effects.
 * @param {THREE.Scene} scene - The scene to render.
 * @param {THREE.Camera} camera - The camera to render the scene.
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer.
 * @param {Object} params - Parameters for the bloom pass.
 * @returns {EffectComposer} The composer with post-processing passes applied.
 */
export function setupPostProcessing(scene, camera, renderer, params) {
    // Create RenderPass
    const renderScene = new RenderPass(scene, camera);

    // Create UnrealBloomPass
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        params.strength,
        params.radius,
        params.threshold
    );

    // Create OutputPass to render the final scene
    const outputPass = new OutputPass();

    // Create EffectComposer
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);

    return { composer, bloomPass };
}
