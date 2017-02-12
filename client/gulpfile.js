var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var livereload = require('gulp-livereload');

gulp.task('browserify', function () {
    return browserify('./js/src/index.js')
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('app.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('./js'))
        .pipe(livereload());

});

gulp.task('watch', function () {
    livereload.listen();
    gulp.watch("./js/src/**/*.js", ['browserify'])
})

gulp.task('default', function () {
    livereload.listen();
    gulp.task('caller', ['browserify', 'watch']);
})