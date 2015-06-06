var gulp = require('gulp');
var runSequence = require('gulp-run-sequence');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var order = require('gulp-order');
var watch = require('gulp-watch');
var clean = require('gulp-clean');
var apidoc = require('gulp-apidoc');
var browserSync = require( 'browser-sync' );

var selector = {
  algo_src: [
    'src/other/perlin.js',
    'src/other/delaunay.js',

    'src/algo.js',
    'src/variables.js',
    'src/render.js',

    'src/math/matrix3.js',
    'src/math/matrix4.js',

    'src/loader/loader.js',

    'src/shape/shapeCtrl.js',
    'src/shape/shape.js',
    'src/shape/polygon.js',
    'src/shape/circle.js',
    'src/shape/rectangle.js',
    'src/shape/path.js',
    'src/shape/particle.js',

    'src/svg/svg.js',

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
    .pipe(order(selector.algo_src, {base: '.'}))
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
 * bs
 */
gulp.task( 'bs', function() {
  return browserSync.init( null, {
    server: {
      baseDir: './'
    },
    port: 3000,
    open: false,
    notify: true,
    xip: false
  });
});

/**
 * run
 */
gulp.task('default', function (cb) {
  runSequence('clean-build', 'concat', 'watch', 'bs', cb);
});

gulp.task('doc', function (cb) {
  runSequence('clean-doc', 'apidoc', cb);
});
