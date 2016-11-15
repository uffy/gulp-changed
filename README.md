#gulp-changed
Only pass through changed files

替换 gulp.dest 函数，当文件未更新时，不再覆盖编译写入新文件。

支持 Laravel-elixir#6.0.*


# 使用方法

require("gulp-changed"); // 在使用 gulp 之前引入即可

gulp.task...
