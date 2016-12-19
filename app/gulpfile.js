"use strict";

var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    maps = require('gulp-sourcemaps'),
    del = require('del');

gulp.task("concatScripts", function() {
    return gulp.src([
        'js/tactical.js',
        'js/enemies.js',
        'js/friendlies.js',
        'js/game.js'
      ])
    .pipe(maps.init())
    .pipe(concat('app.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js'));
});

gulp.task("minifyScripts", ["concatScripts"], function() {
  return gulp.src("js/app.js")
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('js'));
});

gulp.task('compileSass', function() {
  return gulp.src("scss/main.scss")
      .pipe(maps.init())
      .pipe(sass())
      .pipe(maps.write('./'))
      .pipe(gulp.dest('css'));
});

gulp.task('watchFiles', function() {
  gulp.watch('scss/**/*.scss', ['compileSass']);
  gulp.watch([
      'js/tactical.js',
      'js/friendlies.js',
      'js/enemies.js',
      'js/game.js'
    ],
    ['concatScripts']);
});

gulp.task('clean', function() {
  return del(['dist', 'css/main.css*', 'js/app*.js*']);
})

gulp.task("build", [/* 'minifyScripts', */ 'concatScripts', 'compileSass'], function() {
  return gulp.src(["css/main.css", "js/app.min.js", "index.html"], { base: "./" })
             .pipe(gulp.dest("dist"));
});

gulp.task('serve', ['watchFiles']);

gulp.task("default", ["clean"], function() {
  gulp.start('build');
});
