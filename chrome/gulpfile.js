'use strict';

var gulp = require('gulp'),
clean = require('gulp-clean'),
cleanhtml = require('gulp-cleanhtml'),
minifycss = require('gulp-minify-css'),
jshint = require('gulp-jshint'),
template = require('gulp-template'),
sass = require('gulp-sass'),
stripdebug = require('gulp-strip-debug'),
uglify = require('gulp-uglify'),
zip = require('gulp-zip');

var context = {
  DEV: process.env.DEV,

  /*global process*/
  url: (process.env.DEV ? 'http://localhost:3000' : 'https://aws-deploy.sgdev.org'),
  // url: process.env.DEV ? 'http://localhost:3000' : 'https://sourcegraph.com'
};

// Clean build directory
gulp.task('clean', function() {
  return gulp.src('build/*', {read: false})
    .pipe(clean());
});

// Copy static folders to build directory
gulp.task('copy', function() {
  gulp.src('manifest.json')
    .pipe(template(context))
    .pipe(gulp.dest('build'));
  return gulp.src(['*.png']).pipe(gulp.dest('build'));
});

//copy and compress HTML files
gulp.task('html', function() {
  return gulp.src('*.html')
    .pipe(template(context))
    .pipe(cleanhtml())
    .pipe(gulp.dest('build'));
});

//run scripts through JSHint
gulp.task('jshint', function() {
  return gulp.src(['*.js', '!gulpfile.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

//copy vendor scripts and uglify all other scripts, creating source maps
// gulp.task('scripts', ['jshint'], function() {
gulp.task('scripts', function() {
  return gulp.src(['*.js', '!gulpfile.js'])
    .pipe(template(context))
    // .pipe(stripdebug())
    // .pipe(uglify({outSourceMap: true}))
    .pipe(gulp.dest('build'));
});

//minify styles
gulp.task('styles', function() {
  return gulp.src('*.scss')
    .pipe(sass({errLogToConsole: true}))
    .pipe(minifycss({root: '.', keepSpecialComments: 0}))
    .pipe(gulp.dest('build'));
});

// // Build distributable and sourcemaps after other tasks completed
// gulp.task('zip', ['html', 'scripts', 'styles', 'copy'], function() {
//   var manifest = require('./src/manifest'),
//   distFileName = manifest.name + ' v' + manifest.version + '.zip',
//   mapFileName = manifest.name + ' v' + manifest.version + '-maps.zip';
//   //collect all source maps
//   gulp.src('build/scripts/**/*.map')
//   .pipe(zip(mapFileName))
//   .pipe(gulp.dest('dist'));
//   //build distributable extension
//   return gulp.src(['build/**', '!build/scripts/**/*.map'])
//   .pipe(zip(distFileName))
//   .pipe(gulp.dest('dist'));
// });

gulp.task('build', ['clean', 'html', 'scripts', 'styles', 'copy']);

gulp.task('reload_chrome_extensions', function() {
  // /*global require*/
  // var exec = require('child_process').exec;
  // exec('chromium-browser http://reload.extensions', function(err) {
  //   if (err) {
  //     console.log(err);
  //   }
  // });
});

gulp.task('watch', function() {
  gulp.watch(['*.js', '*.scss', '*.html', '*.json'], ['build', 'reload_chrome_extensions']);
});

// Run all tasks after build directory has been cleaned
gulp.task('default', ['clean', 'build', 'reload_chrome_extensions', 'watch']);
