const { series } = require('gulp');

async function clean() {

}

async function build() {

}

exports.build = build;
exports.default = series(clean, build);
