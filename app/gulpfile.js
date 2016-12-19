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
        'js/server/tactical.js',
        'js/server/enemies.js',
        'js/server/friendlies.js',
        'js/server/game.js',
        'js/client/starfire_menu.js',
        'js/client/starfire_ui.js'
      ])
    .pipe(maps.init())
    .pipe(concat('app.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js'));
});

gulp.task("concatServerScripts", function() {
    return gulp.src([
        'js/server/tactical.js',
        'js/server/enemies.js',
        'js/server/friendlies.js',
        'js/server/game.js',
        'js/server/server.js',
      ])
    .pipe(maps.init())
    .pipe(concat('server.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js'));
});

gulp.task("concatClientScripts", function() {
    return gulp.src([
        'js/client/starfire_ui.js',
        'js/client/starfire_menu.js',
        'js/server/starfire_ui.js',
      ])
    .pipe(maps.init())
    .pipe(concat('client.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js'));
});

gulp.task("minifyScripts", ["concatClientScripts", "concatServerScripts"], function() {
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
    ["concatClientScripts", "concatServerScripts"]);
});

gulp.task('clean', function() {
  return del(['dist', 'css/main.css*', 'js/app*.js*', 'js/client*.js*', 'js/server*.js*']);
})

gulp.task("build", [/* 'minifyScripts', */ 'concatServerScripts',
                    'concatClientScripts', 'concatScripts',
                    'compileSass'],
  function() {
    return gulp.src(["css/main.css", "js/app.js", "index.html"], { base: "./" })
               .pipe(gulp.dest("dist"));
});

gulp.task('serve', ['watchFiles']);

gulp.task("default", ["clean"], function() {
  gulp.start('build');
});
