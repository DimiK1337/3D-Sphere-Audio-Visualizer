const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Endpoint to fetch audio from YouTube
app.post('/download-audio', async (req, res) => {
    const { videoId } = req.body; // Frontend sends the video ID
    if (!videoId) {
        return res.status(400).json({ error: 'No video ID provided' });
    }

    const outputFileName = `audio_${videoId}.mp3`;
    const outputPath = path.resolve(__dirname, 'downloads', outputFileName);

    // yt-dlp command to download audio
    // Audio quality 0 is the highest quality, 1 is the 2nd highest, and so on until 9
    const command = `yt-dlp -x --audio-format mp3 --audio-quality 0 --audio-bitrate 320k -o ${outputPath} https://www.youtube.com/watch?v=${videoId}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error downloading audio: ${stderr}`);
            return res.status(500).json({ error: 'Failed to download audio' });
        }

        console.log(`Audio downloaded: ${stdout}`);
        res.json({ url: `/audio/${outputFileName}` });
    });
});

// Serve the audio files
app.use('/audio', express.static(path.resolve(__dirname, 'downloads')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
