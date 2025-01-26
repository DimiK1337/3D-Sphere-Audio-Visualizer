const express = require('express');
const ytDlp = require('yt-dlp-exec'); // Import yt-dlp-exec

const router = express.Router();

router.post('/', async (req, res) => {
    const { videoId } = req.body;
    if (!videoId) {
        return res.status(400).json({ error: 'No video ID provided' });
    }

    try {
        // Fetch video metadata using yt-dlp
        const videoInfo = await ytDlp(`https://www.youtube.com/watch?v=${videoId}`, {
            skipDownload: true, // Ensures no files are downloaded
            printJson: true,    // Outputs JSON metadata
        });

        // Prepare video details for the response
        const videoDetails = {
            title: videoInfo.title,
            duration: videoInfo.duration,
            size: videoInfo.filesize_approx
                ? (videoInfo.filesize_approx / 1024 / 1024).toFixed(2) + ' MB'
                : 'Unknown',
            thumbnail: videoInfo.thumbnail, // URL to the video thumbnail
        };

        console.log(`Video info fetched: ${videoDetails.title}`);
        res.json(videoDetails);
    } catch (error) {
        console.error(`Error fetching video info: ${error.message}`);
        res.status(500).json({ error: 'Failed to fetch video info' });
    }
});

module.exports = router;
