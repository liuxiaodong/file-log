'use strict'
const util = require('util');


const signals = ['exit', 'uncaughtException', 'SIGINT', 'SIGQUIT', 'SIGTERM']
const handlers = [];
let listened = false;
let onTerminated;

const listen = function () {
  if (listened) return;
  listened = true;

  let handleFn = function (signal) {
    process.on(signal, function(err) {
      onTerminated = onTerminated || function (signal, err) {
        if (err) {
          console.error(util.inspect(err))
        }
        process.exit(0)
      }
      if (!handlers.length) {
        onTerminated(signal, err);
      } else {
        handlers.forEach(function (fn) {
          fn.flushSync.apply(fn)
        })
        onTerminated(signal, err)
      }
    })
  }

  signals.forEach(handleFn)  
}


module.exports = function (instance) {
  onTerminated = onTerminated || instance.onTerminated.bind();
  handlers.push(instance);
  listen()
  return handlers
}