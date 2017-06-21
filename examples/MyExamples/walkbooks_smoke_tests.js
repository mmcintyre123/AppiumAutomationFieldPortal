"use strict";

module.exports = function () {
	
	require('colors');
	let wd            = require("wd");
	let assert  	  = require('assert');
	let asserters     = wd.asserters;
	let	_             = require('underscore');
	let	Q             = require('q');
	let	fsExtra       = require('fs-extra');
	let	fs            = require('fs');
	let	pry  		  = require('pryjs');
	const sql         = require('mssql');
	let	_p            = require('../helpers/promise-utils');
	let	elements      = require('../helpers/elements');
	let	actions       = require('../helpers/actions');
	let store    	  = require('../helpers/store');
	let	config 		  = require('../helpers/config');
	let	serverConfigs = require('../helpers/appium-servers');
	let creds         = require('../credentials');
	let sqlQuery      = require('../helpers/queries');
	let	serverConfig  = process.env.SAUCE ? serverConfigs.sauce : serverConfigs.local;
	let	args  		  = process.argv.slice( 2 );
	let	simulator     = false;
	let	desired;
	let driver = config.driver;
	let	commons = require('../helpers/commons'); // this must be after the desired and driver are set

	// all passing 6-20-17

	describe("Walkbooks smoke tests, start to household", function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)
		config.thisSurvey = ''

		it('Login quick', function () {
			return driver
				.loginQuick()
		});

		it('Load survey list', function () {
			return driver
				.sleep(1)
				.then(function () {
					//if we're not running in dbg mode, reset the app
					if( !process.argv.slice(2).includes("--dbg") ) {
						return driver
							.resetApp()
							.loginQuick()
					}
				})
				.elementById(elements.homeScreen.walkbooks)
				.click()
				.startTime('Load Survey List')
				.waitForElementById(elements.surveys.survey1, 30000)
				.endTotalAndLogTime('Load Survey List')
		});

		it('Open survey', function () {
			return driver
				.sleep(1)
				.then(function () {
					//if we're not running in dbg mode, reset the app
					if( !process.argv.slice(2).includes("--dbg") ) {
						return driver
							.resetApp()
							.loginQuick()
							.elementById(elements.homeScreen.walkbooks)
							.click()
							.waitForElementById(elements.surveys.survey1, 30000)
					}
				})
				.elementById(elements.surveys.survey1)
				.click()
				.startTime('Open survey')
				.consoleLog('Waiting until spinner is gone'.white.bold)
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.consoleLog('Spinner is gone'.white.bold)
				.waitForElementById(elements.survey.start, 30000)
				.endTotalAndLogTime('Open survey')
				//todo look up disclaimer text with sql and assert that it's present
				//todo assert the title is not blank i.e. title !== ''
		});

		it('Open survey preview', function () {
			return driver
				.sleep(1)
				.then(function () {
					//if we're not running in dbg mode, reset the app
					if( !process.argv.slice(2).includes("--dbg") ) {
						return driver
							.resetApp()
							.loginQuick()
							.elementById(elements.homeScreen.walkbooks)
							.click()
							.waitForElementById(elements.surveys.survey1, 30000)
							.click()
					}
				})
				.consoleLog('Waiting for spinner to disappear'.white.bold)
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.consoleLog('Spinner is gone'.white.bold)
				.elementByXPath('//*/XCUIElementTypeNavigationBar[1]/XCUIElementTypeStaticText[1]') // > get and store the survey name ...
				.then(function (el) {
					return el.getAttribute('name').then(function (attr) {
						config.thisSurvey = attr;
					})
				})
				.waitForElementById(elements.survey.previewQuestions, 30000)
				.click()
				.startTime('Load survey preview')
				.waitForElementById(config.thisSurvey) // back button on survey preview page
				.endTotalAndLogTime('Load survey preview')
				//todo look up the survey questions in sql and assert the text is shown
				.back()
		});

		it('Start survey', function () {
			return driver
				.sleep(1)
				.then(function () {
					//if we're not running in dbg mode, reset the app
					if( !process.argv.slice(2).includes("--dbg") ) {
						return driver
							.resetApp()
							.loginQuick()
							.elementById(elements.homeScreen.walkbooks)
							.click()
							.waitForElementById(elements.surveys.survey1, 30000)
							.click()
					}
				})
				.consoleLog('Making sure spinner is gone before trying to click start'.white.bold)
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.consoleLog('Spinner is gone'.white.bold)
				.waitForElementById(elements.survey.start,30000)
				.click()
				.startTime('Load Survey')
				.waitForElementByClassName('XCUIElementTypeTable', 30000)
			    .endTotalAndLogTime('Load Survey')
		});

		it('Open a walkbook', function () {
			return driver
				.sleep(1)
				.then(function () {
					//if we're not running in dbg mode, reset the app
					if( !process.argv.slice(2).includes("--dbg") ) {
						return driver
							.resetApp()
							.loginQuick()
							.elementById(elements.homeScreen.walkbooks)
							.click()
							.waitForElementById(elements.surveys.survey1, 30000)
							.click()
							.consoleLog('Making sure spinner is gone before trying to click start'.white.bold)
							.waitForElementToDisappearByClassName(elements.general.spinner)
							.consoleLog('Spinner is gone'.white.bold)
							.waitForElementById(elements.survey.start,30000)
							.click()
					}
				})
				.waitForElementByClassName('XCUIElementTypeTable',30000)
			    .getFirstListItemByIdPart(elements.survey.walkbook1) // > choose first walkbook in the list ...
		        .then(function () {
		        	return driver
		    	    	.elementById(config.thisElem)
		    	    	.click()
		        })
		        .waitForElementById(elements.survey.popoverOpenBook, 30000)
		        .click()
		        .startTime('Load Walkbook')
		        .waitForElementByClassName('XCUIElementTypeTable', 30000)
		        .endTotalAndLogTime('Load Walkbook')
		});

		it('Open household and verify elements', function () {
			return driver
				.sleep(1)
				.then(function () {
					//if we're not running in dbg mode, reset the app
					if( !process.argv.slice(2).includes("--dbg") ) {
						return driver
							.resetApp()
							.loginQuick()
							.homeToHouseList()
					}
				})
				.getFirstListItemByIdPart(elements.walkbook.houseHold1)
				.then(function () {
					return driver
						.elementById(config.thisHousehold)
						.click()
				})
				.waitForElementById(elements.walkbook.popoverOpenHouse, 10000)
				.click()
				.startTime('Load Household')
				.waitForElementById(elements.houseHold.notHome, 30000)
				.endTotalAndLogTime('Load Household')
				.elementById(elements.houseHold.refused)
				.elementById(elements.houseHold.wrongAddress)
				.elementById(elements.houseHold.restricted)
				.elementById(elements.houseHold.addContact)
				.elementById(elements.houseHold.finished)
		});

	});
};