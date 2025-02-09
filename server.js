const http = require("http");
const url = require("url");
const fs = require("fs");
const { strings } = require("./lang/en/en.js");
const util = require("./modules/utils.js");

class Dictionary {
  constructor() {
    this.dictionary = {
      dog: "an animal",
      cat: "another animal",
      car: "a vehicle",
    };
  }

  add(key, value) {
    if (key in this.dictionary) {
      throw new Error("Key already exists");
    }

    this.dictionary[key] = value;
  }

  find(key) {
    if (!(key in this.dictionary)) {
      throw new Error("Key not found");
    }
    return this.dictionary[key];
  }

  remove(key) {
    delete this.dictionary[key];
  }
}

class FileHandler {
  writeFile(res, query) {
    const text = query["text"];
    fs.appendFile("file.txt", text + "\n", (err) => {
      if (err) {
        this.sendResponse(
          res,
          500,
          "text/html",
          `<h1 style="color:red;">${strings.writeError}</h1>`
        );
      } else {
        this.sendResponse(
          res,
          200,
          "text/html",
          `<h1 style="color:green;">${strings.writeSuccess}</h1>`
        );
      }
    });
  }

  readFile(res, query) {
    const filename = Object.keys(query)[0];
    console.log(`Reading file: ${filename}`);
    fs.readFile(filename, (err, data) => {
      if (err) {
        this.sendResponse(
          res,
          404,
          "text/html",
          `<h1 style="color:red;">${util.formatString(
            strings.readError,
            filename
          )}</h1>`
        );
      } else {
        this.sendResponse(res, 200, "text/html", data);
      }
    });
  }

  sendResponse(res, statusCode, contentType, content) {
    res.writeHead(statusCode, { "Content-Type": contentType });
    res.end(content);
  }
}

class Server {
  constructor(port) {
    this.port = port;
    this.fileHandler = new FileHandler();
    this.dictionary = new Dictionary();
    this.requestsNumber = 0;
  }

  handleRequest(req, res) {
    const q = url.parse(req.url, true);
    const pathname = q.pathname;

    if (req.method === "OPTIONS") {
      res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      return res.end();
    }

    switch (req.method) {
      case "GET":
        switch (pathname) {
          case "/api/definitions/":
            const word = q.query.word;
            try {
              const definition = this.dictionary.find(word);
              this.sendResponse(res, 200, "application/json", {
                word,
                definition,
              });
            } catch (e) {
              this.sendResponse(res, 404, "application/json", {
                error: util.formatString(strings.wordDoesNotExist, word),
              });
            }
            break;
          case "/COMP4537/labs/3/getDate/":
            this.handleGetDate(res, q.query);
            break;
          case "/COMP4537/labs/3/readFile/":
            this.fileHandler.readFile(res, q.query);
            break;
          default:
            this.sendResponse(
              res,
              404,
              "text/html",
              `<h1 style="color:red;">${strings.notFound}</h1>`
            );
        }
        break;

      case "POST":
        switch (pathname) {
          case "/api/definitions/":
            let body = "";
            req.on("data", (chunk) => {
              body += chunk.toString();
            });

            req.on("end", () => {
              const data = JSON.parse(body);
              try {
                this.dictionary.add(data.word, data.definition);
                const date = this.getMonthAndDay();
                this.sendResponse(res, 200, "application/json", {
                  message: util.formatString(
                    strings.addWord,
                    this.requestsNumber,
                    date.month,
                    date.day,
                    data.word,
                    Object.keys(this.dictionary.dictionary).length
                  ),
                });
              } catch (e) {
                this.sendResponse(res, 400, "application/json", {
                  error: util.formatString(
                    strings.wordAlreadyExists,
                    data.word
                  ),
                });
              }
            });
            break;
          case "/COMP4537/labs/3/writeFile/":
            this.fileHandler.writeFile(res, q.query);
            break;
          default:
            this.sendResponse(
              res,
              404,
              "text/html",
              `<h1 style="color:red;">${strings.notFound}</h1>`
            );
        }
        break;

      default:
        this.sendResponse(
          res,
          405,
          "text/html",
          `<h1 style="color:red;">Method Not Allowed</h1>`
        );
    }

    this.requestsNumber++;
  }

  handleGetDate(res, query) {
    const responseText = `<p style="color:blue;">${util.formatString(
      strings.greeting,
      query["name"],
      util.getDate()
    )}</p>`;
    this.sendResponse(res, 200, "text/html", responseText);
  }

  sendResponse(res, statusCode, contentType, content) {
    res.writeHead(statusCode, {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": "*",
    });
    if (contentType === "application/json" && typeof content === "object") {
      res.end(JSON.stringify(content));
    } else {
      res.end(content);
    }
  }

  getMonthAndDay() {
    const today = new Date();
    const month = strings.monthNames[today.getMonth()];
    const day = today.getDate();

    return { month, day };
  }

  start() {
    http
      .createServer((req, res) => this.handleRequest(req, res))
      .listen(this.port, () => {
        console.log(`Server running on port ${this.port}`);
      });
  }
}

const server = new Server(3000);
server.start();
