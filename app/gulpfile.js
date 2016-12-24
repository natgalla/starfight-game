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
        'js/server/_tactical.js',
        'js/server/_enemies.js',
        'js/server/_friendlies.js',
        'js/server/_game.js',
        'js/client/_starfire_menu.js',
        'js/client/_starfire_ui.js',
        'js/client/_localstart.js'
      ])
    .pipe(maps.init())
    .pipe(concat('app.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js'));
});

gulp.task("concatServerScripts", function() {
    return gulp.src([
        'js/server/_tactical.js',
        'js/server/_enemies.js',
        'js/server/_friendlies.js',
        'js/server/_game.js',
        'js/server/_build.js',
        'js/server/_server.js',
        'js/server/_router.js'
      ])
    .pipe(maps.init())
    .pipe(concat('app.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest(__dirname));
});

gulp.task("concatGameScripts", function() {
    return gulp.src([
        'public/js/client/_client.js',
        'public/js/client/_typeWord.js',
        'public/js/client/_room.js',
        'public/js/client/_starfire_ui.js'
      ])
    .pipe(maps.init())
    .pipe(concat('game.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js'));
});

gulp.task("concatMenuScripts", function() {
    return gulp.src([
        'public/js/client/_typeWord.js',
        'public/js/client/_starfire_menu.js',
      ])
    .pipe(maps.init())
    .pipe(concat('menu.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js'));
});

gulp.task("minifyScripts", ["concatGameScripts", "concatMenuScripts", "concatServerScripts"], function() {
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
      .pipe(gulp.dest('public/css'));
});

gulp.task('watchFiles', function() {
  gulp.watch('scss/**/*.scss', ['compileSass']);
  gulp.watch([
      'js/server/*.js',
      'public/js/client/*.js'
    ],
    ["concatGameScripts", "concatMenuScripts", "concatServerScripts"]);
});

gulp.task('clean', function() {
  return del(['dist', 'public/css/main.css*', 'js/game*.js*', 'js/menu*.js*', 'server*.js*']);
})

gulp.task("build", [/* 'minifyScripts', */ 'concatServerScripts',
                    'concatGameScripts', 'concatMenuScripts', 'compileSass'],
  function() {
    return gulp.src(["css/main.css", "js/game.js", "js/menu.js", "public/img", "app.js", "index.html"], { base: "./" })
               .pipe(gulp.dest("dist"));
});

gulp.task('serve', ['watchFiles']);

gulp.task("default", ["clean"], function() {
  gulp.start('build');
});
