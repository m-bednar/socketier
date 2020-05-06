const { src, series, parallel } = require('gulp');
const { exec } = require('child_process');
const gulpNodemon = require('gulp-nodemon');
const gulpWatch = require('gulp-watch');
const gulpServer = require('gulp-live-server');
const gulpClean = require('gulp-clean');

const DEST_DIR = './dist';
const MAIN_SCRIPT = './src/server/index.ts';
const TS_CONF_CLIENT = 'tsconfig.client.json';
const TS_CONF_SERVER = 'tsconfig.server.json';

let server;

async function clean() {
    return src(DEST_DIR, { read: false, allowEmpty: true })
        .pipe(gulpClean({ force: true }));
}

async function serve() {
    server = gulpServer.static(['dist/client', 'example']);
    server.start();

    exec(`tsc -w -p ${TS_CONF_CLIENT}`);

    return gulpWatch(['src/client/**', 'example/**'], (file) => {
        return compileClient().then((p) => p.once('exit', () => server.notify(file)));
    });
}

async function nodemon() {
    return gulpNodemon({ watch: [ MAIN_SCRIPT, 'src/server/**/*.ts' ], exec: 'ts-node', script: MAIN_SCRIPT });
}

async function compileClient() {
    return exec(`tsc -p ${TS_CONF_CLIENT}`);
}

async function compileServer() {
    return exec(`tsc -p ${TS_CONF_SERVER}`);
}

/* --- exports --- */
exports.clean   = clean;
exports.compile = parallel(compileServer, compileClient);
exports.run     = series(clean, exports.compile, parallel(nodemon, serve), clean);
