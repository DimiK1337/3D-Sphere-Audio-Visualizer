import * as THREE from 'three';

export function animate(uniforms, bloomComposer) {
    const clock = new THREE.Clock();
    console.log("Analyser (outside loop func)", analyser);
    function loop() {

        if (window.analyser && window.frequencyData) {
            analyser.getByteFrequencyData(frequencyData);
            const averageFrequency = window.frequencyData.reduce((a, b) => a + b) / window.frequencyData.length;
            uniforms.u_frequency.value = averageFrequency;
        }

        uniforms.u_time.value = clock.getElapsedTime();
        bloomComposer.render(); // Use bloomComposer to render the scene
        requestAnimationFrame(loop);
    }

    loop();
}


