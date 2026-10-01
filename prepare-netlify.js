const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");

const EXT = new Set([
    ".html", ".css", ".js", ".mjs", ".png", ".jpg",
    ".jpeg", ".webp", ".gif", ".svg", ".ico",
    ".woff", ".woff2", ".ttf"
]);

const EXCLUDE = new Set([
    "server.js",
    "prepare-netlify.js"
]);

fs.rmSync(PUBLIC, { recursive: true, force: true });
fs.mkdirSync(PUBLIC, { recursive: true });

function copyStatic(source, destination) {

    fs.mkdirSync(path.dirname(destination), { recursive: true });

    const ext = path.extname(source).toLowerCase();

    if ([".html", ".css", ".js", ".mjs"].includes(ext)) {

        const data = fs.readFileSync(source, "utf8")
            .replaceAll("http://localhost:3000", "")
            .replaceAll("http://127.0.0.1:3000", "");

        fs.writeFileSync(destination, data, "utf8");
        return;
    }

    fs.copyFileSync(source, destination);
}

for (const item of fs.readdirSync(ROOT, { withFileTypes: true })) {

    if (!item.isFile() || EXCLUDE.has(item.name)) {
        continue;
    }

    const ext = path.extname(item.name).toLowerCase();

    if (!EXT.has(ext)) {
        continue;
    }

    const destinationName =
        item.name.toLowerCase() === "techshop.html"
            ? "index.html"
            : item.name;

    copyStatic(
        path.join(ROOT, item.name),
        path.join(PUBLIC, destinationName)
    );
}

const imageSources = [
    path.join(ROOT, "imagens"),
    path.join(ROOT, "..", "imagens")
];

for (const source of imageSources) {

    if (!fs.existsSync(source)) {
        continue;
    }

    fs.cpSync(
        source,
        path.join(PUBLIC, "imagens"),
        { recursive: true }
    );

    break;
}

fs.mkdirSync(
    path.join(PUBLIC, "imagens"),
    { recursive: true }
);

console.log("TechShop preparado para Netlify.");
