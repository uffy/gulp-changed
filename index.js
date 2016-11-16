/**
 * Created by uffy on 2016/11/15.
 */

var gulp = require("gulp");
var defaults = require('defaults');
var path = require('path');
var through2 = require('through2');
var mkdirp = require('mkdirp');
var fs = require('graceful-fs');

var writeContents = require('../vinyl-fs/lib/dest/writeContents');

function dest(outFolder, opt) {
    opt = opt || {};
    if (typeof outFolder !== 'string' && typeof outFolder !== 'function') {
        throw new Error('Invalid output folder');
    }

    var options = defaults(opt, {
        cwd: process.cwd()
    });

    if (typeof options.mode === 'string') {
        options.mode = parseInt(options.mode, 8);
    }

    //noinspection JSUnresolvedFunction
    var cwd = path.resolve(options.cwd);

    //noinspection SpellCheckingInspection
    function saveFile (file, enc, cb) {
        var basePath;
        if (typeof outFolder === 'string') {
            //noinspection JSUnresolvedFunction
            basePath = path.resolve(cwd, outFolder);
        }
        if (typeof outFolder === 'function') {
            //noinspection JSUnresolvedFunction
            basePath = path.resolve(cwd, outFolder(file));
        }
        //noinspection JSUnresolvedFunction
        var writePath = path.resolve(basePath, file.relative);
        var writeFolder = path.dirname(writePath);

        // wire up new properties
        file.stat = file.stat ? file.stat : new fs.Stats();
        file.stat.mode = (options.mode || file.stat.mode);
        file.cwd = cwd;
        file.base = basePath;
        file.path = writePath;

        // mkdirp the folder the file is going in
        mkdirp(writeFolder, function(err){
            if (err) {
                return cb(err);
            }
            // 获取上次编译的文件状态
            fs.stat(writePath, function (err, targetStat) {
                // 当本次要编译的文件修改时间 较上次更新、或上次编译的文件不存在时，写入编译文件。
                if(
                    (!err && file.stat.mtime > targetStat.mtime)        // 有新修改
                    || (err && err.code == "ENOENT")                    // 新文件
                    || file.stat.mtime.toString() == "Invalid Date"     // 无法获取文件更新时间(rev-manifest.json)
                ){
                    writeContents(writePath, file, cb);
                }else{
                    return cb(null, file);
                }
            });
        });
    }

    var stream = through2.obj(saveFile);
    // TODO: option for either backpressure or lossy
    stream.resume();
    return stream;
}

dest.global = function () {
    gulp.dest = dest;
    return gulp;
};

module.exports = dest;
