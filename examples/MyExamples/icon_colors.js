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

	describe("Test all icon colors", function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1) + ' for iOS').green.bold.underline);

		it.skip('For debugging', function () {
			// config.theseNameAttrs = [];

			return driver
				.loginQuick()
				.elementById(elements.homeScreen.walkbooks)
				.click()
				.waitForElementById(elements.surveys.survey1, 10000)
				.elementById('Copy of Copy of Survey with Custom Email and for checking numbers')
				.click()
				.waitForElementById(elements.survey.start, 10000)
				.consoleLog('Waiting until spinner is gone to click start'.white.bold)
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.consoleLog('All done!'.white.bold)
				.elementById(elements.survey.start)
				.click()
			    .waitForElementByClassName('XCUIElementTypeTable', 10000)
				.then(sqlQuery.touchedHouses)
			    .elementById('oopsie')

			    //click walkbook
			    .getFirstListItemByIdPart('walkbook_notstarted')
		        .then(function () {
		        	console.log('about to click thisElem: ' + config.thisElem)
		        	return driver
		        		.sleep(15000) // testing to make sure thisElem is not redefined
		    	    	.elementById(config.thisElem) // should click cellWalkbook_1
		    	    	.click()
		        })

			    .waitForElementById(elements.survey.popoverOpenBook, 10000)
			    .click()
			    .waitForElementByClassName('XCUIElementTypeTable', 10000)

			    //click house
			    .getFirstListItemByIdPart('cellHouse_3')
			    .then(function () {
			    	console.log('Should click cellHouse_3, actually clicking ' + config.thisHousehold)
			    	return driver
			    		.sleep(10000)
			    		.elementById(config.thisHousehold)
			    		.click()
			    })
			    .then(function () {
			    	console.log('ALL DONE!'.green.bold.underline)
			    	return driver
			    		.elementById('oopsie')
			    })

			    .waitForElementById(elements.walkbook.popoverOpenHouse)
			    .click()
			    .waitForElementById(elements.houseHold.notHome)

			    //works:
			    .elementByXPath("//*/XCUIElementTypeScrollView[1]/XCUIElementTypeOther[1]") // target button area
			    .elementsByClassName('>','XCUIElementTypeButton') // all button elements in the above context
			    .saveAllNameAttributes('cellContact_', 'theseNameAttrs')
			    .then(function () {

			    	let regexp = new RegExp('^prim_cellContact_\\d+$', 'i');

			    	var prom;
			    	for (let i = 0; i < config.theseNameAttrs.length; i++) {

			    		// take survey with all primary targets
			    		if (regexp.test(config.theseNameAttrs[i])) {

			    			let thisTarget = config.theseNameAttrs[i];

			    			if (i == 0) {
			    				prom = commons.takeSurveyTemp(thisTarget);
			    			} else {
			    				prom = prom.then(function () {
			    					return commons.takeSurveyTemp(thisTarget)
			    				})
			    			}
			    		}
			    	}
			    	return prom;
			    })
			    .consoleLog('TEST CASE IS OVER'.red.bold.underline) //surveys should have been taken with all primary targets and no non-primary targets.
		});

		it.skip('Should perform a full login', function () {
			return driver
				.fullLogin(creds.testUserName1, creds.testUserPwd1)
		});

		it('Should login quick', function () {
			return driver
				.loginQuick()
		});

		it('Should turn the house green: survey both primary targets', function () {
			config.housesWithMoreThan1Primary = {}
			config.theseHouses = [];
			config.thisHouseholdAfter = '';
			config.thisSurvey = '';
			config.thisHousehold = '';
			config.thisElem = '';

			/*
				Abstract:
					Use SQL to unassign all walkbooks for the helper, then reassign walkbooks in the current survey that contain multiple primary targets
					Use SQL to create an array of walkbook-household object pairs, of houses in walkbooks that have multiple primary targets
					Select a house from the list we created and survey all primary targets
					Verify house is green
			*/

			return driver
				// .consoleLog(stackTrace.get()[1].getFileName() + stackTrace.get()[1].getLineNumber()) // todo experiment with this
				.startTime('Home Page to Household')
				.elementById(elements.homeScreen.walkbooks)
				.click()
				.startTime('Load Survey List')
				.waitForElementById(elements.surveys.survey1, 10000)
				.endTotalAndLogTime('Load Survey List')
				.elementById('DO NOT USE: Mobile Automation Survey 1.0')
				.click()
				.waitForElementById(elements.survey.start, 10000)
				.consoleLog('Making sure spinner is gone before trying to click start'.white.bold)
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.consoleLog('Spinner is gone'.white.bold)
			    .elementByXPath('//*/XCUIElementTypeNavigationBar[1]/XCUIElementTypeStaticText[1]') // > get and store the survey name ...
			    .then(function (el) {
			    	return el.getAttribute('name').then(function (attr) {
			    		config.thisSurvey = attr;
			    	})
			    })
				.then(sqlQuery.assignBooksWithMultiplePrimaries) // > unassign and reassign walkbooks with multiple primary targets ...
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
				.getHouseWithMultPrimary() // > find the first house in the list that contains multiple primary targets ...
				.then(function () {
					return driver
						.getFirstListItemByIdPart(config.thisHousehold)
				})
			    .surveyAllPrimaryTargets() // > survey all primary targets - requires config.thisHousehold to be defined.
			    .then(function () {
					config.thisHouseholdAfter = config.thisHousehold.replace('notstarted', 'complete');
			    })
			    //todo fix - config.thisHouseholdAfter is empty and returning a positive result regardless
			    .waitForElementById(config.thisHouseholdAfter, 10000) // > verify the house is green before refresh
			    .consoleLog(('Household color/status check passed - before refresh.  config.thisHouseholdAfter = '
			    			    			 + config.thisHouseholdAfter + '\nTest: ' + config.currentTest.title).green.bold)
			    .refreshHouseList()
			    .sleep(1000)
			    .waitForElementById(config.thisHouseholdAfter, 10000) // > verify the house is green after refresh
			    .consoleLog(('Household color/status check passed - after refresh.  config.thisHouseholdAfter = '
			    			    			 + config.thisHouseholdAfter + '\nTest: ' + config.currentTest.title).green.bold)
			    .consoleLog('TEST CASE IS OVER'.green.bold.underline)
		});

		it('Should turn the house blue: one primary target not home', function () {

			config.thisHousehold = '';
			// Survey: DO NOT USE: Mobile Automation Survey 1.0
			// todo - test this when there is more than one primary target
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
				.getFirstListItemByIdPart('notstarted')
				.then(function () {
					return driver
						.elementById(config.thisHousehold)
						.click()
				})
				.then(function () {

			    	console.log('Using ' + config.thisHousehold + ', houseNum ' + config.houseNum);
			    	let thisHouseholdAfter = config.thisHousehold.replace('notstarted','attempted');

			    	return driver

                    	.waitForElementById(elements.walkbook.popoverOpenHouse, 10000)
					    .elementById(elements.walkbook.popoverOpenHouse)
					    .click()
					    .waitForElementById(elements.houseHold.notHome, 10000)
    					.endTotalAndLogTime('Home Page to Household')
					    .elementById(elements.houseHold.primTarget1)
					    .click()
					    .waitForElementById(elements.target.takeSurvey, 10000)
					    .elementById(elements.target.notHome)
					    .click()
					    .waitForElementById(elements.houseHold.finished, 10000)
					    .click()
					    .waitForElementById(thisHouseholdAfter, 10000) // verify the house is blue
					    .consoleLog('Household color/status check passed - before refresh - Test: ' + config.currentTest.title)
					    .refreshHouseList()
					    .sleep(1000)
					    .waitForElementById(thisHouseholdAfter, 10000) // verify the house is blue after refresh
					    .consoleLog('Household color/status check passed - after refresh - Test: ' + config.currentTest.title)
			    });
		});

		it('Should turn the house red: wrong address house', function () {

			config.thisHousehold = '';
			// Survey: DO NOT USE: Mobile Automation Survey 1.0

			return driver
				// save household IDs:
				.sleep(1)
				.then(function () {
					//if we're not running in dbg mode, reset the app and navigate to house list
					if( !process.argv.slice(2).includes("--dbg") ) {
						return driver
							.resetApp()
							.loginQuick()
							.homeToHouseList()
					}
				})
				.getFirstListItemByIdPart('notstarted')
				.then(function () {
					return driver
						.elementById(config.thisHousehold)
						.click()
				})
				.then(function () {
					console.log('Using ' + config.thisHousehold + ', houseNum ' + config.houseNum);
					let thisHouseholdAfter = config.thisHousehold.replace('notstarted','reject');

					return driver

						.waitForElementById(elements.walkbook.popoverOpenHouse, 10000)
						.elementById(elements.walkbook.popoverOpenHouse)
						.click()
						.waitForElementById(elements.houseHold.wrongAddress, 10000)
						.elementById(elements.houseHold.wrongAddress)
						.click()
						.waitForElementByClassName('XCUIElementTypeTable', 10000) // wait for the house list
						.waitForElementById(thisHouseholdAfter, 10000) // verify house
						.consoleLog('Household color/status check passed - before refresh - Test: ' + config.currentTest.title)
						.refreshHouseList()
						.waitForElementById(thisHouseholdAfter, 10000) // verify house after refresh
						.consoleLog('Household color/status check passed - after refresh - Test: ' + config.currentTest.title)
				});
		});

		it('Should turn the house red: refused house', function () {

			config.thisHousehold = '';
			// Survey: DO NOT USE: Mobile Automation Survey 1.0

			return driver
				// save household IDs:
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
				.getFirstListItemByIdPart('notstarted')
				.then(function () {
					return driver
						.elementById(config.thisHousehold)
						.click()
				})
				.then(function () {
					console.log('Using ' + config.thisHousehold + ', houseNum ' + config.houseNum);
					let thisHouseholdAfter = config.thisHousehold.replace('notstarted','reject');

					return driver

						.waitForElementById(elements.walkbook.popoverOpenHouse, 10000)
						.elementById(elements.walkbook.popoverOpenHouse)
						.click()
						.waitForElementById(elements.houseHold.refused, 10000)
						.elementById(elements.houseHold.refused)
						.click()
						.waitForElementByClassName('XCUIElementTypeTable', 10000) // wait for the house list
						.waitForElementById(thisHouseholdAfter, 10000) // verify house
						.consoleLog('Household color/status check passed - before refresh - Test: ' + config.currentTest.title)
						.refreshHouseList()
						.waitForElementById(thisHouseholdAfter, 10000) // verify house after refresh
						.consoleLog('Household color/status check passed - after refresh - Test: ' + config.currentTest.title)
				});
		});

		it('Should turn the house blue: not home house', function () {

			config.thisHousehold = '';
			// Survey: DO NOT USE: Mobile Automation Survey 1.0

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
				.getFirstListItemByIdPart('notstarted')
				.then(function () {
					return driver
						.elementById(config.thisHousehold)
						.click()
				})
				.then(function () {
					console.log('Using ' + config.thisHousehold + ', houseNum ' + config.houseNum);
					let thisHouseholdAfter = config.thisHousehold.replace('notstarted','attempted');

					return driver

						.waitForElementById(elements.walkbook.popoverOpenHouse, 10000)
						.click()
						.waitForElementById(elements.houseHold.notHome, 10000)
						.elementById(elements.houseHold.notHome)
						.click()
						.waitForElementByClassName('XCUIElementTypeTable', 10000) // wait for the house list
						.waitForElementById(thisHouseholdAfter, 10000) // verify house is blue
						.consoleLog('Household color/status check passed - before refresh - Test: ' + config.currentTest.title)
						.refreshHouseList()
						.waitForElementById(thisHouseholdAfter, 10000) // verify house after refresh
						.consoleLog('Household color/status check passed - after refresh - Test: ' + config.currentTest.title)
				});
		});

		it('TRANSITION: blue to red: one primary not home --> restricted access house', function () {

			config.thisHousehold = '';
			// todo probably make this "any blue"
			// Survey: DO NOT USE: Mobile Automation Survey 1.0

			return driver
				// save household IDs:
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
				.getFirstListItemByIdPart('attempted')
				.then(function () {
					return driver
						.elementById(config.thisHousehold)
						.click()
				})
				.then(function () {

					console.log('Using ' + config.thisHousehold + ', houseNum ' + config.houseNum);
					let thisHouseholdAfter = config.thisHousehold.replace('attempted','reject');

			    	return driver

						.waitForElementById(elements.walkbook.popoverOpenHouse, 10000)
						.elementById(elements.walkbook.popoverOpenHouse)
						.click()
						.waitForElementById(elements.houseHold.restricted, 10000)
						.click()
						.waitForElementByClassName('XCUIElementTypeTable', 10000) // wait for the house list
						.waitForElementById(thisHouseholdAfter, 10000) // verify house is blue
						.consoleLog('Household color/status check passed - before refresh - Test: ' + config.currentTest.title)
						.refreshHouseList()
						.sleep(1000)
						.waitForElementById(thisHouseholdAfter, 10000) // verify the house is blue after refresh
						.consoleLog('Household color/status check passed - after refresh - Test: ' + config.currentTest.title)
				});
		});

		it('REPORTING BUSINESS RULE 4 (multiple dispositions) & TRANSITION (red to blue: restricted house --> not home house)', function () {

			config.thisHousehold = '';
			// todo probably make this "any red"
			// Survey: DO NOT USE: Mobile Automation Survey 1.0

			return driver
				// save household IDs:

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
				.getFirstListItemByIdPart('reject')
				.then(function () {
					return driver
						.elementById(config.thisHousehold)
						.click()
				})
				.then(function () {
					console.log('Using ' + config.thisHousehold + ', houseNum ' + config.houseNum);
					let thisHouseholdAfter = config.thisHousehold.replace('reject','attempted');

					return driver

						.waitForElementById(elements.walkbook.popoverOpenHouse, 10000)
						.elementById(elements.walkbook.popoverOpenHouse)
						.click()
						.waitForElementById(elements.houseHold.notHome, 10000)
						.elementById(elements.houseHold.notHome)
						.click()
						.waitForElementByClassName('XCUIElementTypeTable', 10000) // wait for the house list
						.waitForElementById(config.thisHousehold, 10000) // house is still red - new reporting should have processed business rule 4. Must refresh to see correct household color.
						.consoleLog('Household color/status check passed - before refresh - Test: ' + config.currentTest.title)
						.refreshHouseList()
						.waitForElementById(thisHouseholdAfter, 10000) // verify the house is blue after refresh
						.consoleLog('Household color/status check passed - after refresh - Test: ' + config.currentTest.title)
				});
		});

		it('TRANSITION: blue to green: not home house --> take survey all primary', function () {
			config.housesWithMoreThan1Primary = {}
			config.theseHouses = [];
			config.thisHouseholdAfter = '';
			config.thisSurvey = '';
			config.thisHousehold = '';
			config.thisElem = '';

			// todo probably make this "any blue"

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

				//generate an 'attempted' house
				.getFirstListItemByIdPart('notstarted')
				.then(function () {
					console.log('About to attempt clicking a notstarted house to generate a not home'.white.bold)
					return driver
						.elementById(config.thisHousehold)
						.click()
				})
				.then(function () {
					console.log('Using ' + config.thisHousehold + ', houseNum ' + config.houseNum);
					let thisHouseholdAfter = config.thisHousehold.replace('notstarted','attempted');

					return driver

						.waitForElementById(elements.walkbook.popoverOpenHouse, 10000)
						.elementById(elements.walkbook.popoverOpenHouse)
						.click()
						.waitForElementById(elements.houseHold.notHome, 10000)
						.elementById(elements.houseHold.notHome)
						.click()
						.waitForElementByClassName('XCUIElementTypeTable', 10000) // wait for the house list
						.waitForElementById(thisHouseholdAfter, 10000) // verify house is blue
				})

				//surveying all primary targets in a house that was previously attempted should turn it green.
				.then(function () {
					let thisHousehold = config.thisHousehold.replace('notstarted','attempted');

					if (/notstarted/.test(config.thisHousehold)) {
						config.thisHouseholdAfter = config.thisHousehold.replace('notstarted', 'complete') //trying this
					} else if (/attempted/.test(config.thisHousehold)) {
						config.thisHouseholdAfter = config.thisHousehold.replace('attempted', 'complete') //trying this
					}

					config.thisHousehold = thisHousehold;

					return driver

					    .surveyAllPrimaryTargets()
					    .waitForElementById(config.thisHouseholdAfter, 10000) // > verify the house is green before refresh
					    .consoleLog(('Household color/status check passed - before refresh.  config.thisHouseholdAfter = '
					    			    			 + config.thisHouseholdAfter + '\nTest: ' + config.currentTest.title).green.bold)
					    .refreshHouseList()
					    .sleep(1000)
					    .waitForElementById(config.thisHouseholdAfter, 10000) // > verify the house is green after refresh
					    .consoleLog(('Household color/status check passed - after refresh.  config.thisHouseholdAfter = '
					    			    			 + config.thisHouseholdAfter + '\nTest: ' + config.currentTest.title).green.bold)
					    .consoleLog('TEST CASE IS OVER'.green.bold.underline)
				})
		});

		it('TRANSITION: blue to red: not home house --> refused house', function () {

			config.housesWithMoreThan1Primary = {}
			config.theseHouses = [];
			config.thisHouseholdAfter = '';
			config.thisSurvey = '';
			config.thisHousehold = '';
			config.thisElem = '';

			// todo probably make this "any blue"
			// Survey: DO NOT USE: Mobile Automation Survey 1.0

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
				.getFirstListItemByIdPart('notstarted')
				.then(function () {
					console.log('About to attempt clicking a notstarted house to generate a not home'.white.bold)
					return driver
						.elementById(config.thisHousehold)
						.click()
				})
				// generate a "not home house"
				.then(function () {
					console.log('Using ' + config.thisHousehold + ', houseNum ' + config.houseNum);
					let thisHouseholdAfter = config.thisHousehold.replace('notstarted','attempted');

					return driver

						.waitForElementById(elements.walkbook.popoverOpenHouse, 10000)
						.elementById(elements.walkbook.popoverOpenHouse)
						.click()
						.waitForElementById(elements.houseHold.notHome, 10000)
						.elementById(elements.houseHold.notHome)
						.click()
						.waitForElementByClassName('XCUIElementTypeTable', 10000) // wait for the house list
						.waitForElementById(thisHouseholdAfter, 10000) // verify house is blue
						.then(function () {
							if (config.houseNum > 10){
 								return driver
									.execute('mobile: scroll', {direction: 'up'}) // scroll up if we were at the bottom
							}
						})
				})
				.getFirstListItemByIdPart('attempted')
				.then(function () {
					return driver
						.elementById(config.thisHousehold)
						.click()
				})
				// from not home => refused
				.then(function () {
					console.log('Using ' + config.thisHousehold + ', houseNum ' + config.houseNum);
					let thisHouseholdAfter = config.thisHousehold.replace('attempted','reject');

					return driver

						.waitForElementById(elements.walkbook.popoverOpenHouse, 10000)
						.elementById(elements.walkbook.popoverOpenHouse)
						.click()
						.waitForElementById(elements.houseHold.refused, 10000)
						.elementById(elements.houseHold.refused)
						.click()
						.waitForElementByClassName('XCUIElementTypeTable', 10000) // wait for the house list
						.waitForElementById(thisHouseholdAfter, 10000) // verify house
						.consoleLog('Household color/status check passed - before refresh - Test: ' + config.currentTest.title)
						.refreshHouseList()
						.waitForElementById(thisHouseholdAfter, 10000) // verify house after refresh
						.consoleLog('Household color/status check passed - after refresh - Test: ' + config.currentTest.title)
				});
		});
	});
};