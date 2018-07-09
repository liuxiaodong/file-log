const FileLog = require('../')
const fmt = require('util').format;
const REG = /%s|%d|%i|%f|%j|%o|%O|%%/ig

const logger = FileLog({
    level: 'verbose',
    output: true,
    writeFile: true,
    dir: './',
    name: 'name',
    // customWrite: true,
    prettyPrint: true,
    format: function () {
        let args = Array.prototype.splice.call(arguments, 0);
        let firstArg = args[0];
        let matchd, argLen;
        if (typeof firstArg === 'string') {
            matchd = firstArg.match(REG)
            argLen = args.length - 1;
            args.shift()
        } else {
            firstArg = '';
            argLen = args.length
        }
        let fillIndex = 0;
        if (matchd && matchd.length) {
            fillIndex = matchd.length;
        }
        args.forEach((item, i) => {
            if (i >= fillIndex) {
                let type = Object.prototype.toString.call(args[i]);
                type = type.replace('[object', '').replace(']', '').trim()
                switch (type) {
                    case 'Number':
                        firstArg += ' %d';
                        break;
                    case 'String':
                        firstArg += ' %s';
                        break;
                    case 'Error':
                        firstArg += ' %s';
                        break;
                    default:
                        firstArg += ' %j';
                        break;
                }
            }
        })
        args.unshift(firstArg);
        return fmt.apply(null, args)
    }
})
let obj =  {a: 1, b: {c: 1, g: [12, 3]}, d: [123],f: null, e: undefined}
obj.obj = obj;
try {
    console.log(n)
} catch (e) {
    logger.verbose('==', obj, e, '123', {a: 1, b: {c:1, g: [1,2,3]}}, [11,2,3,], e);
}

// util.format.call(null, 'adsf %s', new Error('123'))

logger.debug('debug');
logger.info('info');
logger.warning('warning');
logger.error('error');


