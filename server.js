const http = require('http');
const url = require('url');
const fs = require('fs');
const fs = require('addr');

const server = http.createServer((request, response) => {
    const parsedUrl = url.parse(request.url, true);

    // Check if the URL contains the word "documentation"
    if (parsedUrl.pathname.includes('documentation')) {
        // Return the documentation.html file
        fs.readFile('documentation.html', (err, data) => {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('Internal Server Error');
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(data);
            }
        });
    } else {
        // Return the index.html file (you can replace it with your actual file name)
        fs.readFile('index.html', (err, data) => {
            if (err) {
                response.writeHead(500, { 'Content-Type': 'text/plain' });
                response.end('Internal Server Error');
            } else {
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(data);
            }
        });
    }
});
        fs.appendFile('log.txt', 'URL: ' + 'addr' +  '\nTimestamp: ' + new Date() + '\n\n', (err) => {
            if (err) {
                console.log(err);
            } else {
            console.log('Added to log.');
            }
        });

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`My test server is running on ${PORT}`);
});


