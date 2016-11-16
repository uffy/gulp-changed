#gulp-changed
Only pass through changed files

替换 gulp.dest 函数，当文件未更新时，不再覆盖编译写入新文件。

支持 Laravel-elixir#6.0.*


# 使用方法


```
require("gulp-changed").global(); // 注册全局事件

gulp.task...
```


```
var gulpDest = require("gulp-changed");

gulp.src(...)
    .pipe(一些操作...)
    .pipe(gulpDest(outFolder, opt));
    

```
