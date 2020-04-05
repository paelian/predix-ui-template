'use strict';
const clean = require('gulp-clean');

// ---------------------------
//   Task: Clean 'dist' folder
// ---------------------------

module.exports = function(gulp) {
  return function() {
    return gulp.src('code', {read: false, allowEmpty: true})
      .pipe(clean());
  };
};
