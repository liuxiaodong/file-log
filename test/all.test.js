'use strict'
/*!
 * Copyright(c) 2015.9 Leaf
 * MIT Licensed
 */
const Logger = require('../')
const sinon = require('sinon')
const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf')
const moment = require('moment')
const should = require('should')

const LETTER_NUMBER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const genStr = (len, str) => {
    if (!str) str = ''
    str += LETTER_NUMBER.slice(0, len - str.length);
    if (str.length >= len) return str;
    return genStr(len, str);
}

describe('Filelogs', () => {

    context('options.output = false', () => {
        it('no log', () => {
            let fake = sinon.fake();
            sinon.stub(process.stdout, 'write').callsFake(fake)
            const logger = new Logger({
                name: 'test',
                level: 'VERBOSE',
                output: false,
            })
            logger.warning('warning')
            process.stdout.write.restore()
            fake.callCount.should.equal(0)
        })
    })
    context('options.name === ""', () => {
        it('throw Error', (done) => {
            (function () {
                new Logger({
                    name: ''
                })
            }).should.throw('file name is missing')
            return done()
        })
    })

    context('options.level === "INFO" ', () => {
        it('conversion level=2', () => {
            const logger = new Logger({
                name: 'test',
                level: 'INFO'
            })
            logger.level.should.equal(2)
        })
    })

    context('options.level === "" ', () => {
        it('default level', () => {
            const logger = new Logger({
                name: 'test',
                level: ''
            })
            logger.level.should.equal(4)
        })
    })

    context('writeFile dir is null', () => {
        it('logger.debug not work', (done) => {
            (function () {
                new Logger({
                    name: 'test',
                    level: 'INFO',
                    prettyPrint: true,
                    writeFile: true
                })
            }).should.throw('file dir is missing')
            return done()
        })
    })

    context('writeFile and options.level === "INFO"', () => {
        it('logger.debug not work', (done) => {
            let fake = sinon.fake()
            sinon.stub(process, 'once').callsFake(fake);            
            let _dir = path.join(__dirname, './logs');
            rimraf.sync(_dir);
            const logger = new Logger({
                name: 'test',
                level: 'INFO',
                prettyPrint: true,
                writeFile: true,
                dir: _dir
            })
            logger.debug('debug')
            logger.info('info')
            fake.callCount.should.equal(4)
            process.once.restore()
            // 输出到标准输出是一个异步操作，所以延迟比较
            setTimeout(function () {
                let text = fs.readFileSync(path.join(_dir, `${moment().format('YYYYMMDD')}-test.log`), {encoding: 'utf8'})
                let textArr = text.trim().split('\n')
                textArr.length.should.equal(1)
                textArr[0].split(' ')[1].should.equal('INFO')
                done()
            }, 10)
        })
    })

    context('custom stream have not write function', () => {
        let stream = {}
        it('throw Error', (done) => {
             (function () {
                new Logger({
                    name: 'test',
                    level: 'INFO',
                    prettyPrint: true,
                    stream: stream
                })
            }).should.throw('stream must have a write function')
            return done()
        })
    })

    context('custom stream', () => {
        let fake = sinon.fake();
        it('stream.write should be invoke', () => {
            const logger = new Logger({
                name: 'test',
                level: 'INFO',
                prettyPrint: true,
                stream: {write: fake}
            })
            logger.info('debug')
            fake.callCount.should.equal(1)
        })
    })

    context('custom stream and options.extreme = true', () => {
        it('stream.write should be invoke', () => {
            let fake = sinon.fake();
            const logger = new Logger({
                name: 'test',
                level: 'INFO',
                prettyPrint: true,
                stream: { write: fake },
                extreme: true,
                cacheSize: 50
            })
            logger.info(genStr(50 - 23))
            fake.callCount.should.equal(0)
            logger.info(genStr('12'))
            fake.callCount.should.equal(1)
        })
    })     

    context('custom stream and stream.writeSync', () => {
        it('stream.write should be invoke', () => {
            let fake1 = sinon.fake();
            let fake2 = sinon.fake();
            const logger = new Logger({
                name: 'test',
                level: 'INFO',
                prettyPrint: true,
                stream: {write: fake1, writeSync: fake2},
                extreme: true,
                cacheSize: 50
            })
            logger.info(genStr(50 - 23))
            fake1.callCount.should.equal(0)
            fake2.callCount.should.equal(0)
            logger.flushSync();
            fake1.callCount.should.equal(0)
            fake2.callCount.should.equal(1)
        })
    })    

    context('custom stream no stream.writeSync use logger.flushSync', () => {
        it('stream.write should be invoke', () => {
            let fake = sinon.fake();
            const logger = new Logger({
                name: 'test',
                level: 'INFO',
                prettyPrint: true,
                stream: { write: fake },
                extreme: true,
                cacheSize: 50
            })
            logger.info(genStr(50 - 23))
            fake.callCount.should.equal(0)
            logger.flushSync();
            fake.callCount.should.equal(1)
        })
    }) 

    context('options.extreme === true', () => {
        it('cache log', (done) => {
            let _dir = path.join(__dirname, './logs');
            rimraf.sync(_dir);
            const logger = new Logger({
                name: 'test',
                level: 'DEBUG',
                prettyPrint: true,
                writeFile: true,
                extreme: true,
                dir: _dir
            })
            logger.debug('debug')
            logger.info('info')
            // 输出到标准输出是一个异步操作，所以延迟比较
            setTimeout(function () {
                let text = fs.readFileSync(path.join(_dir, `${moment().format('YYYYMMDD')}-test.log`), {encoding: 'utf8'}).trim()
                should(text).is.not.ok()
                logger.flushSync()
                text = fs.readFileSync(path.join(_dir, `${moment().format('YYYYMMDD')}-test.log`), {encoding: 'utf8'}).trim()
                let textArr = text.split('\n')
                textArr.length.should.equal(2)
                textArr[0].split(' ')[1].should.equal('DEBUG')
                textArr[1].split(' ')[1].should.equal('INFO')
                done()
            }, 10)
        })
    })

    context('options.extreme === true and cacheSize=1024', () => {
        it('cache log 1024 byte', (done) => {
            let _dir = path.join(__dirname, './logs');
            rimraf.sync(_dir);
            const logger = new Logger({
                name: 'test',
                level: 'DEBUG',
                prettyPrint: true,
                writeFile: true,
                extreme: true,
                cacheSize: 1024,
                dir: _dir
            })
            logger.debug(genStr(1013 - 21))
            // 输出到标准输出是一个异步操作，所以延迟比较
            setTimeout(function () {
                let text = fs.readFileSync(path.join(_dir, `${moment().format('YYYYMMDD')}-test.log`), {encoding: 'utf8'}).trim()
                should(text).is.not.ok()
                logger.info(genStr(1))
                setTimeout(function () {
                    let text1 = fs.readFileSync(path.join(_dir, `${moment().format('YYYYMMDD')}-test.log`), {encoding: 'utf8'}).trim()                    
                    should(text1).is.ok()
                    done()
                }, 10)
            }, 10)
        })
    })

    context('options.subscribe is not a function ', () => {
        it('throw Error', () => {
            (function () {
                new Logger({
                    name: 'test',
                    level: 'INFO',
                    subscribe: '123'
                })
            }).should.throw('subscribe must be a function')
        })
    })

    context('options.subscribe ', () => {
        it('throw Error', () => {
            let fake = sinon.fake();
            let logger = new Logger({
                name: 'test',
                level: 'INFO',
                subscribe: fake
            })
            logger.info('1')
            logger.warn('2');
            logger.error('3');
            fake.callCount.should.equal(3)
        })
    })    

    context('options.timeFormat is not a function ', () => {
        it('throw Error', () => {
            (function () {
                new Logger({
                    name: 'test',
                    level: 'INFO',
                    timeFormat: '123'
                })
            }).should.throw('timeFormat must be a function')
        })
    })

    context('use options.timeFormat', () => {
        it('got a pretty time', () => {
            let _dir = path.join(__dirname, './logs');
            rimraf.sync(_dir);            
            const logger = new Logger({
                name: 'test',
                level: 'INFO',
                writeFile: true,
                dir: _dir,
                timeFormat: (time) => {
                    return moment(time).format('YYYY-MM-DD HH:mm:ss')
                }
            })

            logger.info('info')
            // 输出到标准输出是一个异步操作，所以延迟比较
            setTimeout(function () {
                logger.flushSync()
                let text = fs.readFileSync(path.join(_dir, `${moment().format('YYYYMMDD')}-test.log`), {encoding: 'utf8'}).trim()
                let textArr = text.split('\n')
                textArr[0].indexOf(`[${moment().format('YYYY-MM-DD')}]`).should.equal(0)
                done()
            }, 10)
        })
    })

    context('options.prettyPrint = true', () => {
        it('no time', () => {   
            let a = 0;
            sinon.stub(process.stdout, 'write').callsFake(msg => {
                a++
                msg.indexOf(`[${moment().format('YYYY-MM-DD')}]`).should.equal(-1)
            })
            const logger = new Logger({
                name: 'test',
                level: 'VERBOSE',
                prettyPrint: true
            })
            logger.warning('warning')
            process.stdout.write.restore()
            a.should.equal(1);
        })
    })

    context('options.prettyPrint = true && timeFormat', () => {
        it('no time', () => {
            let a = 0;
            sinon.stub(process.stdout, 'write').callsFake(msg => {
                a++
                msg.indexOf(`${moment().format('YYYY-MM-DD')}`).should.be.above(1)
            })
            const logger = new Logger({
                name: 'test',
                level: 'VERBOSE',
                prettyPrint: true,
                timeFormat: (time) => {
                    return moment(time).format('YYYY-MM-DD HH:mm:ss')
                }
            })
            logger.warning('warning')
            process.stdout.write.restore()
            a.should.equal(1);
        })
    })    

    context('options.customWrite = true and options.timeFormat', () => {
        it('no time', () => {
            let a = 0;
            sinon.stub(process.stdout, 'write').callsFake(msg => {
                a++
                msg.indexOf(`${moment().format('YYYY-MM-DD')}`).should.equal(-1)
            })            
            const logger = new Logger({
                name: 'test',
                level: 'VERBOSE',
                customWrite: true,
                timeFormat: (time) => {
                    return moment(time).format('YYYY-MM-DD HH:mm:ss')
                }
            })
            logger.warning('warning')
            process.stdout.write.restore()
            a.should.equal(1);
        })
    })  

    context('use options.timeFormat and options.customWrite = true', () => {
        it('no time', () => {
            let _dir = path.join(__dirname, './logs');
            rimraf.sync(_dir);            
            const logger = new Logger({
                name: 'test',
                level: 'VERBOSE',
                output: false,
                writeFile: true,
                dir: _dir,
                customWrite: true,
                timeFormat: (time) => {
                    return moment(time).format('YYYY-MM-DD HH:mm:ss')
                }
            })

            logger.verbose('verbose')
            // 输出到标准输出是一个异步操作，所以延迟比较
            setTimeout(function () {
                logger.flushSync()
                let text = fs.readFileSync(path.join(_dir, `${moment().format('YYYYMMDD')}-test.log`), {encoding: 'utf8'}).trim()
                let textArr = text.split('\n')
                textArr[0].indexOf(`[${moment().format('YYYY-MM-DD')}]`).should.equal(-1)
                done()
            }, 10)
        })
    })     
});

describe('events', () => {
    context('process.once', () => {
        it('not writeFile', (done) => {
            let fake = sinon.fake()
            sinon.stub(process, 'once').callsFake(fake);
            const logger = new Logger({
                name: 'test',
                level: 'INFO'
            })
            process.once.restore()
            fake.callCount.should.equal(0)
            return done()
        })

        it('writeFile = true', (done) => {
            let fake = sinon.fake()
            sinon.stub(process, 'once').callsFake(fake);
            let _dir = path.join(__dirname, './logs');
            rimraf.sync(_dir);            
            const logger = new Logger({
                name: 'test',
                level: 'INFO',
                writeFile: true,
                dir: _dir
            })
            process.once.restore()
            fake.callCount.should.equal(0)
            return done()
        })     

        it('with stream', (done) => {
            let fake = sinon.fake()
            sinon.stub(process, 'once').callsFake(fake);
            const logger = new Logger({
                name: 'test',
                level: 'INFO',
                stream: {write: () => {}}
            })
            process.once.restore()
            fake.callCount.should.equal(0)
            return done()
        })            
    })
})