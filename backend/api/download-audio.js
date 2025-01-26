const express = require('express');
const { exec } = require('child_process');
const ytDlp = require('yt-dlp-exec'); // Import yt-dlp-exec
const path = require('path');

const router = express.Router();

router.post('/', async (req, res) => {
    const { videoId } = req.body;
    if (!videoId) {
        return res.status(400).json({ error: 'No video ID provided' });
    }

    const outputFileName = `audio_${videoId}.mp3`;
    const outputPath = path.resolve(__dirname, '..', 'downloads', outputFileName);

    try {
        const videoInfo = await ytDlp(`https://www.youtube.com/watch?v=${videoId}`, {
            extractAudio: true,
            audioFormat: 'mp3',
            output: outputPath,
            printJson: true, // Ensures we get JSON metadata in the response
        });

        const estimatedSizeMB = videoInfo.filesize 
            ? (videoInfo.filesize / 1024 / 1024).toFixed(2)
            : 'Unknown';

        console.log(`Audio downloaded: ${outputFileName}`);
        res.json({
            url: `/audio/${outputFileName}`,
            title: videoInfo.title,
            duration: videoInfo.duration,
            size: estimatedSizeMB,
        });
    }
    catch (error) {
        console.error(`Error downloading audio: ${error}`);
        return res.status(500).json({ error: 'Failed to download audio' });
    }

    /*

    const command = `yt-dlp -x --audio-format mp3 --print-json -o "${outputPath}" https://www.youtube.com/watch?v=${videoId}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error downloading audio: ${stderr}`);
            return res.status(500).json({ error: 'Failed to download audio' });
        }

        const videoInfo = JSON.parse(stdout);
        const estimatedSizeMB = (videoInfo.filesize / 1024 / 1024).toFixed(2);
        console.log(`Audio downloaded: ${stdout}`);
        res.json({ 
            url: `/audio/${outputFileName}`,
            title: videoInfo.title,
            duration: videoInfo.duration,
            size: estimatedSizeMB,
        });
    });
    */



});

module.exports = router;
