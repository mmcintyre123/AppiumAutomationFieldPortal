'use strict';

require('colors');
require('./setup');
let repl         = require('repl');
let _            = require('underscore');
let wd           = require('wd');
let fs           = require('fs');
let fsExtra      = require('fs-extra');
let assert       = require('assert');
let pry          = require('pryjs');
let creds        = require('../credentials');
let config       = require('./config');
let store        = require('./Store');
let elements     = require('./elements');
let sqlQuery     = require('./queries');
let commons      = require('./commons');
let _p           = require('./promise-utils');
let intercept    = require('intercept-stdout');
let childProcess = require('child_process');
let Mocha        = require('mocha');
let mocha        = new Mocha({});
let driver       = config.driver;

class Commons {
    constructor() {
        this.os = config.desired.platformName;
        this.version = config.desired.platformVersion;
	}

    isAndroid() {
        if (this.os == 'Android') {
            return true;
        }
        return false;
	}

    isAndroid6() {
        if (this.os == 'Android' && this.version == '6.0') {
            return true;
        }
        return false;
	}

    isIOS() {
        if (this.os == 'iOS') {
            return true;
        }
        return false;
	}

    pry() {
        eval(pry.it);
	}

    beforeAll() {
        before(function() {
            //  example how to intercept console output to hide noise
            //	var unhook_intercept = intercept(function (txt) {
            //		return txt.replace(/.*(response|call|get|post).*screenshot.*/i, '');
            //	})
            let elements = config.elements;
            let desired = config.desired;
            config.testResults = [];
            require("./logging").configure(driver);
            // this.os isn't working for some reason.  todo may need to update to account for iOS sim.
            if (process.platform == 'win32') {
                desired.app = require("./apps").androidDeviceAppW;
            }
            else if (process.env._system_name == 'OSX' && config.desired.platformName == 'Android') {
                desired.app = require("./apps").androidDeviceApp;
            }
            else if (config.desired.platformName == 'iOS' && config.sim == false) {
                desired.app = require("./apps").iosDeviceApp;
            }
            else if (config.desired.platformName == 'iOS' && config.sim == true) {
                desired.app = require("./apps").iosSimApp;
            }
            else {
                throw new Error("Commons beforeAll couldn't match device, environment, and args to available apps.");
            }
            if (process.env.SAUCE) {
                desired.name = 'Automation Code';
                desired.tags = ['sample'];
            }
            //clear and create screenshots, and loadTimeLogs directories
            fsExtra.removeSync('./screenShots');
            fsExtra.mkdirs('./screenShots');
            fsExtra.removeSync('./video');
            fsExtra.mkdirs('./video');
            fsExtra.removeSync('./loadTimeLogs');
            fsExtra.mkdirs('./loadTimeLogs');
            fsExtra.removeSync('./test_results');
            fsExtra.mkdirs('./test_results');
            // Open writeStream for logTime file using current local time
            require('moment-timezone');
            let moment = require('moment');
            let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            let time = moment().tz(timezone).format();
            let myCurrentTime = time.slice(11, 19).replace(/:/g, '_');
            config.dateTime = time.slice(5, 19).replace(/:/g, '_').replace(/-/g, '_'); // like 06_26T01_09_04 (24 hr time)
            // Current date
            let month = (new Date().getMonth() + 1);
            let day = new Date().getDate();
            let year = new Date().getFullYear();
            // Local DateTime
            config.myDateTime = (month + '_' + day + '_' + year + '_' + myCurrentTime);
            config.wStreamLogTimeFile = fs.createWriteStream('loadTimeLogs/loadTimesLog_' + config.myDateTime + '.txt');
            config.wStreamTestResultFile = fs.createWriteStream('test_results/test_result_' + config.myDateTime + '.txt');
            config.logTimes = {};
            return driver.init(desired);
        });
	}

    beforeEachIt() {
        beforeEach(function() {
            //test stuff
            console.log(('Running ' + this.currentTest.title).green.bold.underline);
            config.currentTest = this.currentTest; // put the currentTest object on Config in case we want to access it mid-test
            //record video
            config.video = childProcess.spawn('xcrun', ['simctl', 'io', 'booted', 'recordVideo', '/Users/mliedtka/AppiumAutomationFieldPortal/video/' + process.argv.slice(2)[2] + '_' + this.currentTest.title.replace(/\s+/ig, '_') + '.mp4']);
            config.video.on('exit', console.log.bind(console, 'video recording exited'));
            config.video.on('close', console.log.bind(console, 'video recording closed'));
            /*
                    //video recorder stuff
                    config.recorder_output = '/Users/mliedtka/AppiumAutomation/video/' + this.currentTest.title.replace(/\s+/ig,'_') + '.mp4';
                    config.recorder_dir = '/Users/mliedtka/AppiumAutomation/recorder_tmpdir';
                    config.recorder_options = {
                        fps: 40,
                        tmpdir: config.recorder_dir
                    };
                    config.recorder = new Recorder(driver,config.recorder_options)
                    config.recorder.start();
            */
        });
	}

    afterEachIt() {
        afterEach(function() {
            // let allPassed = allPassed && this.currentTest.state === 'passed';
            /* //video recorder stuff config.recorder.stopSaveAndClear(config.recorder_output, function() {}.bind(this)); */
            let thisTest = this.currentTest.title;
            config.video.kill('SIGINT');
            //test stuff - screenshot on failure, log results to file and store in object to console.log at the end.
            if (this.currentTest.state == 'failed') {
                console.log(('\n\t' + this.currentTest.err.message).red + '\n');
                config.wStreamTestResultFile.write('Test Failed: ' + thisTest + '\n');
                config.testResults.push('\u2717  '.red + thisTest);
                return driver
                    .takeScreenshotMethod(thisTest);
            }
            else if (this.currentTest.state == 'passed') {
                config.wStreamTestResultFile.write('Test Passed: ' + thisTest + '\n');
                config.testResults.push('\u2713  '.green + thisTest);
            }
            else {
                config.wStreamTestResultFile.write('Test ' + this.currentTest.state + ' :' + thisTest + '\n');
                config.testResults.push('\u003F  '.yellow + thisTest);
            }
        });
	}

    afterAll() {
        after(function() {
            config.wStreamLogTimeFile.end();
            config.wStreamTestResultFile.end();
            return driver
                .sleep(1005)
                .quit()
                .finally(function() {
                    //let unhook_intercept = intercept(function (txt) {
                    //	return txt.replace(/.*undefined.*/i, '');
                    //})
                    console.log('\n\n******* TEST RESULTS *******\n'.white);
                    config.testResults.map(function(thisTest) {
                        return console.log(thisTest);
                    });
                    console.log('\n****************************'.white);
                    if (process.env.SAUCE) {
                        return driver.sauceJobStatus(allPassed);
                    }
                });
        });
	}

    startTime(startName) {
        let startTime = new Date().getTime();
        config.logTimes[startName] = startTime;
	}

    endTotalAndLogTime(startName) {
        let endTime = new Date().getTime();
        let startTime = config.logTimes[startName];
        let totalTime = convertDate((endTime - startTime));
        let logTimeText = (startName + ': ' +
            totalTime.hrs + ' hours, ' +
            totalTime.mins + ' minutes, ' +
            totalTime.seconds + '.' +
            totalTime.ms + ' seconds.');
        console.log(logTimeText);
        config.wStreamLogTimeFile.write(logTimeText + '\n');
	}

    loginQuick() {
		console.log('LOGIN QUICK'.green.bold.underline);
        return driver
            .elementByIdOrNull(elements.loginLogout.userName) // ensure we're on the login screen, if not, reset app
            .then(function(el) {
                if (el == null) {
                    return driver
                        .resetApp();
                }
            })
            .then(function getUserId() {
                sqlQuery.getUserId();
            })
            .wait_for_sql('getUserId', 'userId')
            .then(function setDBName() {
                sqlQuery.getDatabaseNameAndServer();
            })
            .wait_for_sql('getDatabaseNameAndServer', 'databaseNameAndServer')
            .elementById(elements.loginLogout.logIn) // LogIn Button
            .click()
            .startTime('Log In')
			.sleep(1000) //give spinner time to appear
            .waitForElementToDisappearByClassName(elements.general.spinner)
            .waitForElementById(elements.homeScreen.volunteers, 30000)
            .waitForElementToDisappearByClassName(elements.general.spinner)
            .endTotalAndLogTime('Log In')
            .wait_for_sql('getDatabaseNameAndServer', 'databaseNameAndServer');
	}

    fullLogin(uname, pwd) {
        console.log('FULL LOGIN'.green.bold.underline);
        //set uname
        if (config.ENV == 'test') {
            if (uname == undefined) {
                if (config.thisUser == undefined) {
                    throw new Error('config.thisUser was undefined and no username was passed to the login function.  You must either supply the user name when executing tests, e.g.: --uname mmcintyre, or pass it into the login function.');
                }
                else {
                    uname = 'test_' + config.thisUser;
                }
            }
        }
        else if (config.ENV == 'prod') {
            if (uname == undefined) {
                if (config.thisUser == undefined) {
                    throw new Error('config.thisUser was undefined and no username was passed to the login function.  You must either supply the user name when executing tests, e.g.: --uname mmcintyre, or pass it into the login function.');
                }
                else {
                    uname = config.thisUser;
                }
            }
        }
        // redefine config.thisUser in case uname was passed to function
        if (uname.substring(0, 5) === 'test_') {
            config.thisUser = uname.substring(5);
        }
        else {
            config.thisUser = uname;
        }
        //set pwd
        if (pwd == undefined) {
            if (config.pwd == undefined) {
                throw new Error('config.pwd was undefined, supply the info when executing tests, e.g.: --pwd qwerty09, or pass it into the login function.');
            }
            else {
                pwd = config.pwd;
            }
        }
        return driver
            .elementByIdOrNull(elements.loginLogout.userName) // ensure we're on the login screen, if not, reset app
            .then(function(el) {
                if (el == null) {
                    return driver
                        .resetApp();
                }
            })
            .then(function() {
                if (driver.elementByClassNameIfExists('XCUIElementTypeAlert')) {
                    driver.acceptAlert();
                }
                else {
                    return driver;
                }
            })
            .waitForElementById(elements.loginLogout.userName, 10000)
            .clear()
            .sendKeys(uname)
            .elementById(elements.loginLogout.password)
            .click()
            .clear()
            .sendKeys(pwd)
            .then(function() {
                if (config.desired.platformName == 'Android') {
                    return driver
                        .elementById(elements.loginLogout.rememberMe)
                        .getAttribute('checked');
                }
                else if (config.desired.platformName == 'iOS') {
                    return driver
                        .elementById(elements.loginLogout.rememberMe)
                        .getAttribute('value');
                }
            })
            .then(function(attr) {
                if (attr == false || attr == 'false') {
                    return driver
                        .elementById(elements.loginLogout.rememberMe)
                        .click();
                }
            })
            .then(function getUserId() {
                sqlQuery.getUserId();
            })
            .wait_for_sql('getUserId', 'userId')
            .then(function setDBName() {
                sqlQuery.getDatabaseNameAndServer();
                config.userIdReg = new RegExp(config.userId[0].userid);
            })
            .wait_for_sql('getDatabaseNameAndServer', 'databaseNameAndServer')
            .elementById(elements.loginLogout.logIn) // LogIn Button
            .click()
            .startTime('Log In')
            .sleep(1000) // give spinner time to appear
            .waitForElementToDisappearByClassName(elements.general.spinner)
            .waitForElementById(elements.homeScreen.volunteers, 30000)
            .waitForElementToDisappearByClassName(elements.general.spinner)
            .endTotalAndLogTime('Log In');
	}

    consoleLog(string) {
        console.log(string);
        return driver;
	}

    wait_for_sql(sql_query_name, recordset_object) {
        // both args should be strings
        let counter = 0;
        return new Promise(function(resolve, reject) {
            (function wait_1() {
                if (Object.keys(config[recordset_object] || []).length !== 0) {
                    return resolve();
                }
                else {
                    counter += 1;
                    setTimeout(wait_1, 2000);
                    if (counter === 1) {
                        console.log('Waiting for ' + sql_query_name + ' to return....\n'
                            + sql_query_name + '.length = ' + Object.keys(config[recordset_object] || []).length);
                    }
                    else if (counter > 1 && counter < 10) {
                        console.log('Waiting...');
                    }
                    else if (counter > 10) {
                        reject(new Error('SQL Query ' + sql_query_name + ' did not return within twenty seconds.'));
                    }
                }
            })();
        });
	}

    waitForElementToDisappearByClassName(className) {
        let counter = 0;
        let start = new Date();
        function recursive() {
            return driver.elementByClassNameOrNull(className)
                .then(function(el) {
                    if (el !== null) {
                        counter += 1;
                        return recursive();
                    }
                    else if (counter > 300) {
                        return new Error('Spinner is not disappearing');
                    }
                    else if ((new Date() - start) > (5 * 60 * 1000)) {
                        return new Error('Spinner did not disappear in 5 minutes');
                    }
                });
        }
        return recursive();
	}

	recoverFromFailuresVolunteers(el){
		return driver
			.sleep(1)
			.then(function (el) {
				if (el === null) { // el not found - reset app and go to Vols page
					return driver
						.resetApp()
						.loginQuick()
						.elementById(elements.homeScreen.volunteers)
						.click()
						.waitForElementToDisappearByClassName(elements.general.spinner)
				} else if (el != undefined){ // el was found
					return el
						.getAttribute('visible') // is el visible?
						.then((visible) => {
							if (!visible) { // if not reset app and go to Vols page
								return driver
									.resetApp()
									.loginQuick()
									.elementById(elements.homeScreen.volunteers)
									.click()
									.waitForElementToDisappearByClassName(elements.general.spinner)
							}
						})
				} else if (el === undefined) {
					console.log('fixme: you must pass an element into recoverFromFailures.'.red.bold);
				}
			})
	}

	is_selected(el){
		return el
			.getAttribute('value')
			.then((value) => {assert.equal(value,true)})
	}

	is_not_selected(el){
		return el
			.getAttribute('value')
			.then((value) => {assert.equal(value,null)})
	}

	is_visible(el){
		return el
			.getAttribute('visible')
			.then((visible) => {assert.equal(visible,true)})
	}

	is_not_visible(el){
		return el
			.getAttribute('visible')
			.then((visible) => {assert.equal(visible,false)})
	}

	

};

// **************************************** \\
//    			CONFIG METHODS              \\
// **************************************** \\

let convertDate = function(ms) {
	//this is not used for anything that you will need! it is used for logging date/time and already set up
	let total = parseInt(ms);

	let hours = Math.floor(total / 3600000);
	total = total - (hours * 3600000);

	let minutes = Math.floor(total / 60000);
	total = total - (minutes * 60000);

	let seconds = Math.floor(total / 1000);
	total = total - (seconds * 1000);

	return { hrs: hours, mins: minutes, seconds: seconds, ms: total };
};

module.exports = new Commons();
