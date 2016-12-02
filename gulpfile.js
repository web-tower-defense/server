var gulp = require('gulp'),
nodemon = require('gulp-nodemon'),
plumber = require('gulp-plumber'),
livereload = require('gulp-livereload'),
webpack = require('webpack-stream'),
sass = require('gulp-ruby-sass');

gulp.task('webpack', function() {
  return gulp.src('./public/src/entry.js')
  .pipe(webpack(require('./webpack.config')))
  .pipe(gulp.dest('./public'))
  .pipe(livereload());
});
gulp.task('sass', function () {
  return sass('./public/css/**/*.scss')
  .pipe(gulp.dest('./public/css'))
  .pipe(livereload());
});

gulp.task('watch', function() {
  gulp.watch('./public/src/**/*.js', ['webpack']);
  gulp.watch('./public/css/*.scss', ['sass']);
});

gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'bin/www',
    ext: 'js jade coffee',
    stdout: false,
    ignore:['public/**/*.js']
  }).on('readable', function () {
    this.stdout.on('data', function (chunk) {
      if(/^Express server listening on port/.test(chunk)){
        livereload.changed(__dirname);
      }
    });
    this.stdout.pipe(process.stdout);
    this.stderr.pipe(process.stderr);
  });
});

gulp.task('default', [
  'webpack',
  'sass',
  'develop',
  'watch'
]);
