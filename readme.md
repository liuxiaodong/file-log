# file-log

* write log by date

### usage

```
	npm install filelogs --save

	var options = {
		name: 'name', // filename
		dir: '/home/test/logs', // log file directory
		level: 'debug', //  ['verbose', 'debug', 'info', 'warning', 'error']
		output: false // true or false
	}

	var log = requier('filelogs')(options);

	log.debug('test');

	output:

	[2015-09-16T14:36:16+08:00] <name> DEBUG test
```

