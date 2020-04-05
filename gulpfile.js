var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

// -----------------------------------------------------------------------------
// getTask() loads external gulp task script functions by filename
// -----------------------------------------------------------------------------
function getTask(task) {
	return require('./tasks/' + task)(gulp, plugins);
}

// -----------------------------------------------------------------------------
// Task: Compile : Scripts, Sass, EJS, All
// -----------------------------------------------------------------------------
gulp.task('compile:index', getTask('compile.index'));


// -----------------------------------------------------------------------------
// Task: Dist : Clean 'dist/'' folder
// -----------------------------------------------------------------------------
gulp.task('dist:clean', getTask('dist.clean'));
gulp.task('code:clean', getTask('code.clean'));


// -----------------------------------------------------------------------------
// Task: dev:config : Copy 'config/*-dev.*' config files to code base
// -----------------------------------------------------------------------------
gulp.task('dev:config', getTask('dev.config'));
gulp.task('qa:config', getTask('qa.config'));
gulp.task('prod:config', getTask('prod.config'));
gulp.task('pkc:config', getTask('pkc.config'));
gulp.task('api:config', getTask('api.config'));


// -----------------------------------------------------------------------------
// Task: Dist : Copy source files for deploy to dist/
// -----------------------------------------------------------------------------
gulp.task('dist:copy', gulp.series('dist:clean', 'compile:index', getTask('dist.copy')));
gulp.task('code:copy', gulp.series('code:clean', getTask('code.copy')));


// -----------------------------------------------------------------------------
// Task: Dist (Build app ready for deployment)
// -----------------------------------------------------------------------------
gulp.task('dist', gulp.series('prod:config', 'dist:copy'));
gulp.task('dist:dev', gulp.series('dev:config', 'dist:copy'));
gulp.task('dist:qa', gulp.series('qa:config', 'dist:copy'));
gulp.task('dist:pkc', gulp.series('pkc:config', 'dist:copy'));
gulp.task('dist:api', gulp.series('api:config', 'dist:copy'));


gulp.task('code', gulp.series('code:copy'));

