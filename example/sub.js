const FileLog = require('../')


const logger = FileLog({
    level: 'verbose',
    output: true,
    writeFile: false,
    dir: './',
    name: 'test',
    subscribe: function(levelStr, msg) {
        console.log(levelStr, msg);
    }
})

logger.info('123123', {a: '1'});