process.env.DISABLE_NOTIFIER = true;
// Load plugins
var gulp = require('gulp'),
notify = require('gulp-notify'),
jshint = require('gulp-jshint');

// Scripts
gulp.task('data_miner', function() {
  return gulp.src('data_miner/src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('data_miner/script'))
    .pipe(notify({ message: 'Data Miner Script task complete' }));
});
gulp.task('booker_looper', function() {
  return gulp.src('booker_looper/src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('booker_looper/script'))
    .pipe(notify({ message: 'Booker Looper Script task complete' }));
});
gulp.task('tradegecko', function() {
  return gulp.src('tradegecko/src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest('tradegecko/script'))
    .pipe(notify({ message: 'Tradegecko Script task complete' }));
});

// Watch
gulp.task('watch',function() {

  // Watch data_miner
  gulp.watch('data_miner/src/**/*.js', ['data_miner']);
  gulp.watch('booker_looper/src/**/*.js', ['booker_looper']);
  gulp.watch('tradegecko/src/**/*.js', ['tradegecko']);

});
