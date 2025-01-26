import { GUI } from 'lil-gui';

export function setupGUI(params, uniforms, bloomPass) {
    const gui = new GUI();

    const colorsFolder = gui.addFolder('Colors');
    colorsFolder.add(params, 'red', 0.0, 1.0).onChange((value) => (uniforms.u_red.value = value));
    colorsFolder.add(params, 'green', 0.0, 1.0).onChange((value) => (uniforms.u_green.value = value));
    colorsFolder.add(params, 'blue', 0.0, 1.0).onChange((value) => (uniforms.u_blue.value = value));

    const bloomFolder = gui.addFolder('Bloom');
    bloomFolder.add(params, 'threshold', 0.0, 1.0).onChange((value) => (bloomPass.threshold = value));
    bloomFolder.add(params, 'strength', 0.0, 2.0).onChange((value) => (bloomPass.strength = value));
    bloomFolder.add(params, 'radius', 0.0, 2.0).onChange((value) => (bloomPass.radius = value));
}
