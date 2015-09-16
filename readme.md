# log 日志存储，并写入文件

### 用法

```
	snpm install @sensoro/file-log

	var flog = requier('@sensoro/file-log');

	var options = {
		name: 'name', // 存储的文件的名称，必填
		dir: '/home/test/logs', // 存储文件的的路径，若日志需要写文件，则必填
		level: 'debug', // 日志输出级别,  ['verbose', 'debug', 'info', 'warning', 'error']
		output: false // 输出是否输到出终端
	}

	var log = flog(options);

	log.debug('test');

	输出内容:

	[2015-09-16T14:36:16+08:00] <name> DEBUG test
```

