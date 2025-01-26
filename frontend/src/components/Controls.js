import { playAudio } from './AudioHandler.js';

export function getYouTubeVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})|(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] || match[2] : null;
}

export function setupControls(audio, audioContext, analyser, frequencyData, camera) {
    const toggleAudio = async () => {
        console.log('Toggling audio');
        const button = document.getElementById('play-pause');
        console.log('Audio:', audio);

        if (!audio) {
            console.log('No audio to toggle');

            let confirmFetch = confirm('No audio is playing. Do you want to fetch audio?');
            if (!confirmFetch) return;

            console.log('Clicking fetch audio');

            document.getElementById('fetch-audio').click();
            return;
        }

        audio.paused ? audio.play() : audio.pause();
        button.textContent = audio && !audio.paused ? '⏸' : '▶';
    };

    let clientClickX, clientClickY;
    let dragging = false;

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

    document.getElementById('fetch-audio').addEventListener('click', async () => {
        const input = document.getElementById('youtube-link');
        const youtubeLink = input.value.trim();

        const videoId = getYouTubeVideoId(youtubeLink);
        if (!videoId) {
            alert('Invalid YouTube URL');
            return;
        }
        const result = await playAudio(videoId, audio, audioContext, analyser, frequencyData, camera);
        audio = result.audio;
        window.analyser = result.analyser;
        window.frequencyData = result.frequencyData;

        const button = document.getElementById('play-pause');
        button.textContent = audio && !audio.paused ? '⏸' : '▶';
    });

    document.getElementById('play-pause').addEventListener('click', toggleAudio);
}

