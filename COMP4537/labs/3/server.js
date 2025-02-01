const { strings } = require('./lang/en/en.js');

const http = require('http');
const now = require('./modules/utils.js');


http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`<p style="color:blue;">${strings.greeting} ${now.getDate()}</p>`);
}).listen(3000);