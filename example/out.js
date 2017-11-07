const FileLog = require('../')


const logger = FileLog({
    level: 'verbose',
    output: true,
    writeFile: true,
    dir: './',
    name: 'name'
})

logger.verbose('verbose');
logger.debug('debug');
logger.info('info');
logger.warning('warning');
logger.error('error');


