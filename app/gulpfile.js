'use strict';

var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    maps = require('gulp-sourcemaps'),
     del = require('del');

gulp.task('concatServerScripts', function() {
    return gulp.src([
        'js/server/_tactical.js',
        'js/server/_deck.js',
        'js/server/_enemies.js',
        'js/server/_friendlies.js',
        'js/server/_game.js',
        'js/server/_build.js',
        'js/server/_server.js'
      ])
    .pipe(maps.init())
    .pipe(concat('app.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest(__dirname));
});

gulp.task('concatGameScripts', function() {
    return gulp.src([
        'public/js/jquery.min.js',
        'public/js/_client.js',
        'public/js/_typeWord.js',
        'public/js/_menu.js',
        'public/js/_ui.js'
      ])
    .pipe(maps.init())
    .pipe(concat('game.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js'));
});

gulp.task('concatMenuScripts', function() {
    return gulp.src([
        'public/js/jquery.min.js',
        'public/js/_typeWord.js',
        'public/js/_menu.js',
      ])
    .pipe(maps.init())
    .pipe(concat('menu.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('js'));
});

gulp.task('minifyScripts', ['concatGameScripts', 'concatMenuScripts', 'concatServerScripts'], function() {
  return gulp.src('js/app.js')
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('js'));
});

gulp.task('compileSass', function() {
  return gulp.src('scss/main.scss')
      .pipe(maps.init())
      .pipe(sass())
      .pipe(maps.write('./'))
      .pipe(gulp.dest('public/css'));
});

gulp.task('watchFiles', function() {
  gulp.watch('scss/**/*.scss', ['compileSass']);
  gulp.watch([
      'js/server/*.js',
      'public/js/*.js'
    ],
    ['concatGameScripts', 'concatMenuScripts', 'concatServerScripts']);
});

gulp.task('clean', function() {
  return del(['dist', 'public/css/main.css*', 'js/game*.js*', 'js/menu*.js*', 'server*.js*']);
});

gulp.task('build', [/* 'minifyScripts', */ 'concatServerScripts',
                    'concatGameScripts', 'concatMenuScripts', 'compileSass'],
  function() {
    return gulp.src(['js/game.js', 'js/menu.js', 'public/img/**', 'public/css/**', 'views/**', 'app.js', 'index.html'], { base: './' })
               .pipe(gulp.dest('dist'));
});

gulp.task('serve', ['watchFiles']);

gulp.task('default', ['clean'], function() {
  gulp.start('build');
});
