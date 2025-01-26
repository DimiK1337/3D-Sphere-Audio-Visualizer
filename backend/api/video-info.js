const express = require('express');
const { exec } = require('child_process');
const router = express.Router();

router.post('/', async (req, res) => {
    const { videoId } = req.body;
    if (!videoId) {
        return res.status(400).json({ error: 'No video ID provided' });
    }

    const command = `yt-dlp --print-json --skip-download https://www.youtube.com/watch?v=${videoId}`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error fetching video info: ${stderr}`);
            return res.status(500).json({ error: 'Failed to fetch video info' });
        }

        try {
            const videoInfo = JSON.parse(stdout); // Parse the JSON output from yt-dlp
            const videoDetails = {
                title: videoInfo.title,
                duration: videoInfo.duration,
                size: videoInfo.filesize_approx
                    ? (videoInfo.filesize_approx / 1024 / 1024).toFixed(2) + ' MB'
                    : 'Unknown',
                thumbnail: videoInfo.thumbnail, // URL to the video thumbnail
            };
            res.json(videoDetails);
        } catch (parseError) {
            console.error('Error parsing video info:', parseError);
            res.status(500).json({ error: 'Failed to parse video info' });
        }
    });
});

module.exports = router;
