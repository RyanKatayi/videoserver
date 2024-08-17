const express = require("express");
const multer = require("multer");
const { ContainerClient  } = require("@azure/storage-blob");

const app = express();

const sas_url = 'https://hstvstuff.blob.core.windows.net/?sv=2022-11-02&ss=b&srt=sco&sp=rwdlaciytfx&se=2025-05-01T16:47:59Z&st=2024-07-31T08:47:59Z&spr=https,http&sig=WxcMMIafo8noK7hG5tt2IEDYayrOUDVf%2FfBT0QQCTBU%3D';

const storage = multer.memoryStorage();
const upload = multer({ storage });

// To parse json request body

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const container = req.body.container === '2' ? 'videos' : 'thumbnails';
        const blobName = file.originalname;

        const containerUrl = `https://hstvstuff.blob.core.windows.net/${container}?${sas_url.split('?')[1]}`;
        const containerClient = new ContainerClient(containerUrl);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(req.file.buffer, { blobHTTPHeaders: { blobContentType: req.file.mimetype }, onProgress: (ev) => console.log(ev) })

        res.status(200).json({ message: 'File uploaded successfully', url: blockBlobClient.url });
    } catch (error) {
        console.error('Error uploading file to Azure:', error);
        res.status(500).json({ error: 'Error uploading file to Azure', details: error.message });
    }
});

// Testing
app.get('/test', (req, res) => {
    res.send("Demo Chunk Application Running Successfully...");
});

module.exports = app;
