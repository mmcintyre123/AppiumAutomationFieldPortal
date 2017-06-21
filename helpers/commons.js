'use strict';

require('colors');
require('./setup');
let _         =  require('underscore');
let wd 	  	  =  require('wd');
let fs        =  require('fs');
let fsExtra   =  require('fs-extra');
let assert    =  require('assert');
let pry       =  require('pryjs');
let config    =  require('./config');
let store     =  require('./Store');
let elements  =  require('./elements');
let sqlQuery  =  require('./queries');
let commons   =  require('./commons');
let _p        =  require('./promise-utils');
let intercept =  require('intercept-stdout');
let childProcess = require( 'child_process' );
let driver    =  config.driver;

// todo this.os doesn't seem to be working.
function Commons () {
	this.os      = config.desired.platformName;
	this.version = config.desired.platformVersion;
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

// todo this.os doesn't seem to be working.
Commons.prototype.isAndroid = function() {

	if (this.os == 'Android') {
		return true;
	}
	return false;
};

Commons.prototype.isAndroid6 = function() {

	if (this.os == 'Android' && this.version == '6.0') {
		return true;
	}
	return false;
};

Commons.prototype.isIOS = function() {

	if (this.os == 'iOS') {
		return true;
	}
	return false;
};

Commons.prototype.pry = function(){
	eval(pry.it);
};

Commons.prototype.beforeAll = function(){

	before(function() {

		var unhook_intercept = intercept(function (txt) {
			return txt.replace(/.*(response|call|get|post).*screenshot.*/i, '');
		})

		let elements = config.elements;
		let desired  = config.desired;

		require("./logging").configure(driver);

		// this.os isn't working for some reason.  todo may need to update to account for iOS sim.
		if (process.platform == 'win32') {
			desired.app = require("./apps").androidDeviceAppW;
		} else if (process.env._system_name == 'OSX' && config.desired.platformName == 'Android') {
			desired.app = require("./apps").androidDeviceApp;
		} else if (config.desired.platformName == 'iOS' && config.sim == false) {
			desired.app = require("./apps").iosDeviceApp;
		} else if (config.desired.platformName == 'iOS' && config.sim == true) {
			desired.app = require("./apps").iosSimApp;
		} else {
			throw "Commons beforeAll couldn't match device, environment, and args to available apps."
		}

		if (process.env.SAUCE) {
			desired.name = 'Automation Code';
			desired.tags = ['sample'];
		}
		//clear and create screenshots, recorder_tmpdir, and loadTimeLogs directories
		fsExtra.removeSync('./screenShots')
		fsExtra.mkdirs('./screenShots')
		fsExtra.removeSync('./video')
		fsExtra.mkdirs('./video')
		fsExtra.removeSync('./loadTimeLogs') // to clear out the load time file if necessary
		fsExtra.mkdirs('./loadTimeLogs')

		// Open writeStream for logTime file using current local time
		require('moment-timezone')
		let moment = require('moment');
		let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
		let time = moment().tz(timezone).format();
		let myCurrentTime = time.slice(11,19).replace(/:/g,'_');

		// Current date
		let month = (new Date().getMonth() + 1);
		let day = new Date().getDate();
		let year = new Date().getFullYear();

		// Local DateTime
		config.myDateTime = (month + '_' + day + '_' + year + '_' + myCurrentTime);
		config.wStreamLogTimeFile = fs.createWriteStream( 'loadTimeLogs/loadTimesLog_' +
														  config.myDateTime + '.txt' )
		config.logTimes = {}

		return driver.init(desired)
	});
};

Commons.prototype.beforeEachIt = function(){
	beforeEach(function () {

		//test stuff
		console.log(('Running ' + this.currentTest.title).green.bold.underline)
		config.currentTest = this.currentTest // put the currentTest object on Config in case we want to access it mid-test

		//record video
		config.video = childProcess.spawn('xcrun', ['simctl', 'io', 'booted', 'recordVideo', '/Users/mliedtka/AppiumAutomation/video/' + this.currentTest.title.replace(/\s+/ig,'_') + '.mp4']);
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
};

Commons.prototype.afterEachIt = function(){
	afterEach(function() {
		// let allPassed = allPassed && this.currentTest.state === 'passed';

		config.video.kill('SIGINT');
/*
		//video recorder stuff
		config.recorder.stopSaveAndClear(config.recorder_output, function() {}.bind(this));
*/
		//test stuff
		if (this.currentTest.state !== 'passed') {
			let thisTest = this.currentTest.title;
			return driver
				.takeScreenshotMethod(thisTest);
		}
    });
};
Commons.prototype.afterAll = function(){

	after(function() {

		config.wStreamLogTimeFile.end();
		return driver
			.sleep(1005)
			.quit()
			.finally(function() {
				if (process.env.SAUCE) {
					return driver.sauceJobStatus(allPassed);
				}
			});
	});
};





// Basic flow for writing files:
// let wstream = fs.createWriteStream('myOutput.txt');
// wstream.write('Hello world!\n');
// wstream.write('Another line\n');
// wstream.end();
Commons.prototype.startTime = function(startName){
	let startTime = new Date().getTime();
	config.logTimes[startName] = startTime;
};

Commons.prototype.endTotalAndLogTime = function(startName){
	let endTime     = new Date().getTime();
	let startTime   = config.logTimes[startName];
	let totalTime   = convertDate((endTime - startTime));
	let logTimeText = (startName      	 + ': '          +
							 totalTime.hrs     + ' hours, '    +
							 totalTime.mins    + ' minutes, '  +
							 totalTime.seconds + '.'           +
							 totalTime.ms      + ' seconds.');
	console.log(logTimeText)
	config.wStreamLogTimeFile.write(logTimeText + '\n');
};


// **************************************** \\
// 			GENERAL TEST METHODS 		    \\
// **************************************** \\

Commons.prototype.loginQuick = function(){
	console.log('LOGIN QUICK'.green.bold.underline);
	return driver
		.elementById(elements.loginLogout.userName)
		.then(function (el) {
			return el.getAttribute('value').then(function (value) {
				config.thisHelper = value;
			}) //save the username for this test in case we need it.
		})
		.elementById(elements.loginLogout.logIn) // LogIn Button
		.click()
		.startTime('Log In')
		.waitForElementById(elements.homeScreen.walkbooks, 30000).should.eventually.exist
		.endTotalAndLogTime('Log In')
};

// todo - this is broken because of WebDriverAgent update?  See issue on github https://github.com/facebook/WebDriverAgent/issues/624
Commons.prototype.fullLogin = function(uname, pwd){
	console.log('FULL LOGIN'.green.bold.underline);
	config.thisHelper = uname; //should be like test_1654wseward.
	return driver
		.sleep(1000)
		.then(function () {
			if (driver.elementByClassNameIfExists('XCUIElementTypeAlert')) {
				driver.acceptAlert()
			} else {
				return driver
			}
		})
		.waitForElementById('etLoginUsername') // UserName
			.clear()
			.sendKeys(uname)
		.hideKeyboard()
		// Click away if we're in iOS:
		.then(function () {
			if(config.desired.platformName == 'iOS') {
				return driver
						.elementByClassName('XCUIElementTypeImage')
						.click()
			}
		})
		.waitForElementById('etPassword') // password
			.click()
			.clear()
			.sendKeys(pwd)
		.hideKeyboard()
		.sleep(500)
		// Click away if we're in iOS:
		.then(function () {
			if(config.desired.platformName == 'iOS') {
				return driver
						.elementByClassName('XCUIElementTypeImage')
						.click()
			}
		})
		// check if "remember me" is already checked.
		.then(function () {
			if (config.desired.platformName == 'Android') {
				return driver
					     .elementById(elements.loginLogout.rememberMe)
					     .getAttribute('checked')
			} else if (config.desired.platformName == 'iOS') {
				return driver
					     .elementById(elements.loginLogout.rememberMe)
					     .getAttribute('value')
			}
		})
		.then(function (attr) {
			if (attr == false || attr == 'false') { // if remember me not checked do:
				return driver
						     .elementById(elements.loginLogout.rememberMe)
						     .click()
			}
		})
		.elementById('btnLogin') // LogIn Button
		.click()
		.startTime('Log In')
		// will be different depending on whether the user has multiple orgs:
		.waitForElementById(elements.homeScreen.walkbooks, 10000).should.eventually.exist
		.endTotalAndLogTime('Log In')
};

Commons.prototype.clickAndClose = function(scope, elemArray){
	while (elemArray.length) {
		let currentPage = elemArray.shift()
		config.alreadyHome = false
		scope = scope.elementById(currentPage)
			.click()
			.startTime(currentPage + ' load time')
			.then(function () {
				if (config.desired.platformName == 'Android'){
					return driver
								 .waitForElementById('up').should.eventually.exist
				} else {
					return driver
								 .waitForElementById('Close').should.eventually.exist
				}
			})
			.endTotalAndLogTime(currentPage + ' load time')
			.then(function (scope) {
				//check for message popups in Android:
				if (config.desired.platformName == 'Android') {
					if (currentPage == elements.homeScreen.voterCheckIn) {
						if (driver.elementById('message')) {
							driver
								  .elementById('message')
								  .source()
								  .then(function (source) {
								  	source.should.include('No precincts are assigned.')
								  })
								  .elementById('button1') // ok button
								  .click();
							config.alreadyHome = true;
						} else {
							return
						}
					} else if (currentPage == elements.homeScreen.eventCheckIn) {
						if (driver.elementById('message')) {
							driver
								  .elementById('message')
								  .source()
								  .then(function (source) {
								  	source.should.include('No events are assigned.')
								  })
								  .elementById('button1') // ok button
								  .click();
							config.alreadyHome = true;
						}
					} else if (config.alreadyHome == false) {
						driver
							  .elementById('up')
							  .click();
					}
				} else if (config.desired.platformName == 'iOS') {
					driver
						  .elementById('Close')
						  .click();
				} else {
					throw new Error('Did not recognize the operating system.')
				}
			})
			.sleep(750);
	}
	return scope;
};

Commons.prototype.scrollHouseList = function(houseNum) {
	// If all the houses in the inital view are used, scroll down:
	return driver
		.consoleLog('Scrolling House List'.white.bold)
		.elementByClassName('XCUIElementTypeTable') // ensure the house list is actually open
		.then(function () {
			if (houseNum > 10) {
				return driver
					.execute('mobile: scroll', {direction: 'up'}) // ensures at top
					.sleep(1000)
			}
		})
		.then(function () {
			if (houseNum > 10 && houseNum <= 20) {
				return driver
					.sleep(3)
					.then(function(loc){
						 return driver
						 	.elementByClassName('XCUIElementTypeTable') // ensure the house list is actually open
							.swipe({
								startX: 12,
								startY: 721,
								offsetX: 0,
								offsetY: -665,
							})
					}) // scrolls down a full screen
			} else if (houseNum > 20 && houseNum <= 30) {
				return driver
					.sleep(4)
					.then(function(loc){
						 return driver
						 	.elementByClassName('XCUIElementTypeTable') // ensure the house list is actually open
						 	.swipe({
						 		startX: 12,
						 		startY: 721,
						 		offsetX: 0,
						 		offsetY: -665,
						 	})
						 	.swipe({
						 		startX: 12,
						 		startY: 721,
						 		offsetX: 0,
						 		offsetY: -665,
						 	})
					}) // scrolls down a full 2 screens
			} else if (houseNum > 30 && houseNum <= 40) {
				return driver
					.sleep(5)
					.then(function(loc){
						 return driver
						 	.elementByClassName('XCUIElementTypeTable') // ensure the house list is actually open
							.swipe({
								startX: 12,
								startY: 721,
								offsetX: 0,
								offsetY: -665,
							})
						 	.swipe({
						 		startX: 12,
						 		startY: 721,
						 		offsetX: 0,
						 		offsetY: -665,
						 	})
						 	.swipe({
						 		startX: 12,
						 		startY: 721,
						 		offsetX: 0,
						 		offsetY: -665,
						 	})
					}) // scrolls down a full 3 screens
			} else if (houseNum > 40) {
				console.log('Don\'t use such large Walkbooks!'.red.bold.underline)
				return driver
					.execute('mobile: scroll', {direction: 'down'}) // scrolls to bottom
			}
		})
};

Commons.prototype.refreshHouseList = function(){
	return driver
		.sleep(1)
		.execute('mobile: scroll', {direction: 'up'}) // scrolls to top - refreshes if already there
		.swipe({startX: 10, startY: 136, offsetX: 0, offsetY: 500,}) // makes sure to refresh if previously at bottom
		.sleep(1000)
};

Commons.prototype.consoleLog = function(string){
	console.log(string)
	return driver
};

//todo Make this work for any survey with any number of questions.
Commons.prototype.takeSurveyTemp = function(thisTarget){

	console.log(('In takeSurveyTemp, config.thisHousehold is ' + config.thisHousehold).white.bold)

	return driver
		.elementById(config.thisHousehold)
		.click()
	    .waitForElementById(elements.walkbook.popoverOpenHouse)
	    .click()
	    .waitForElementById(elements.houseHold.notHome)
		.endTotalAndLogTime('Home Page to Household')
		.elementById(thisTarget)
		.click()
		.waitForElementById(elements.target.takeSurvey, 10000)
		.click()
		.waitForElementById(elements.takeSurvey.answer1, 10000)
		.click()
		.waitForElementById(elements.takeSurvey.submitAnswer, 10000)
		.click()
		.waitForElementById(elements.takeSurvey.skip, 10000)
		.click()
		.waitForElementById(elements.takeSurvey.skip, 10000)
		.click()
		.sleep(2000) // wait for spinner on the epilogue screen
		.waitForElementById(elements.takeSurvey.finish, 10000)
		.elementById(elements.takeSurvey.finish)
		.click()
		.waitForElementByClassName('XCUIElementTypeTable',10000)
};

Commons.prototype.homeToHouseList = function(){
	// config.thisElem = '';

	return driver
		.startTime('Home Page to Household')
		.elementById(elements.homeScreen.walkbooks)
		.click()
		.startTime('Load Survey List')
		.waitForElementById(elements.surveys.survey1, 10000)
		.endTotalAndLogTime('Load Survey List')
		.elementById('DO NOT USE: Mobile Automation Survey 1.0')
		.click()
		.waitForElementById(elements.survey.start, 10000)
	    .elementByXPath('//*/XCUIElementTypeNavigationBar[1]/XCUIElementTypeStaticText[1]') // > get and store the survey name ...
	    .then(function (el) {
	    	return el.getAttribute('name').then(function (attr) {
	    		config.thisSurvey = attr;
	    	})
	    })
		.then(sqlQuery.assignBooksWithMultiplePrimaries) // > unassign and reassign walkbooks with multiple primary targets ...
		.sleep(1000)
		.consoleLog('Making sure spinner is gone before trying to click start'.white.bold)
		.waitForElementToDisappearByClassName(elements.general.spinner)
		.consoleLog('Spinner is gone'.white.bold)
		.elementById(elements.survey.start)
		.click()
		.startTime('Load Survey')
	    .waitForElementByClassName('XCUIElementTypeTable', 10000)
	    .endTotalAndLogTime('Load Survey')
	    .getFirstListItemByIdPart(elements.survey.walkbook1) // > choose first walkbook in the list ...
	    .then(function () {
    		return driver
    			.elementById(config.thisElem)
    			.click()
	    })
	    .waitForElementById(elements.survey.popoverOpenBook, 10000)
	    .click()
	    .startTime('Load Walkbook')
	    .waitForElementByClassName('XCUIElementTypeTable', 10000)
	    .endTotalAndLogTime('Load Walkbook')
};

// todo revise sql query naming conventions so as to be able to use this consistently, predicting the name of the object the results are stored in.
Commons.prototype.wait_for_sql = function(sql_query_name){
	let counter = 0
	return new Promise(function(resolve, reject) {
		(function wait_1() {
			if (Object.keys(config.housesWithMoreThan1Primary || []).length !== 0 ) {
				return resolve();
			} else {
				counter += 1
				setTimeout(wait_1, 2000);
				if (counter === 1) {
					console.log('Waiting for ' + sql_query_name + ' to return....\n\
						' + sql_query_name + '.length = ' + (config.housesWithMoreThan1Primary || []).length)
				} else if (counter > 1 && counter < 30) {
					console.log('Waiting...')
				} else if (counter > 30) {
					reject(new Error('SQL Query ' + sql_query_name + ' did not return within one minute.'))
				}
			}
		})();
	});
};

Commons.prototype.getHouseWithMultPrimary = function(){

	config.theseHouses = [];
	config.surveyedHouses = [];

	//click the first house which contains multiple primary targets, none of whom have been surveyed already:
	//todo fix this - currently hangs after sql finishes executing
	return driver
	.getHousesWithMoreThan1Primary()
	.touchedHouses()
	.then(function wait_for_getHousesWithMoreThan1Primary_sql () {
		let counter = 0
		return new Promise(function(resolve, reject) {
			(function wait_1() {
				if (Object.keys(config.housesWithMoreThan1Primary || []).length !== 0 ) {
					return resolve();
				} else {

					counter += 1
					setTimeout(wait_1, 2000);

					if (counter < 3) {
						console.log('Waiting for getHousesWithMoreThan1Primary to return....\n' + 
							'getHousesWithMoreThan1Primary.length = ' + (config.housesWithMoreThan1Primary || []).length)
					} else if (counter > 3 && counter < 30) {
						console.log('Waiting...')
					} else if (counter > 30) {
						reject(new Error('SQL Query getHousesWithMoreThan1Primary did not return within one minute.'))
					}
				}
			})();
		});

	})
	.then(function wait_for_touchedHouses_sql () {
		let counter = 0
		return new Promise(function(resolve, reject) {
			(function wait_2() {
				console.log(Object.keys(config.touchedHouses || []).length)
				if (Object.keys(config.touchedHouses || []).length !== 0) {
					return resolve();
				} else {

					counter +=1
					setTimeout(wait_2, 2000)

					if (counter === 1) {
						console.log('Waiting for touchedHouses to return....\n' + 
							'touchedHouses.length = ' + (config.housesWithMoreThan1Primary || []).length)
					} else if (counter > 1 && counter < 30) {
						console.log('Waiting...')
					} else if (counter > 30) {
						reject(new Error('SQL Query touchedHouses did not return within one minute.'))
					}
				}
			})();
		});

	})
	.elementByXPath('//*/XCUIElementTypeNavigationBar[1]/XCUIElementTypeStaticText[1]') // on the house list page - should be 'Houses in Walkbook #'
	.then(function (el) {
		return el.getAttribute('name').then(function (attr) {

			//get the current walkbook number
			config.thisWalkbook = Number(attr.match(/\d+/)[0]);

			//create an array of houses in this walkbook
			for (let i=0; i < config.housesWithMoreThan1Primary.length; i++) {
				//if current object corresponds to thisWalkbook
				if( config.housesWithMoreThan1Primary[i].booknum == config.thisWalkbook ) {

					//push corresponding house to array 'theseHouses':
					let thisHouse = 'cellHouse_' + (config.housesWithMoreThan1Primary[i].housenum - 1)
					config.theseHouses.push(thisHouse)
				}
			}
			//create an array of houses we DON'T want in this walkbook
			for (let i=0; i < config.touchedHouses.length; i++) {

				if (config.touchedHouses[i].booknum == config.thisWalkbook) {
					let thisHouse = 'cellHouse_' + (config.touchedHouses[i].housenum - 1)
					config.surveyedHouses.push(thisHouse)
				}
			}

			//remove houses containing one or more targets who have been surveyed from theseHouses
			config.theseHouses = _.difference(config.theseHouses, config.surveyedHouses)

			//todo handle the case of theseHouses being empty - e.g. all houses touched.  When there are less than 2 untouched houses, don't assign the walkbook.
			config.thisHousehold = config.theseHouses.shift()
			console.log(('Using ' + config.thisHousehold).white.bold)
		});
	})
};

Commons.prototype.surveyAllPrimaryTargets = function(){

	console.log(('Surveying all primary targets in ' + config.thisHousehold + '.').white.bold);

	return driver
		.elementById(config.thisHousehold)
		.click()
	    .waitForElementById(elements.walkbook.popoverOpenHouse, 10000)
	    .click()
	    .waitForElementById(elements.houseHold.notHome, 10000)
		.endTotalAndLogTime('Home Page to Household')
		.elementByXPath("//*/XCUIElementTypeScrollView[1]/XCUIElementTypeOther[1]") // > find and store all primary targets then survey all ...
		.elementsByClassName('>','XCUIElementTypeButton')
		// .saveFirstNameAttributes('prim_cellContact_', 'theseNameAttrs',undefined)
		.then(function (els) {
			return _p.saveFirstNameAttributes('prim_cellContact_', 'theseNameAttrs',undefined,els)
		})
		.back()
		.waitForElementByClassName('XCUIElementTypeTable',10000) // wait for the house list to appear
		.then(function () {

			let regexp = new RegExp('^prim_cellContact_\\d+$', 'i');
			let prom;

			for (let i = 0; i < config.theseNameAttrs.length; i++) {

				// take survey with all primary targets
				if (regexp.test(config.theseNameAttrs[i])) {

					let thisTarget = config.theseNameAttrs[i];

					if (i == 0) {
						prom = Commons.prototype.takeSurveyTemp(thisTarget);
					} else {
						prom = prom.then(function () {

							if (/notstarted/.test(config.thisHousehold)) {
								config.thisHousehold = config.thisHousehold.replace('notstarted', 'partial') //trying this
							} else if (/attempted/.test(config.thisHousehold)) {
								config.thisHousehold = config.thisHousehold.replace('attempted', 'partial') //trying this
							}

							return Commons.prototype.takeSurveyTemp(thisTarget); // todo, make this different, where the house is redefined to in progress and don't use getFirstListItem

						})
					}
				}
			}
			return prom;
		})
};

Commons.prototype.waitForElementToDisappearByClassName = function waitForElementToDisappearByClassName(className){
	function recursive() {
		return driver.elementByClassNameOrNull(className)
			.then(function(el) {
				if (el !== null) {
					return recursive()
				}
			})
	}
	return recursive()
};


module.exports = new Commons();
