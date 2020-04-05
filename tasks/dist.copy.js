'use strict';
const merge = require('merge-stream');
var gulp = require('gulp');
var debug = require('gulp-debug');

var srcOptions = { allowEmpty: true };

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

    var publicFiles = gulp.src(['./public/**/*'], srcOptions).pipe(gulp.dest('./dist/public'));
    var docsFiles = gulp.src(['./public/docs/**/*.*'],srcOptions).pipe(gulp.dest('./dist/public/docs'));
    var server = gulp.src(['server/**/*.*'], srcOptions).pipe(gulp.dest('./dist/server'))
    var packageFile = gulp.src(['package.json', 'bower.json', '.bowerrc', 'manifest.yml', 'pm2_main.js', 'ecosystem.config.js'], srcOptions).pipe(gulp.dest('dist'));

    return merge(server, packageFile, publicFiles, docsFiles);
  };
};
