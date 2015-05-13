var gulp = require('gulp');
var runSequence = require('gulp-run-sequence');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var order = require('gulp-order');
var watch = require('gulp-watch');
var clean = require('gulp-clean');
var apidoc = require('gulp-apidoc');

var selector = {
  algo_src: [
    'src/algo.js',
    'src/variables.js',
    'src/render.js',
    'src/matrix.js',

    'src/shape/shape.js',
    'src/shape/circle.js',

    'src/renderer/webgl.js',

    'src/utils/debug.js',
    'src/utils/pointUtil.js',
    'src/utils/stringUtil.js',
    'src/utils/objectUtil.js',
    'src/utils/colorUtil.js',
    'src/utils/util.js'
  ],
  build: ['build/*.js'],
  algo_build: ['build/algo.js']
};

/**
 * default
 */
gulp.task('concat', function () {
  return gulp.src(selector.algo_src)
    .pipe(order(selector.algo_src))
    .pipe(concat('algo.js'))
    .pipe(gulp.dest('build'))
    .pipe(concat('algo.min.js'))
    .pipe(uglify({
      preserveComments: 'some'
    }))
    .pipe(gulp.dest('build'));
});

gulp.task('watch', function () {
  gulp.watch(selector.algo_src, ['clean-build', 'concat']);
});

gulp.task('clean-build', function () {
  return gulp.src(selector.build)
    .pipe(clean());
});


/**
 * doc
 */
gulp.task('clean-doc', function () {
  return gulp.src(['./doc/'])
    .pipe(clean());
});

gulp.task('apidoc', function () {
  return apidoc.exec({
    src: './src',
    dest: './doc/',
    debug: false,
    includeFilters: [ '.*\\.js$' ]
  });
});

/**
 * run
 */
gulp.task('default', function (cb) {
  runSequence('clean-build', 'concat', 'watch', cb);
});

gulp.task('doc', function (cb) {
  runSequence('clean-doc', 'apidoc', cb);
});