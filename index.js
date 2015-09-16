var fs = require('fs');
var FileStreamRotator = require('file-stream-rotator');
var Log = require('./lib/log');

var logLevelList = ['verbose', 'debug', 'info', 'warning', 'error'];

// 默认配置
var defaultOptions = {
  name: '',
  dir: '',
  level: 'verbose',
  output: false
};

/**
  * require('./log')(opts)
  * 
  * @param {String} name 文件名称，默认 base-service
  *
  * @return {Function} log
  */
module.exports = function(options){
  if(!options) options = {};
  if(!options.name) {
    throw Error('name is required');
  }

  options.level = options.level || defaultOptions.level;
  options.output = options.output || defaultOptions.output;

  if(logLevelList.indexOf(options.level) === -1) {
    console.warn('options.level invalid');
    options.level = 'verbose';
  }

  if(options.dir) {
    // ensure log directory exists
    fs.existsSync(options.dir) || fs.mkdirSync(options.dir);

    // create a rotating write stream
    options.stream = FileStreamRotator.getStream({
      filename: options.dir + '/' +'%DATE%-' + options.name + '.log',
      frequency: 'daily',
      verbose: false,
      date_format: 'YYYYMMDD'
    });
  }

  var log = new Log(options);

  return log;
};