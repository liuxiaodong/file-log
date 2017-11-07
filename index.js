const Log = require('./lib/log');

/**
  * require('./log')(opts)
  * 
  * @param {String} name 
  *
  * @return {Function} log
  */
module.exports = function(options) {
    return new Log(options);
};