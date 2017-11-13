'use strict'

module.exports = function (instance) {
  function theWorldIsBurning (err) {
    runInternalHandler()
    handlers.handledOnTerminate = true
    instance.onTerminated(this.name, err)
  }

  function hup (err) {
    if (process.listenerCount('SIGHUP') === 1) {
      return theWorldIsBurning.call({name: 'SIGHUP'}, err)
    }
    instance.flush()
  }

  function runInternalHandler () {
    if (handlers.handledOnTerminate) return
    instance.flushSync()
  }

  var handlers = {
    beforeExit: theWorldIsBurning.bind({name: 'beforeExit'}),
    exit: theWorldIsBurning.bind({name: 'exit'}),
    uncaughtException: theWorldIsBurning.bind({name: 'uncaughtException'}),
    SIGHUP: hup,
    SIGINT: theWorldIsBurning.bind({name: 'SIGINT'}),
    SIGQUIT: theWorldIsBurning.bind({name: 'SIGQUIT'}),
    SIGTERM: theWorldIsBurning.bind({name: 'SIGTERM'})
  }

  Object.keys(handlers).forEach(function (k) {
    process.on(k, handlers[k])
  })

  return handlers
}
