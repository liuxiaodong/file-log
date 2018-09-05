'use strict'
/*!
 * filelogs
 * Copyright(c) 2015.9 Leaf
 * MIT Licensed
 */

const fs = require('fs');
const path = require('path');
const util = require('util')
const fmt = util.format;
const EventEmitter = require('events').EventEmitter;
const moment = require('moment');
const FileStreamRotator = require('./file-stream-rotator');
const format = require('quick-format-unescaped')
const events = require('./events')

const styles = {
    reset: {
        open: '\u001b[0m',
        close: '\u001b[0m'
    },
    bold: {
        open: '\u001b[1m',
        close: '\u001b[22m'
    },
    dim: {
        open: '\u001b[2m',
        close: '\u001b[22m'
    },
    italic: {
        open: '\u001b[3m',
        close: '\u001b[23m'
    },
    underline: {
        open: '\u001b[4m',
        close: '\u001b[24m'
    },
    inverse: {
        open: '\u001b[7m',
        close: '\u001b[27m'
    },
    hidden: {
        open: '\u001b[8m',
        close: '\u001b[28m'
    },
    strikethrough: {
        open: '\u001b[9m',
        close: '\u001b[29m'
    },
    black: {
        open: '\u001b[30m',
        close: '\u001b[39m'
    },
    red: {
        open: '\u001b[31m',
        close: '\u001b[39m'
    },
    green: {
        open: '\u001b[32m',
        close: '\u001b[39m'
    },
    yellow: {
        open: '\u001b[33m',
        close: '\u001b[39m'
    },
    blue: {
        open: '\u001b[34m',
        close: '\u001b[39m'
    },
    magenta: {
        open: '\u001b[35m',
        close: '\u001b[39m'
    },
    cyan: {
        open: '\u001b[36m',
        close: '\u001b[39m'
    },
    white: {
        open: '\u001b[37m',
        close: '\u001b[39m'
    },
    gray: {
        open: '\u001b[90m',
        close: '\u001b[39m'
    },
    grey: {
        open: '\u001b[90m',
        close: '\u001b[39m'
    }
}

const levelObj = {
    VERBOSE: {
        level: 4,
        string: 'VERBOSE',
        color: 'gray'
    },
    DEBUG: {
        level: 3,
        string: 'DEBUG',
        color: 'green'
    },
    INFO: {
        level: 2,
        string: 'INFO',
        color: 'cyan'
    },
    WARNING: {
        level: 1,
        string: 'WARNING',
        color: 'yellow'
    },
    ERROR: {
        level: 0,
        string: 'ERROR',
        color: 'red'
    }
};


const defaultOptions = {
    name: '',
    dir: '',
    level: 'verbose',
    output: true,
    prettyPrint: false,
    format: fmt,
    writeFile: false,
    customWrite: false, // 写文件完全自定义，为 true 的话只输出用户输出的消息，不添加 time level 等字段 
    extreme: false
};

const Log = module.exports = function Log(opts) {
    let options = Object.assign({}, defaultOptions, opts);
    if (!options.name) throw new Error('file name is missing');
    let level = options.level;
    if (level && 'string' === typeof level) {
        level = levelObj[level.toUpperCase()] && levelObj[level.toUpperCase()].level;
    } else {
        level = '';
    }
    if (options.extreme) {
        this.cache = { size: 4096, buf: '' };
    }
    if (this.cache && options.cacheSize) {
        this.cache.size = options.cacheSize
    }

    this.level = (typeof level === 'undefined' || level == null || level === '') ? levelObj.VERBOSE.level : level;
    this.output = options.output;
    this.name = options.name
    this.subscribe = options.subscribe
    this.prettyPrint = options.prettyPrint
    this.format = options.format
    this.onTerminated = options.onTerminated
    this.customWrite = options.customWrite
    this.timeFormat = function(time) { return time; };
    if (this.subscribe && typeof this.subscribe !== 'function') {
        throw new Error('subscribe must be a function')
    }
    if (opts && opts.timeFormat && typeof opts.timeFormat !== 'function') {
        throw new Error('timeFormat must be a function')
    }
    if (opts && opts.timeFormat) {
        this.timeFormat = options.timeFormat;
        this.timeFormatCustom = true;
    }
    if (options.stream) {
        this.stream = options.stream;
        if (typeof this.stream.write !== 'function') {
            throw new Error('stream must have a write function');
        }
        // if (this.stream.readable) this.read();
    }
    if (!this.stream && options.writeFile) {
        if (!options.dir) throw new Error('file dir is missing');
        fs.existsSync(options.dir) || fs.mkdirSync(options.dir);
        // create a rotating write stream
        this.stream = FileStreamRotator.getStream({
            filename: path.join(options.dir, `%DATE%-${options.name}.log`),
            frequency: options.frequency || 'daily',
            verbose: options.verbose || false,
            date_format: options.dateFormat || 'YYYYMMDD',
            size: options.size,
            max_logs: options.max_logs,
            audit_file: options.audit_file
        });
    }

    if (this.stream) {
        this.flushSync = function () {
            if (!this.cache || !this.cache.size || !this.cache.buf) return;
            // 自定义 stream
            if (!this.stream.sourceStream) {
                if (this.stream.writeSync && typeof this.stream.writeSync === 'function') {
                    this.stream.writeSync(this.cache.buf)
                    this.cache.buf = ''                    
                } else  {
                    this.stream.write(this.cache.buf)
                    this.cache.buf = ''                
                }
            } else {
                let fd = this.stream.sourceStream && (this.stream.sourceStream.fd || (this.stream.sourceStream._handle && this.stream.sourceStream._handle.fd));
                let filename = this.stream.sourceStream.path;
                if (!fd && !filename) return;
                if (fd) {
                    fs.writeSync(fd, this.cache.buf) 
                } else {
                    fs.appendFileSync(filename, this.cache.buf)                 
                }
                this.cache.buf = ''
            }
        }.bind(this);

        events(this)
    }
};


/**
 * prototype.
 */
Log.prototype = {
    log: function(levelStr, args) {
        if (levelObj[levelStr] && levelObj[levelStr].level <= this.level) {
            if (this.subscribe) {
                this.subscribe(levelStr, Array.from(args));
            }
            if (!this.output && !this.stream) return;
            let msg;
            try {
                msg = this.format.apply(null, args);
            } catch (e) {
                console.error(e);
                msg = fmt.apply(null, args);
            }
            let date = this.timeFormat(Date.now())
            // 输出到终端
            if (this.output) {
                if (this.customWrite) {
                    process.stdout.write(msg + '\n')
                } else {
                    let _date = '[' + date + ']',
                        _name = '<' + this.name + '>',
                        _levelStr = levelStr,
                        _msg = msg;
                    if (this.prettyPrint) {
                        if (!this.timeFormatCustom) {
                            _date = '[' + (new Date(date)).toISOString() + ']'
                        }
                        let color = levelObj[levelStr].color || 'white';
                        _date = styles.gray.open + _date + styles.gray.close;
                        _name = styles.blue.open + _name + styles.blue.close;
                        _levelStr = styles.magenta.open + _levelStr + styles.magenta.close;
                        _msg = styles[color].open + _msg + styles[color].close;
                    }
                    process.stdout.write(format([_date, _name, _levelStr, _msg], this.formatOpts) + '\n')
                }
            }
            if (!this.stream) return;
            
            // 输出到流
            let fileStr;
            if (this.customWrite) {
                fileStr = msg + '\n'
            } else {
                fileStr = '[' + date + ']' + ' ' + levelStr + ' ' + msg + '\n'
            }

            if (this.cache && this.cache.size) {
                this.cache.buf += fileStr;
                if (this.cache.buf.length > this.cache.size) {
                    this.stream.write(this.cache.buf)
                    this.cache.buf = ''
                }
            } else {
                this.stream.write(fileStr);
            }
        }
    },
    error: function() {
        this.log('ERROR', arguments);
    },
    warning: function() {
        this.log('WARNING', arguments);
    },
    warn: function() {
        this.log('WARNING', arguments);
    },    
    info: function() {
        this.log('INFO', arguments);
    },
    debug: function() {
        this.log('DEBUG', arguments);
    },
    verbose: function() {
        this.log('VERBOSE', arguments);
    }
};

/**
 * Inherit from `EventEmitter`.
 */
Log.prototype.__proto__ = EventEmitter.prototype;
