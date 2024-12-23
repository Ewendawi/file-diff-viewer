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
    } else if (req.url === '/default-content') {
        serveFile('test/test-files.json', 'application/json', res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
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
