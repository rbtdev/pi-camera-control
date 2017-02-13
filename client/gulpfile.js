var gulp = require('gulp');
var wrap = require('gulp-wrap');
var concat = require('gulp-concat');
var declare = require('gulp-declare');
var handlebars = require('gulp-handlebars');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var livereload = require('gulp-livereload');

gulp.task('templates', function () {
    // Load templates from the templates/ folder relative to where gulp was executed
    gulp.src('src/templates/**/*.hbs')
        // Compile each Handlebars template source file to a template function
        .pipe(handlebars())
        // Wrap each template function in a call to Handlebars.template
        .pipe(wrap('Handlebars.template(<%= contents %>)'))
        // Declare template functions as properties and sub-properties of exports
        .pipe(declare({
            root: 'exports',
            noRedeclare: true, // Avoid duplicate declarations
            processName: function (filePath) {
                // Allow nesting based on path using gulp-declare's processNameByPath()
                // You can remove this option completely if you aren't using nested folders
                // Drop the templates/ folder from the namespace path by removing it from the filePath
                return declare.processNameByPath(filePath.replace('src/templates/', ''));
            }
        }))
        // Concatenate down to a single file
        .pipe(concat('index.js'))
        // Add the Handlebars module in the final output
        .pipe(wrap('var Handlebars = require("handlebars");\n <%= contents %>'))
        // WRite the output into the templates folder
        .pipe(gulp.dest('src/js/templates'));
});

gulp.task('browserify', function () {
    return browserify('./src/js/index.js')
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('app.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('./js'))
        .pipe(livereload());

});
gulp.task('watch', function () {
    livereload.listen();
    gulp.watch('./src/templates/**/*.hbs', ['templates']);
    gulp.watch('./src/js/templates/index.js', ['browserify']);
    gulp.watch('./src/**/*.js', ['browserify']);
});

gulp.task('default', ['templates', 'browserify', 'watch'], function () {

})