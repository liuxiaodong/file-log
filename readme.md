# file-log

* write log by date

### usage

```
	npm install filelogs --save

	const options = {
		name: 'name', // filename
		level: 'debug', //  ['verbose', 'debug', 'info', 'warning', 'error']
		output: true // defalut true
		writeFile: false // default false
		dir: '/home/test/logs', // log file directory, if writeFile is true
	}

	const logger = requier('filelogs')(options);

	logger.verbose('verbose');
	logger.debug('debug');
	logger.info('info');
	logger.warning('warning');
	logger.error('error');

```

`output:`

<img src="./docs/output.jpeg" />

