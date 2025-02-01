const { strings } = require('./lang/en/en.js');

const http = require('http');
const util = require('./modules/utils.js');
const url = require('url');


http.createServer((req, res) => {
    let q = url.parse(req.url, true);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<p style="color:blue;">${util.formatString(strings.greeting, q.query["name"], util.getDate())}</p>`);
}).listen(3000);