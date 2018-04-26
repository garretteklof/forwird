const gulp = require("gulp");
const sass = require("gulp-sass");
const minifyCss = require("gulp-minify-css");
const autoprefixer = require("gulp-autoprefixer");
const livereload = require("gulp-livereload");

gulp.task("sass", function() {
  gulp
    .src("./styles/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(minifyCss({ compatibility: "ie8" }))
    .pipe(gulp.dest("./public"))
    .pipe(livereload());
});

gulp.task("stream", function() {
  livereload.listen();
  gulp.watch("./styles/**/*.scss", ["sass"]);
});

gulp.task("default", ["sass"]);
