const fs = require('fs');
const BLACKLIST = new Set([
    "/dist.js",
    "/index.json",
    "/package.json",
    "/.git",
    "/sw.js_template"
]);
function resolveFiles(currentPath) {
    let result = [];
    let files = fs.readdirSync(currentPath , {withFileTypes: true});
    for (let file of files) {
        let absolutePath = `${currentPath}/${file.name}`;
        var relativePath = absolutePath.replace(__dirname, "");
        if (!BLACKLIST.has(relativePath)) {
            if (file.isDirectory()) {
                let buffer = resolveFiles(absolutePath);
                result = result.concat(buffer);
            } else if (relativePath.length > 1 && file.isFile()) {
                result.push(relativePath);
            }
        }
    }
    return result;
}
let files = resolveFiles(__dirname);
//files.push("/");
let content = {
    version: 0,
    data: files
};
if (fs.existsSync("index.json")) {
    let oldIndex = JSON.parse(fs.readFileSync("index.json"));
    content.version = oldIndex.version + 1;
}
let tpl = fs.readFileSync("sw.js_template");
fs.writeFileSync("sw.js", `const CACHE_NAME = "${content.version}";\nconst FILES = ${JSON.stringify(content.data, null, 4)};\n\n${tpl}`);
fs.writeFileSync("index.json", JSON.stringify(content));