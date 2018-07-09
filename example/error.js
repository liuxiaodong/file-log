const FileLog = require('../')
const util = require('util')


const logger1 = FileLog({
    level: 'verbose',
    output: true,
    writeFile: true,
    dir: './',
    name: 'name1',
    extreme: true,
    prettyPrint: true,
    onTerminated: function (eventName, err) {
        if (err) {
            console.error(util.inspect(err))
        }
        process.exit(0)
    }    
})

logger1.verbose('verbose');
logger1.debug('debug');
logger1.info('info');
logger1.warning('warning');
logger1.error('error');


// const logger2 = FileLog({
//     level: 'verbose',
//     output: true,
//     writeFile: true,
//     dir: './',
//     name: 'name2',
//     extreme: true,
//     prettyPrint: true
// })

// logger2.verbose('verbose');
// logger2.debug('debug');
// logger2.info('info');
// logger2.warning('warning');
// logger2.error('error');


// const logger3 = FileLog({
//     level: 'verbose',
//     output: true,
//     writeFile: true,
//     dir: './logs',
//     name: 'name3',
//     extreme: true,
//     prettyPrint: true
// })

// logger3.verbose('verbose');
// logger3.debug('debug');
// logger3.info('info');
// logger3.warning('warning');
// logger3.error('error');

console.log(a)
