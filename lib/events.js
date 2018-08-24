'use strict'
/*!
 * eventHandle
 * Copyright(c) 2015.9 Leaf
 * MIT Licensed
 */

const util = require('util');
const signals = ['exit', 'SIGINT', 'SIGQUIT', 'SIGTERM']
const handlers = [];
let listened = false;
let onTerminated;
const defaultTerminated = function (signal, err) {
  signal = signal.toUpperCase();
  if (err && signal !== 'EXIT') {
    console.error(util.inspect(err))
  }
  if (signal !== 'EXIT') {
    process.kill(process.pid, signal)
  }
}
const listen = function () {
  if (listened) return;
  listened = true;

  const handle = function (err) {
    const signal = this.signal;
    onTerminated = onTerminated || defaultTerminated;
    if (!handlers.length) {
      onTerminated(signal, err);
    } else {
      handlers.forEach(function (fn) {
        fn.flushSync.apply(fn)
      })
      onTerminated(signal, err)
    }
  }

  signals.forEach(function (signal) {
    process.once(signal, handle.bind({signal: signal}))    
  })
}

module.exports = function (instance) {
  onTerminated = onTerminated || (instance.onTerminated && instance.onTerminated.bind(instance));
  handlers.push(instance);
  listen()
  return handlers
}