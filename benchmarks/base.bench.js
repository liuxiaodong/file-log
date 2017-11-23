'use strict'
const bench = require('fastbench')
const FileLog = require('../')
const fs = require('fs')
const dest = fs.createWriteStream('./pino.log')
const pino = require('pino')({
  // prettyPrint: true
  // extreme: true
}, dest)
const logger = FileLog({
    level: 'verbose',
    output: false,
    prettyPrint: false,
    writeFile: true,
    dir: './',
    name: 'name',
    extreme: false
    // stream: dest
})

const max = 10
const run = bench([
  function benchPino (cb) {
    for (var i = 0; i < max; i++) {
      pino.info('hello world')
    }
    setImmediate(cb)
  },
  function benchFileLog (cb) {
    for (let i = 0; i < max; i++) {
      logger.info('hello world')
    }
    setImmediate(cb)
  }
], 100000)

run(run)