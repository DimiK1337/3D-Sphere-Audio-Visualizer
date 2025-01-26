import { playAudio } from './AudioHandler.js';


export const toggleAudio = (audio) => {
    console.log('Toggling audio');
    console.log("Audio: ", audio);


    
    if (audio === undefined || !audio) {
        console.log('No audio to toggle');

        let confirmFetch = confirm('No audio is playing. Do you want to fetch audio?');
        if (!confirmFetch) return;

        console.log('Clicking fetch audio');

        document.getElementById('fetch-audio').click();
        return;
    }
    //audio.isPlaying ? audio.pause() : audio.play();
    //const button = document.getElementById('play-pause');
    audio.paused ? audio.play() : audio.pause();
    //button.textContent = audio && !audio.paused ? '⏸' : '▶';
};

export function getYouTubeVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})|(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] || match[2] : null;
}

export function setupControls(audio, analyser, frequencyData, camera, audioContext) {
    document.getElementById('play-pause').addEventListener('click', () => {
        console.log("Play/Pause button clicked");
        toggleAudio(audio);
    });

    document.getElementById('fetch-audio').addEventListener('click', async () => {
        console.log("Fetch audio button clicked");
        const input = document.getElementById('youtube-link');
        const videoId = getYouTubeVideoId(input.value.trim());
        if (!videoId) {
            alert('Invalid YouTube URL');
            return;
        }

        const { 
            audio: newAudio, 
            analyser: newAnalyser, 
            frequencyData: newFrequencyData 
        } = await playAudio(
            videoId, audio, audioContext, analyser, frequencyData, camera
        );
        audio = newAudio;
        window.analyser = newAnalyser;
        window.frequencyData = newFrequencyData;
        console.log("Audio and analyser (awaited from playAudio()): ", audio, analyser);
    
    });
}

