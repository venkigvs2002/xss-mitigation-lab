
const http = require("http");
const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const db = new Database("database/blog.db");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);


// 2nd db query , saving sanitized comments in a separate table for demonstration purposes

db.exec(`
    CREATE TABLE IF NOT EXISTS sanitized_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        comment TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Server side rendering of HTML Tree and sanitizing against allowed tags
function sanitizeHTML(input) {

    return DOMPurify.sanitize(input, {

        ALLOWED_TAGS: [
            "p",
            "b",
            "strong",
            "i",
            "em"
        ],

        ALLOWED_ATTR: []

    });

}


// HTML entity encoder for HTML text context
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;"
    })[char]);
}

const server = http.createServer((req, res) => {

    const url = new URL(req.url, "http://localhost:3000");
    const pathname = url.pathname;

    // CSP demonstration switch:
    // ?csp=on enables the policy.
    // Default is off for comparing the lab's behavior.
    if (url.searchParams.get("csp") === "on") {
        res.setHeader(
            "Content-Security-Policy",
            [
                "default-src 'self'",
                "script-src 'self'",
                "style-src 'self'",
                "object-src 'none'",
                "base-uri 'self'",
                "frame-ancestors 'none'",
                "form-action 'self'"
            ].join("; ")
        );
    }

    // Blog page
    if (req.method === "GET" && pathname === "/") {
        const html = fs.readFileSync(
            path.join(__dirname, "public", "index.html")
        );

        res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });

        return res.end(html);
    }


    // Server-side sanitized comment submission
if (
    req.method === "POST" &&
    pathname === "/comments/sanitized"
) {

    let body = "";

    req.on("data", chunk => {
        body += chunk;

        if (body.length > 100000) {
            req.destroy();
        }
    });

    req.on("end", () => {

        const data = new URLSearchParams(body);

        const name = data.get("name") || "";
        const email = data.get("email") || "";
        const comment = data.get("comment") || "";

        // Server-side validation
        if (
            !name.trim() ||
            !email.trim() ||
            !comment.trim() ||
            name.length > 100 ||
            email.length > 254 ||
            comment.length > 5000
        ) {
            res.writeHead(400);
            return res.end("Invalid input");
        }

        // Sanitize on the backend
        const sanitizedName = sanitizeHTML(name);
        const sanitizedComment = sanitizeHTML(comment);

        // Store sanitized values
        db.prepare(`
            INSERT INTO sanitized_comments
            (name, email, comment)
            VALUES (?, ?, ?)
        `).run(
            sanitizedName,
            email,
            sanitizedComment
        );

        res.writeHead(201, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            message: "Sanitized comment stored successfully"
        }));

    });

    return;
}


// Retrieve server-sanitized comments
if (
    req.method === "GET" &&
    pathname === "/comments/sanitized"
) {

    const comments = db.prepare(`
        SELECT * FROM sanitized_comments
        ORDER BY id DESC
    `).all();

    res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8"
    });

    return res.end(JSON.stringify(comments));
}

    // Static files
    const staticFiles = {
        "/style.css": {
            file: "public/style.css",
            type: "text/css"
        },
        "/script.js": {
            file: "public/script.js",
            type: "application/javascript"
        },
        "/purify.min.js": {
            file: "node_modules/dompurify/dist/purify.min.js",
            type: "application/javascript"
        }
    };

    if (req.method === "GET" && staticFiles[pathname]) {
        const asset = staticFiles[pathname];
        const assetPath = path.join(__dirname, asset.file);

        res.writeHead(200, {
            "Content-Type": asset.type
        });

        return res.end(fs.readFileSync(assetPath));
    }

    // Retrieve original comments
    if (req.method === "GET" && pathname === "/comments") {
        const comments = db.prepare(
            "SELECT * FROM comments ORDER BY id DESC"
        ).all();

        res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8"
        });

        return res.end(JSON.stringify(comments));
    }

    // Retrieve comments with server-side HTML encoding
    if (req.method === "GET" && pathname === "/comments/encoded") {
        const comments = db.prepare(
            "SELECT * FROM comments ORDER BY id DESC"
        ).all();

        const encodedComments = comments.map(comment => ({
            ...comment,
            name: escapeHTML(comment.name),
            comment: escapeHTML(comment.comment)
        }));

        res.writeHead(200, {
            "Content-Type": "application/json; charset=utf-8"
        });

        return res.end(JSON.stringify(encodedComments));
    }

    // Submit comment
    if (req.method === "POST" && pathname === "/comments") {
        let body = "";

        req.on("data", chunk => {
            body += chunk;

            if (body.length > 100000) {
                req.destroy();
            }
        });

        req.on("end", () => {
            const data = new URLSearchParams(body);

            const name = data.get("name");
            const email = data.get("email");
            const comment = data.get("comment");

            if (!name || !email || !comment) {
                res.writeHead(400);
                return res.end("Missing fields");
            }

            db.prepare(`
                INSERT INTO comments (name, email, comment)
                VALUES (?, ?, ?)
            `).run(name, email, comment);

            res.writeHead(303, {
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
