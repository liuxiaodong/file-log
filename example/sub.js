const FileLog = require('../')


const logger = FileLog({
    level: 'verbose',
    output: true,
    writeFile: false,
    dir: './',
    name: 'test',
    subscribe: function(msg) {
        console.log(msg);
    }
})

logger.info('123123', {a: '1'});