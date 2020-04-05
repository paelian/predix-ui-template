'use strict';
const merge = require('merge-stream');
var gulp = require('gulp');
var debug = require('gulp-debug');

// ------------------------------------------------
//   Task: Copy all deployment files to Dist folder
// ------------------------------------------------

module.exports = function(gulp) {
  return function() {

    // These directories contain files that are not included in the vulcanize process for various reasons.
    // (Whenever possible files should be imported using HTML imports, so they're included in the polymer build.)
    //  see tasks/compile.polymer.js
    // var extraDirectories = [
    //   'public/bower_components/polymer',
    //   'public/bower_components/webcomponentsjs',
    //   'public/bower_components/font-awesome',

    //   'public/bower_components/px-theme',
    //   'public/bower_components/px-typography-design',
    //   'public/bower_components/px-polymer-font-awesome',
    //   'public/bower_components/px-data-table',

    //   'public/elements/dev-guide'
    // ];

    // var extraStreams = [];

    // extraDirectories.forEach(function(bc) {
    //   extraStreams.push(gulp.src([bc + '/**/*.*']).pipe(gulp.dest('dist/' + bc)));
    // });

    var publicFiles = gulp.src(['./public/**/*','!./public/**/bower_components/', '!./public/**/bower_components/**/*']).pipe(gulp.dest('./code/public'));
    var configFiles = gulp.src(['./config/**/*.*']).pipe(gulp.dest('./code/config'));
    var tasksFiles = gulp.src(['./tasks/**/*.*']).pipe(gulp.dest('./code/tasks'));
    var jsSrcFiles = gulp.src(['./src/**/*.*']).pipe(gulp.dest('./code/src'));
    var vscodeFiles = gulp.src(['./.vscode/**/*.*']).pipe(gulp.dest('./code/.vscode'));
    var docsFiles = gulp.src(['./public/docs/**/*.*']).pipe(gulp.dest('./code/public/docs'));
    var server = gulp.src(['server/**/*.*']).pipe(gulp.dest('./code/server'));
    var packageFile = gulp.src(['package.json', 'bower.json', '.bowerrc', 'manifest.yml', 'pm2_main.js', 'gulpfile.js', '.gitignore', 'README.md', 'rollup.config.js']).pipe(gulp.dest('code'));
    // var packageFile = gulp.src(['package.json', 'bower.json', '.bowerrc', 'manifest.yml', 'pm2_main.js', 'gulpfile.js', '.gitignore', 'README.md']).pipe(gulp.dest('code'));

    return merge(server, packageFile, publicFiles, configFiles, tasksFiles, jsSrcFiles, vscodeFiles ,docsFiles);
  };
};
