import * as THREE from 'three';


export async function fetchVideoInfo(videoId) {
    const response = await fetch(`http://localhost:3000/video-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
    });

    console.log("Fetching Video Info");
    console.log("response", response);

    if (response.ok) {
        return await response.json();
    }
    console.error('Failed to fetch video info');
    return null;
}


export async function fetchAudio(videoId) {
    const loadingIcon = document.getElementById('loading-icon');
    loadingIcon.style.display = 'flex';

    console.log("Showing loading icon");

    try {
        const response = await fetch('http://localhost:3000/download-audio', {
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
    } catch (error) {
        console.error('Error fetching audio:', error);
        loadingIcon.style.display = 'none';
        return null;
    }
}

export async function playAudio(videoId, audio, audioContext, analyser, frequencyData, camera) {

    console.log("PlayAudio(videoID)")
    console.log('Fetching Audio URL');

    if (audio) {
        console.log('Stopping / Resetting existing audio');
        audio.pause();
        audio.currentTime = 0;
    }


    const audioUrl = await fetchAudio(videoId);
    if (!audioUrl) return null;

    audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    audio.play();

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!analyser) {
        analyser = audioContext.createAnalyser();
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
    }

    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const listener = new THREE.AudioListener();
    camera.add(listener);

    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(audioUrl, (buffer) => {
        sound.setBuffer(buffer);
    });

    const button = document.getElementById('play-pause');
    button.textContent = audio && !audio.paused ? '⏸' : '▶';
    console.log("Did pause icon change?", button.textContent);


    return { audio, analyser, frequencyData };
}

