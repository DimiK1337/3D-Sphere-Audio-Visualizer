const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());

app.post('/download-audio', async (req, res) => {
    const { videoId } = req.body;
    if (!videoId) {
        return res.status(400).json({ error: 'No video ID provided' });
    }

    const outputFileName = `audio_${videoId}.mp3`;
    const outputPath = path.resolve(__dirname, '..', 'downloads', outputFileName);

    const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" https://www.youtube.com/watch?v=${videoId}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error downloading audio: ${stderr}`);
            return res.status(500).json({ error: 'Failed to download audio' });
        }

        console.log(`Audio downloaded: ${stdout}`);
        res.json({ url: `/audio/${outputFileName}` });
    });
});

module.exports = app;
