const fs = require('fs');
const fmt = require('util').format;
const EventEmitter = require('events').EventEmitter;
const moment = require('moment');
const FileStreamRotator = require('file-stream-rotator');

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
    writeFile: false
};

const Log = module.exports = function Log(options) {
    opitons = Object.assign({}, options, defaultOptions);
    if (!options.name) throw new Error('file name is missing');
    let level = options.level;
    if ('string' === typeof level) {
        level = levelObj[level.toUpperCase()].level;
    } else {
        level = '';
    }
    this.level = (typeof level === 'undefined' || level == null || level === '') ? levelObj.VERBOSE.level : level;
    this.output = options.output;
    this.stdoutTimeFormat = options.stdoutTimeFormat
    this.name = options.name
    this.subscribe = options.subscribe
    if (this.subscribe && typeof this.subscribe !== 'function') {
        throw new Error('subscribe must be a funtion')
    }
    if (options.writeFile) {
        if (!options.dir) throw new Error('file dir is missing');
        fs.existsSync(options.dir) || fs.mkdirSync(options.dir);
        if (options.stream) {
            this.stream = options.stream;
            if (this.stream.readable) this.read();
        } else {
            // create a rotating write stream
            this.stream = FileStreamRotator.getStream({
                filename: options.dir + '/' + '%DATE%-' + options.name + '.log',
                frequency: options.frequency || 'daily',
                verbose: options.verbose || false,
                date_format: options.dateFormat || 'YYYYMMDD',
                size: options.size,
                max_logs: options.max_logs,
                audit_file: options.audit_file
            });
        }
    }
};


/**
 * prototype.
 */
Log.prototype = {
    log: function(levelStr, args) {
        if (
            levelObj[levelStr] &&
            levelObj[levelStr].level <= this.level            
        ) {
            if (this.subscribe) {
                this.subscribe(levelStr, Array.from(args));
            }
            if (!this.output && !this.stream) return;
            let arr = [];
            for (let i = 0; i < args.length; i++) {
                if (typeof args[i] === 'string') {
                    arr.push(args[i]);
                } else {
                    try {
                        arr.push(JSON.stringify(args[i]));
                    } catch (e) {
                    }
                }
            }
            let msg = fmt.apply(null, arr);
            let date = moment().format(this.stdoutTimeFormat);
            if (this.output) {
                let color = levelObj[levelStr].color || 'white';
                let time = styles.gray.open + '[' + date + ']' + styles.gray.close,
                    name = styles.blue.open + '<' + this.name + '>' + styles.blue.close,
                    level = styles.magenta.open + levelStr + styles.magenta.close;
                    colorMsg = styles[color].open + msg + styles[color].close,
                console.log.apply(console, [time, name, level, colorMsg]);
            }
            if (this.stream) {
                this.stream.write(
                    '[' + date + ']'
                    + ' ' + levelStr
                    + ' ' + msg
                    + '\n'
                );
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
