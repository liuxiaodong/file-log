// overwire https://www.npmjs.com/package/log
var fmt = require('util').format;
var EventEmitter = require('events').EventEmitter;
var moment = require('moment');

var styles = { 
  reset: { open: '\u001b[0m', close: '\u001b[0m'},
  bold: { open: '\u001b[1m', close: '\u001b[22m' },
  dim: { open: '\u001b[2m', close: '\u001b[22m'},
  italic: { open: '\u001b[3m', close: '\u001b[23m'},
  underline: { open: '\u001b[4m', close: '\u001b[24m' },
  inverse: { open: '\u001b[7m', close: '\u001b[27m'},
  hidden: { open: '\u001b[8m', close: '\u001b[28m'},
  strikethrough: { open: '\u001b[9m', close: '\u001b[29m'},
  black: { open: '\u001b[30m', close: '\u001b[39m'},
  red: { open: '\u001b[31m', close: '\u001b[39m'},
  green: { open: '\u001b[32m', close: '\u001b[39m'},
  yellow: { open: '\u001b[33m', close: '\u001b[39m'},
  blue: { open: '\u001b[34m', close: '\u001b[39m'},
  magenta: { open: '\u001b[35m', close: '\u001b[39m'},
  cyan: { open: '\u001b[36m', close: '\u001b[39m'},
  white: { open: '\u001b[37m', close: '\u001b[39m'},
  gray: { open: '\u001b[90m', close: '\u001b[39m'},
  grey: { open: '\u001b[90m', close: '\u001b[39m'}
}

var levelObj = {
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

var Log = exports = module.exports = function Log(options){
  var level = options.level;
  if ('string' === typeof level) {
    level = levelObj[level.toUpperCase()].level;
  }
  this.level = (typeof level === 'undefined' || level == null || level === '') ? levelObj.VERBOSE.level : level;
  this.output = options.output;
  this.name = options.name;
  this.dateFormat = options.dateFormat;
  if(options.stream) {
    this.stream = options.stream;
    if (this.stream.readable) this.read();
  }
};


/**
 * prototype.
 */
Log.prototype = {
  log: function(levelStr, args) {
    if (levelObj[levelStr].level <= this.level) {
      var arr = [];
      for(var i=0; i<args.length; i++){
        if(typeof args[i] === 'string'){
          arr.push(args[i]);
        }else {
          arr.push(JSON.stringify(args[i]));
        }
      }
      var msg = fmt.apply(null, arr);
      var date = moment().format(this.dateFormat);
      if(this.output) {
        var color = levelObj[levelStr].color || 'white';
        var time = styles.gray.open + '[' + date + ']' + styles.gray.close,
            name = styles.blue.open + '<' + this.name + '>' + styles.blue.close,
            level = styles.magenta.open + levelStr + styles.magenta.close,
            color = styles[color].open + msg + styles[color].close;
        console.log.apply(console, [time, name, level, color]);
      }
      if(this.stream) {
        this.stream.write(
            '[' + date + ']'
          + ' ' + levelStr
          + ' ' + msg
          + '\n'
        );
      }
    }
  },
  error: function(msg){
    this.log('ERROR', arguments);
  },
  warning: function(msg){
    this.log('WARNING', arguments);
  },
  info: function(msg){
    this.log('INFO', arguments);
  },
  debug: function(msg){
    this.log('DEBUG', arguments);
  },
  verbose: function(msg) {
    this.log('VERBOSE', arguments);
  }
};

Log.prototype.warn = Log.prototype.warning;

/**
 * Inherit from `EventEmitter`.
 */
Log.prototype.__proto__ = EventEmitter.prototype;
