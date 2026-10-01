const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, "public");

const STATIC_EXTENSIONS = new Set([
    ".html", ".css", ".js", ".mjs", ".png", ".jpg", ".jpeg",
    ".webp", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf"
]);

const EXCLUDED_FILES = new Set([
    "server.js",
    "prepare-netlify.js",
    "index.html"
]);

function copyTextFile(source, destination) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });

    const data = fs.readFileSync(source, "utf8")
        .replaceAll("http://localhost:3000", "")
        .replaceAll("http://127.0.0.1:3000", "");

    fs.writeFileSync(destination, data, "utf8");
}

function copyFile(source, destination) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });

    const ext = path.extname(source).toLowerCase();

    if ([".html", ".css", ".js", ".mjs"].includes(ext)) {
        copyTextFile(source, destination);
        return;
    }

    fs.copyFileSync(source, destination);
}

fs.rmSync(PUBLIC, { recursive: true, force: true });
fs.mkdirSync(PUBLIC, { recursive: true });

// Canonical storefront pages.
for (const file of ["techshop.html", "admin.html", "login.html"]) {
    const source = path.join(ROOT, file);

    if (!fs.existsSync(source)) {
        continue;
    }

    const destinationName =
        file === "techshop.html" ? "index.html" : file;

    copyFile(source, path.join(PUBLIC, destinationName));
}

// Other static assets at project root.
for (const item of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!item.isFile() || EXCLUDED_FILES.has(item.name)) {
        continue;
    }

    const ext = path.extname(item.name).toLowerCase();

    if (!STATIC_EXTENSIONS.has(ext)) {
        continue;
    }

    if (["admin.html", "login.html", "techshop.html"].includes(item.name)) {
        continue;
    }

    copyFile(
        path.join(ROOT, item.name),
        path.join(PUBLIC, item.name)
    );
}

// Product images live inside the Git repository under /imagens.
const imagens = path.join(ROOT, "imagens");

if (fs.existsSync(imagens)) {
    fs.cpSync(
        imagens,
        path.join(PUBLIC, "imagens"),
        { recursive: true }
    );
}

console.log("TechShop preparado para Netlify.");
console.log(`Arquivos publicados em: ${PUBLIC}`);
