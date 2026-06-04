import path from "path";
import gulp from "gulp";
import svgo from "gulp-svgo";
import changed, {compareContents} from "gulp-changed";
import autoprefixer from "gulp-autoprefixer";
import FileIndex from "@zidargs/buildtools/FileIndex.js";
import LanguageManager from "@zidargs/buildtools/LanguageManager.js";
import ImportAnalyzer from "@zidargs/buildtools/ImportAnalyzer.js";
import {readJSONFile} from "@zidargs/buildtools/util/ReadJSONFile.js";
import {mergeStream} from "@zidargs/buildtools/util/MergeStream.js";
import {packScript} from "@zidargs/buildtools/PackScript.js";
import SourceImport from "@zidargs/buildtools/SourceImport.js";
import InjectImportMap from "@zidargs/buildtools/InjectImportMap.js";
import "@emcjs/fe/_build_tools/RegisterImportHandlers.js";

const __dirname = path.resolve();

const NODE_FOLDER = path.resolve(__dirname, "node_modules");

const SRC_PATH = path.resolve(__dirname, "src");
const OUT_PATH = path.resolve(__dirname, "dist");

const DEPENDENCIES = readJSONFile(path.resolve(__dirname, "build_dependencies.json"));

/* configuration */
const DELETE_UNUSED_FILES = process.argv.indexOf("-nodelete") < 0;
const NOCOMPRESS = process.argv.indexOf("-nocompress") >= 0;
const REBUILD = process.argv.indexOf("-rebuild") >= 0;
const REBUILDJS = process.argv.indexOf("-rebuildjs") >= 0;

console.log({
    DELETE_UNUSED_FILES,
    NOCOMPRESS,
    REBUILDJS,
    REBUILD
});

function copyJS(files, src, dest, distRoot) {
    let res = gulp.src(files);
    res = res.pipe(FileIndex.register(src, dest));
    res = res.pipe(ImportAnalyzer.register(src, dest, __dirname, distRoot));
    res = res.pipe(SourceImport.compiler());
    if (!REBUILDJS && !REBUILD) {
        res = res.pipe(changed(dest, {hasChanged: compareContents}));
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function buildWorker(files, src, dest) {
    let res = gulp.src(files);
    res = res.pipe(ImportAnalyzer.register(src, dest, __dirname));
    res = res.pipe(packScript());
    res = res.pipe(FileIndex.addThrough(src, dest, true));
    if (!REBUILDJS && !REBUILD) {
        res = res.pipe(changed(dest, {hasChanged: compareContents}));
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

/* PREPARE */
function prepareDependencyPathRewrites(done = () => {}) {
    for (const dependency of DEPENDENCIES) {
        if ("js" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.js.src);
            const DST = `${OUT_PATH}/${dependency.js.dest}`;
            ImportAnalyzer.setPathRewriteRule(SRC, DST);
            if ("name" in dependency)  {
                InjectImportMap.setImport(`${dependency.name}/`, `/${dependency.js.dest}/`);
            }
        }
    }
    done();
}

/* DEPENDENCIES START */
function copyDependencyScripts() {
    const result = [];
    for (const dependency of DEPENDENCIES) {
        if ("js" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.js.src);
            const DST = `${OUT_PATH}/${dependency.js.dest}`;
            const FILES = [
                `${SRC}/**/*.js`
            ];
            result.push(copyJS(FILES, SRC, DST));
        }
    }
    return mergeStream(...result);
}

function buildDependencyWorker() {
    const result = [];
    for (const dependency of DEPENDENCIES) {
        if ("js" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.js.src);
            const DST = `${OUT_PATH}/${dependency.js.dest}`;
            const FILES = [
                `${SRC}/**/*.w.js`
            ];
            result.push(buildWorker(FILES, SRC, DST));
        }
    }
    return mergeStream(...result);
}

function copyDependencyCSS() {
    const result = [];
    for (const dependency of DEPENDENCIES) {
        if ("css" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.css.src);
            const DST = `${OUT_PATH}/${dependency.css.dest}`;
            const FILES = [
                `${SRC}/**/*.css`
            ];
            let res = gulp.src(FILES);
            res = res.pipe(FileIndex.register(SRC, DST));
            if (!REBUILD) {
                res = res.pipe(changed(DST, {hasChanged: compareContents}));
            }
            res = res.pipe(autoprefixer());
            res = res.pipe(gulp.dest(DST));
            result.push(res);
        }
    }
    return mergeStream(...result);
}

function copyDependencyFonts() {
    const result = [];
    for (const dependency of DEPENDENCIES) {
        if ("font" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.font.src);
            const DST = `${OUT_PATH}/${dependency.font.dest}`;
            const FILES = [
                `${SRC}/**/*.ttf`,
                `${SRC}/**/*.eot`,
                `${SRC}/**/*.otf`,
                `${SRC}/**/*.woff`,
                `${SRC}/**/*.woff2`,
                `${SRC}/**/*.svg`
            ];
            let res = gulp.src(FILES);
            res = res.pipe(FileIndex.register(SRC, DST));
            if (!REBUILD) {
                res = res.pipe(changed(DST, {hasChanged: compareContents}));
            }
            res = res.pipe(gulp.dest(DST));
            result.push(res);
        }
    }
    return mergeStream(...result);
}
/* DEPENDENCIES END */

function copyScripts() {
    const FILES = [
        `${SRC_PATH}/**/*.js`
    ];
    return copyJS(FILES, SRC_PATH, OUT_PATH);
}

function copyHTML() {
    const FILES = [
        `${SRC_PATH}/**/*.html`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(SRC_PATH, OUT_PATH));
    res = res.pipe(InjectImportMap.inject());
    if (!REBUILD) {
        res = res.pipe(changed(OUT_PATH, {hasChanged: compareContents}));
    }
    res = res.pipe(gulp.dest(OUT_PATH));
    return res;
}

function copyJSON() {
    const FILES = [
        `${SRC_PATH}/**/*.json`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(SRC_PATH, OUT_PATH));
    if (!REBUILD) {
        res = res.pipe(changed(OUT_PATH, {hasChanged: compareContents}));
    }
    res = res.pipe(gulp.dest(OUT_PATH));
    return res;
}

function copyI18N() {
    const FILES = [
        `${SRC_PATH}/i18n/*.lang`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${SRC_PATH}/i18n`, `${OUT_PATH}/i18n`));
    res = res.pipe(LanguageManager.register(`${SRC_PATH}/i18n`, `${OUT_PATH}/i18n`));
    if (!REBUILD) {
        res = res.pipe(changed(`${OUT_PATH}/i18n`, {hasChanged: compareContents}));
    }
    res = res.pipe(gulp.dest(`${OUT_PATH}/i18n`));
    return res;
}

function copyI18NFragments() {
    const FILES = [
        `${SRC_PATH}/i18n/fragments/**/*.js`,
        `${SRC_PATH}/i18n/fragments/**/*.json`,
        `${SRC_PATH}/i18n/fragments/**/*.lang`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${SRC_PATH}/i18n/fragments`, `${OUT_PATH}/i18n/fragments`));
    if (!REBUILD) {
        res = res.pipe(changed(`${OUT_PATH}/i18n/fragments`, {hasChanged: compareContents}));
    }
    res = res.pipe(gulp.dest(`${OUT_PATH}/i18n/fragments`));
    return res;
}

function copyImg() {
    const FILES = [
        `${SRC_PATH}/**/*.svg`,
        `${SRC_PATH}/**/*.png`,
        `${SRC_PATH}/**/*.webp`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(SRC_PATH, OUT_PATH));
    if (!REBUILD) {
        res = res.pipe(changed(OUT_PATH, {hasChanged: compareContents}));
    }
    res = res.pipe(svgo());
    res = res.pipe(gulp.dest(OUT_PATH));
    return res;
}

function copyCSS() {
    const FILES = [
        `${SRC_PATH}/**/*.css`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(SRC_PATH, OUT_PATH));
    if (!REBUILD) {
        res = res.pipe(changed(OUT_PATH, {hasChanged: compareContents}));
    }
    res = res.pipe(autoprefixer());
    res = res.pipe(gulp.dest(OUT_PATH));
    return res;
}

function copyFonts() {
    const FILES = [
        `${SRC_PATH}/**/*.ttf`,
        `${SRC_PATH}/**/*.eot`,
        `${SRC_PATH}/**/*.otf`,
        `${SRC_PATH}/**/*.woff`,
        `${SRC_PATH}/**/*.woff2`,
        `${SRC_PATH}/**/*.svg`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(SRC_PATH, OUT_PATH));
    if (!REBUILD) {
        res = res.pipe(changed(OUT_PATH, {hasChanged: compareContents}));
    }
    res = res.pipe(gulp.dest(OUT_PATH));
    return res;
}

function finish(done = () => {}) {
    ImportAnalyzer.printUnresolvedImports();
    ImportAnalyzer.writeImportFile();
    done();
}

export const build = gulp.series(
    prepareDependencyPathRewrites,
    gulp.parallel(
        // dependencies
        copyDependencyCSS,
        copyDependencyFonts,
        copyDependencyScripts,
        buildDependencyWorker,
        // application
        copyHTML,
        copyJSON,
        copyI18N,
        copyI18NFragments,
        copyImg,
        copyCSS,
        copyFonts,
        copyScripts,
    ),
    finish
);

export const watch = function() {
    build();
    return gulp.watch(SRC_PATH, build);
};
