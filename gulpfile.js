var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function() {
  gulp.src('source/scss/*.scss')
  .pipe(sass())
  .pipe(gulp.dest('public/css'));
})

gulp.task('watch', function() {
  gulp.watch('source/scss/*.scss', ['sass']);
});

gulp.task('default', ['sass', 'watch']);