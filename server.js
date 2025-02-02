const http = require('http');
const url = require('url');
const fs = require('fs');
const { strings } = require('./lang/en/en.js');
const util = require('./modules/utils.js');

class FileHandler {
    writeFile(res, query) {
        const text = query["text"];
        fs.appendFile('file.txt', text + '\n', (err) => {
            if (err) {
                this.sendResponse(res, 500, 'text/html', `<h1 style="color:red;">${strings.writeError}</h1>`);
            } else {
                this.sendResponse(res, 200, 'text/html', `<h1 style="color:green;">${strings.writeSuccess}</h1>`);
            }
        });
    }

    readFile(res, query) {
        const filename = Object.keys(query)[0];
        console.log(`Reading file: ${filename}`);
        fs.readFile(filename, (err, data) => {
            if (err) {
                this.sendResponse(res, 404, 'text/html', `<h1 style="color:red;">${util.formatString(strings.readError, filename)}</h1>`);
            } else {
                this.sendResponse(res, 200, 'text/html', data);
            }
        });
    }

    sendResponse(res, statusCode, contentType, content) {
        res.writeHead(statusCode, { 'Content-Type': contentType });
        res.end(content);
    }
}

class Server {
    constructor(port) {
        this.port = port;
        this.fileHandler = new FileHandler();
    }

    handleRequest(req, res) {
        const q = url.parse(req.url, true);
        const pathname = q.pathname;
        console.log(`Request for: ${pathname}`);

        switch (pathname) {
            case '/COMP4537/labs/3/getDate/':
                this.handleGetDate(res, q.query);
                break;
            case '/COMP4537/labs/3/writeFile/':
                this.fileHandler.writeFile(res, q.query);
                break;
            case '/COMP4537/labs/3/readFile/':
                this.fileHandler.readFile(res, q.query);
                break;
            default:
                this.sendResponse(res, 404, 'text/html', `<h1 style="color:red;">${strings.notFound}</h1>`);
        }
    }

    handleGetDate(res, query) {
        const responseText = `<p style="color:blue;">${util.formatString(strings.greeting, query["name"], util.getDate())}</p>`;
        this.sendResponse(res, 200, 'text/html', responseText);
    }

    sendResponse(res, statusCode, contentType, content) {
        res.writeHead(statusCode, { 'Content-Type': contentType });
        res.end(content);
    }

    start() {
        http.createServer((req, res) => this.handleRequest(req, res)).listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

const server = new Server(3000);
server.start();
