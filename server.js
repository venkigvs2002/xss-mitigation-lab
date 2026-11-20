
const http = require("http");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const db = new Database("database/blog.db");

// Create comments table
db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

const server = http.createServer((req, res) => {

    // Blog page
    if (req.method === "GET" && req.url === "/") {
        const html = fs.readFileSync(
            path.join(__dirname, "public", "index.html")
        );

        res.writeHead(200, {
            "Content-Type": "text/html"
        });

        res.end(html);
        return;
    }

    // Static CSS
    if (req.method === "GET" && req.url === "/style.css") {
        const css = fs.readFileSync(
            path.join(__dirname, "public", "style.css")
        );

        res.writeHead(200, {
            "Content-Type": "text/css"
        });

        res.end(css);
        return;
    }

    // Static JavaScript
    if (req.method === "GET" && req.url === "/script.js") {
        const js = fs.readFileSync(
            path.join(__dirname, "public", "script.js")
        );

        res.writeHead(200, {
            "Content-Type": "application/javascript"
        });

        res.end(js);
        return;
    }

    // Retrieve comments
    if (req.method === "GET" && req.url === "/comments") {
        const comments = db.prepare(
            "SELECT * FROM comments ORDER BY id DESC"
        ).all();

        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify(comments));
        return;
    }

    // Submit comment
    if (req.method === "POST" && req.url === "/comments") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            const data = new URLSearchParams(body);

            const name = data.get("name");
            const email = data.get("email");
            const comment = data.get("comment");

            db.prepare(`
                INSERT INTO comments (name, email, comment)
                VALUES (?, ?, ?)
            `).run(name, email, comment);

            res.writeHead(302, {
                "Location": "/"
            });

            res.end();
        });

        return;
    }

    res.writeHead(404);
    res.end("Not Found");
});

server.listen(3000, () => {
    console.log("Blog running at http://localhost:3000");
});
