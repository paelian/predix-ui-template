'use strict';
const merge = require('merge-stream');
var gulp = require('gulp');
var debug = require('gulp-debug');
var inlinesource = require('gulp-inline-source');
var rename = require('gulp-rename');

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

    var configFile = gulp.src('config/cf-pkc.json', srcOptions).pipe(rename('cf.json')).pipe(gulp.dest('server'));
    var manifestFile = gulp.src('config/manifest-pkc.yml', srcOptions).pipe(rename('manifest.yml')).pipe(gulp.dest('./'));
    var pm2mainFile = gulp.src('config/pm2_main-pkc.js', srcOptions).pipe(rename('pm2_main.js')).pipe(gulp.dest('./'));
    var pm2ecoFile = gulp.src('config/ecosystem-pkc.config.js', srcOptions).pipe(rename('ecosystem.config.js')).pipe(gulp.dest('./'));
    
    return merge(configFile, manifestFile);
  };
};
