/**
 * Created by uffy on 2016/11/15.
 */

var gulp = require("gulp");
var defaults = require('defaults');
var path = require('path');
var through2 = require('through2');
var mkdirp = require('mkdirp');
var fs = require('graceful-fs');
var crypto = require("crypto");

var writeContents = require(path.normalize(require.resolve("vinyl-fs").replace('index.js', '') + "/lib/dest/writeContents"));

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

            fs.readFile(writePath, function (err, data) {
                if( !err ){
                    var writeFileHash = crypto.createHash('sha1').update(data).digest('hex');
                    var oldFileHash = crypto.createHash('sha1').update(file.contents).digest('hex');

                    // 对比 现在生成文件的 hash，对比之前的hash，如果一致就跳过写入文件。
                    if( writeFileHash == oldFileHash ){
                        return cb(null, file);
                    }
                }
                writeContents(writePath, file, cb);
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

