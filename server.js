const { strings } = require('./COMP4537/labs/3/lang/en/en.js');

const http = require('http');
const util = require('./COMP4537/labs/3/modules/utils.js');
const url = require('url');


http.createServer((req, res) => {
    const q = url.parse(req.url, true);
    const pathname = q.pathname;
    console.log(pathname);

    if (pathname === '/COMP4537/labs/3/getDate/') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`<p style="color:blue;">${util.formatString(strings.greeting, q.query["name"], util.getDate())}</p>`);
    } else if (pathname === '/COMP4537/labs/3/writeFile/') {
        const fs = require('fs');
        const text = q.query["text"];
        fs.appendFile('file.txt', text + '\n', (err) => {
            if (err) {
                res.writeHead(500, {'Content-Type': 'text/html'});
                res.end(`<h1 style="color:red;">${strings.writeError}</h1>`);
            } else {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(`<h1 style="color:green;">${strings.writeSuccess}</h1>`);
            }
        });
    } else if (pathname === '/COMP4537/labs/3/readFile/') {
        const fs = require('fs');
        const filename = Object.keys(q.query)[0];
        console.log(filename);
        fs.readFile(filename, (err, data) => {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/html'});
                res.end(`<h1 style="color:red;">${util.formatString(strings.readError, filename)}</h1>`);
            } else {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(data);
            }
        });
    } else {
        res.writeHead(404, {'Content-Type': 'text/html'});
        res.end(`<h1 style="color:red;">${strings.notFound}</h1>`);
    }
}).listen(3000);