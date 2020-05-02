const { src, series, parallel, watch } = require('gulp');
const { exec } = require('child_process');
const gulpServer = require('gulp-live-server');
const gulpClean = require('gulp-clean');

const DEST_DIR = './dist';
const TS_CONF_CLIENT = 'tsconfig.client.json';
const TS_CONF_SERVER = 'tsconfig.server.json';

async function clean() {
    return src(DEST_DIR, { read: false, allowEmpty: true })
        .pipe(gulpClean({ force: true }));
}

async function serve() {
    let server = gulpServer.static(['dist/client', 'example']);
    server.start();

    return watch(['dist/client/**', 'example/**'], (file) => {
        server.notify.apply(server, [file]);
    });
}

async function compileClient() {
    return exec(`tsc -p ${TS_CONF_CLIENT}`);
}

async function compileServer() {
    return exec(`tsc -p ${TS_CONF_SERVER}`);
}

exports.compile = series(clean, parallel(compileServer, compileClient));
exports.run = series(exports.compile, serve, clean);
