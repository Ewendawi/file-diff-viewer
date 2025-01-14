const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // Handle static files
    if (req.url === '/' || req.url === '/index.html') {
        serveFile('public/index.html', 'text/html', res);
    } else if (req.url === '/style.css') {
        serveFile('public/style.css', 'text/css', res);
    } else if (req.url === '/main.js') {
        serveFile('public/main.js', 'application/javascript', res);
    } else if (req.url === '/default-content.json') {
        serveFile('public/default-content.json', 'application/json', res);
    } else if (req.url === '/api/default-content-list') {
        fs.readdir(path.join(__dirname, '..', 'public/default-content'), (err, files) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Failed to read directory' }));
                return;
            }
            // Filter only .json files
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ files: jsonFiles }));
        });
    } else if (req.url.startsWith('/default-content/')) {
        const fileName = req.url.split('/').pop();
        serveFile(`public/default-content/${fileName}`, 'application/json', res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found' + req.url);
    }
});

function serveFile(filename, contentType, res) {
    fs.readFile(path.join(__dirname, '..', filename), (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end(`Error loading ${filename}`);
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

server.listen(3300, () => {
    console.log('Server running on port 3300');
});
