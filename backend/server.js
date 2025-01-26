const express = require('express');
const cors = require('cors');
const path = require('path');

const downloadAudioRouter = require('./api/download-audio');
const videoInfoRouter = require('./api/video-info');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Use routers to separate the API routes
app.use('/download-audio', downloadAudioRouter);
app.use('/video-info', videoInfoRouter);

// Serve the audio files
app.use('/audio', express.static(path.resolve(__dirname, 'downloads')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
