const FileLog = require('../')


const logger = FileLog({
    level: 'verbose',
    output: true,
    writeFile: true,
    dir: './',
    name: 'name',
    customWrite: true 
})

logger.verbose({a: 1, b: {c: 1, g: [12, 3]}, d: [123],f: null, e: undefined});
logger.debug('debug');
logger.info('info');
logger.warning('warning');
logger.error('error');


