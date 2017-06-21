"use strict";

// THIS FILE IS OLD - MOVED TO SEPARATE FILE.  CAN BE RUN WITHOUT MOCHA.JS, TESTFILES.JS OR RUN.JS.


let wd            = require("wd"),
    assert  	  = require('assert'),
	_             = require('underscore'),
	Q             = require('q'),
	fsExtra       = require('fs-extra'),
	fs            = require('fs'),
	_p            = require('./helpers/promise-utils'),
	elements      = require('./helpers/elements'),
	actions       = require('./helpers/actions'),
	pry  		  = require('pryjs'),
	config 		  = require('./helpers/config'),
	serverConfigs = require('./helpers/appium-servers'),
	serverConfig  = process.env.SAUCE ? serverConfigs.sauce : serverConfigs.local,
	args  		  = process.argv.slice( 2 ),
	simulator     = false,
	desired;

	for ( let i in args ) {
		let arg = args[ i ];
		i   = Number( i );

		switch ( arg ) {
			case '-sim' : {
				if ( args[ i + 1 ] !== undefined ) {
					simulator = true;
					desired   = _.clone(require( './helpers/caps' )[ args[ i + 1 ] ]);

					config.set( {
						'os'      : args[ i + 1 ],
						'desired' : desired,
						'sim'     : true
					} );
				}

				break;
		}

			case '-time' : {
				if ( args[ i + 1 ] !== undefined ) {
					timeout = args[ i + 1 ];
				} else {
					throw 'You did not specify a timeout for -timeout';
				}

				break;
			}

			case '-reset' : {
				if ( args[ i + 1 ] !== undefined ) {
					config.set( {
						'reset' : true
					} );
				}

				break;
			}

			case '-os' : {
				if ( args[ i + 1 ] !== undefined ) {
					desired = _.clone(require( './helpers/caps' )[ args[ i + 1 ] ]);

					config.set( {
						'os'      : args[ i + 1 ],
						'desired' : desired,
						'sim'     : false
					} );
				} else {
					throw 'You did not specify an os for -os';
				}

				break;
			}
		}
	}

let driver = wd.promiseChainRemote(serverConfig);
config.set({
	'driver'   : driver,
	'elements' : elements
});

require("./helpers/setup"); // this MUST come before commons is required
let	commons = require('./helpers/commons'); // this must be after the desired and driver are set

describe("Visiting all pages in Walk", function() {
	// this.timeout(3000000);
	let allPassed = true;

	commons.beforeAll()
	commons.afterAll()
	commons.afterEach()

	function clickMenuItem(name) {
	  return driver
	    .elementByName(name)
	    .catch(function () {
	      return driver
	        .elementByClassName('XCUIElementTypeTable')
	        .elementsByClassName('>','XCUIElementTypeCell')
	        .then(_p.filterWithName(name)).first();
	    }).click();
	}

	it('Full Login', function () {
		return driver
			.fullLogin()
	});

	it.only('Quick Login', function () {
		return driver
			.loginQuick()
	});

	//todo figure this out
	it.only('Should find element by part of the id and click', function () {
		return driver
			.elementByClassName('XCUIElementTypeTable')
			.elementsByClassName('>','XCUIElementTypeCell')
			.then(_p.clickWithIdPart('btnWalk'))
	});

	//tested and works
	it.only("should print every menu item", function () {
	  return driver
	    .elementByClassName('XCUIElementTypeTable')
	    .elementsByClassName('>','XCUIElementTypeCell')
	    .then(_p.printNames);
	});

	it('Should click home screen links', function() {
		console.log('SHOULD CLICK HOME SCREEN LINKS'.green.bold.underline)
		return commons.clickAndClose(driver, [
			elements.homeScreen.walkbooks,
			elements.homeScreen.voterLookup,
			elements.homeScreen.voterCheckIn,
			elements.homeScreen.eventCheckIn
		]);
	});

	it('reset and login', function () {
		return driver
			.resetApp()
			.fullLogin()
	});

	it('Should fail to take a survey', function () {
		console.log('SHOULD FAIL TO TAKE A SURVEY'.green.bold.underline);
		return driver
			.waitForElementById(elements.homeScreen.walkbooks, 10000).should.eventually.exist
			.startTime('Home Page to Household')
			.elementById(elements.homeScreen.walkbooks)
			.click()
			.startTime('Load Survey List')
			.waitForElementById(elements.surveys.survey1, 10000).should.eventually.exist
			.endTotalAndLogTime('Load Survey List')
			.elementById(elements.surveys.survey1)
			.click()
			.waitForElementById(elements.survey.start, 10000).should.eventually.exist
			.elementById(elements.survey.start)
			.click()
			.startTime('Load Survey')
			.then(function () {
				if (config.desired.platformName == 'Android') {
					return config.driver
								 .waitForElementById(elements.survey.list, 10000).should.eventually.exist
								 .endTotalAndLogTime('Load Survey')
				} else {
					return config.driver
								 //todo update elements.js with new walkbook ids
								 .waitForElementById(elements.survey.walkbook1, 10000).should.eventually.exist
								 .endTotalAndLogTime('Load Survey')
				}
			})
			//refresh list --todo this needs to be made specific to iOS
			.then(function () {
				console.log('REFRESHING WALKBOOK LIST'.white.bold.italic)
			})
			.then(function () {
				if (config.desired.platformName == 'Android'){
					return config.driver
								 .elementById(elements.survey.list)
								 .click()
								 .elementById(elements.actionBar.refresh)
								 .click()
				} else {
					return config.driver
								 .elementById(elements.survey.walkbook1)
								 .getLocation()
								 .then(function(loc){
								 	 return driver
								 		.swipe({
								 			startX: loc.x,
								 			startY: loc.y,
								 			endX: loc.x,
								 			endY: loc.y + 650,
								 			duration: 500
								 		})
					})
				}
			})
			.elementById(elements.survey.walkbook1)
			.click()
			.then(function () {
				if (config.desi1red.platformName == 'Android') {
					return config.driver
								 .waitForElementById(elements.walkbook.list,10000).should.eventually.exist
								 .elementById(elements.walkbook.list)
								 .click()
				} else {
					return config.driver
								 .waitForElementById(elements.survey.popoverOpenBook, 10000).should.eventually.exist
								 .elementById(elements.survey.popoverOpenBook)
								 .click()
								 .startTime('Load Walkbook')
				}
			})
			//todo update elements.js with new household ids
			.waitForElementById(elements.walkbook.household1, 10000).should.eventually.exist
			.endTotalAndLogTime('Load Walkbook')
			.elementById(elements.walkbook.household1)
			.click()
			.then(function () {
				if (config.desired.platformName == 'Android') {
					return
				} else {
					return config.driver
								 .waitForElementById(elements.walkbook.popoverOpenHouse, 10000).should.eventually.exist
								 .elementById(elements.walkbook.popoverOpenHouse)
								 .click()
				}
			})
			.endTotalAndLogTime('Home Page to Household')
			//should fail because the person is greyed out:
			.elementById(elements.houseHold.primTarget2)
			.click()
			.waitForElementById(elements.target.takeSurvey).should.eventually.exist // should fail and create screenshot
	});

	it('Login Quick', function () {
		return driver
			.loginQuick()
	});

	//do not run, this is for the demo on Tuesday
	it('Should take a survey', function () {
		console.log('SHOULD TAKE A SURVEY'.green.bold.underline);
		return driver
			.elementById(elements.homeScreen.walkbooks)
			.click()
			.elementById(elements.surveys.survey1)
			.click()
			//preview questions
			.elementById(elements.survey.previewQuestions)
			.click()
			.elementById('Back')
			.click()
			.elementById(elements.survey.start)
			.click()
			.startTime('Load Survey 2')
			.waitForelEmentById(elements.survey.walkbook1).should.eventually.exist
			.endTotalAndLogTime('Load Survey 2')
			.elementById(elements.survey.walkbook1)
			.click()
			.elementById(elements.survey.popoverOpenBook)
			.click()
			.waitForElementById('Select Walkbook') // this is the back button
			.elementById(elements.walkbook.houseHold4)
			.click()
			.elementById(elements.walkbook.popoverOpenHouse)
			.click()
			.elementById(elements.houseHold.target1)
			.click()
			.elementById(elements.target.takeSurvey)
			.click()
			.elementById(elements.takeSurvey.answer1)
			.click()
			.elementById(elements.takeSurvey.submitAnswer)
			.click()
			.elementById(elements.takeSurvey.skip)
			.click()
			.elementById(elements.takeSurvey.finish)
			.click()
			.sleep(2000)
			.resetApp()
	});

	it('Login Quick', function () {
		return driver
			.loginQuick
	});

	it('Should test survey list page: filtering, scrolling, selecting surveys', function () {
		console.log('TEST SEARCHING / FILTERING SURVEY LIST'.green.bold.underline);
		let filteredList;
		return driver
			//Test searching / filtering survey list
			.elementById(elements.homeScreen.walkbooks)
			.click()
			.elementById(elements.actionBar.search)
			.click()
			.sendKeys('Exte inclu')
			.source()
			.then(function (source){
				filteredList = source;
				filteredList.should.include('Survey with Extended info including Surveys - Custom Answers')
				// todo - negative expectation - need to figure this out since everything is there just invisible
			})

			//Can click a survey from filtered view
			.then(function() {
				console.log('CAN CLICK A SURVEY FROM FILTERED VIEW'.green.bold.underline);
			})
			.elementById('Survey with Extended info including Surveys - Custom Answers')
			.click()
			.waitForElementById(elements.survey.start).should.eventually.exist
			.elementById('Back')
			.click()

			//Filter results persist after going back
			.then(function() {
				console.log('FILTER RESULTS PERSIST AFTER GOING BACK'.green.bold.underline);
			})
			.waitForElementById('Survey with Extended info including Surveys - Custom Answers').should.eventually.exist
			.source()
			.then(function (source){
				filteredList = source;
				filteredList.should.include('Survey with Extended info including Surveys - Custom Answers')
				// filteredList.should.not.include('Copy of New Dynamic Survey')  // in iOS the
			});

			//Clear search button works and leaves keyboard open

			//Cancel search button works and closes keyboard

			//Test scrolling survey list

			//Select survey in regular view (no filter)
	});
});
