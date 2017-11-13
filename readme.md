# file-log

* write log by date

### usage

```
	npm install filelogs --save

	const options = {
		name: 'name', // filename
		level: 'debug', //  ['verbose', 'debug', 'info', 'warning', 'error']
		output: true // defalut true
		prettyPrint: false, // default false
		writeFile: false // default false
		dir: '/home/test/logs', // log file directory, if writeFile is true
		extreme: false, // 默认 false, 如果为 true 在写文件时会缓存一定数据定时落盘 
		cacheSize: 4096, // 配合 extreme 使用，设置缓存大小，默认 4096
		timeFormat: function(time) { return time; } // 格式化时间，默认返回时间戳，prettyPrint 为 true 是返回 ISO date
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

