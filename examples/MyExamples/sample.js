"use strict";

module.exports = function () {

	require('colors');
	let wd            = require("wd");
	let assert  	  = require('assert');
	let	_             = require('underscore');
	let	Q             = require('q');
	let	fsExtra       = require('fs-extra');
	let	fs            = require('fs');
	let stackTrace    = require('stack-trace');
	let	pry  		  = require('pryjs');
	const sql         = require('mssql');
	let	_p            = require('../helpers/promise-utils');
	let	elements      = require('../helpers/elements');
	let	actions       = require('../helpers/actions');
	let	config 		  = require('../helpers/config');
	let	serverConfigs = require('../helpers/appium-servers');
	let	commons       = require('../helpers/commons');
	let sqlQuery      = require('../helpers/queries');
	let creds         = require('../credentials');
	let	serverConfig  = process.env.SAUCE ? serverConfigs.sauce : serverConfigs.local;
	let	args  		  = process.argv.slice( 2 );
	let	simulator     = false;
	let driver        = config.driver;
	let	desired;


	describe("This is a sample script for experimentation and demonstration", function() {

		// this.timeout(3000000);
		let allPassed = true;

		function clickMenuItem(name) {
		  return driver
		    .elementByName(name)
		    .catch(function () {
		      return driver
		        .elementByClassName('XCUIElementTypeTable')
		        .elementsByClassName('>','XCUIElementTypeCell')
		        .then(_p.filterWithName(name)).first();
		    })
		    .click();
		}

		console.log('THIS IS sample.js, A SANDBOX TEST SCRIPT FOR EXPERIMENTATION AND DEMONSTRATION'.green.bold.underline)

		it('Full Login', function () {
			return driver
				.fullLogin(creds.testUserName1, creds.testUserPwd1)
		});

		it('Should run a query', function () {
			return driver
				.sleep(1)
				.then(sqlQuery.getHousesWithMoreThan1Primary)
				.then(function () {
					config.theseHouses = [];
					for (let i=0;i<config.housesWithMoreThan1Primary.length;i++){
						if(config.housesWithMoreThan1Primary[i].BookNum == 18) {
							config.theseHouses.push(config.housesWithMoreThan1Primary[i].HouseNum)
						}
					}
					eval(require('pryjs').it)
				})
		});

		it('Quick Login', function () {
			return driver
				.loginQuick()
		});

		//working 4-28-17 5:59pm --- for connecting to a single server in a test case (it statement)
		it('Should query sql', function () {
			return sql
				.connect(creds.SQLconfigMD1)
				.then(pool => {

				    // Query
					return pool
						.request()
						// .input('input_parameter', sql.Int, value)
						.query("\
							--which houses have more than one primary target\
							declare @surveyID BigInt=187164;\
							declare @helperBooks table(Value INT);INSERT INTO @helperBooks select s.booknum from i360_app_canvass.surveys.surveywalkbookassignments s(nolock)INNER JOIN i360portal.dbo.helper h(nolock)on h.helperID=s.idhelper\
							where s.idsurvey='187164'and h.LogID='1654wseward'\
							order by s.booknum asc;with Locations_CTE as(select distinct ta.locationID from I360_App_Canvass.Surveys.TargetsAssc ta(nolock)INNER JOIN I360_App_Canvass.Surveys.TargetWalkbookMap map(nolock)on map.IdSurveyTarget=ta.targetID where ta.surveyID= @surveyID and map.BookNum in(select value from @helperBooks)),Count_CTE as(select cte.locationID,SUM(ta.primaryContact)as PrimaryTargetCount,SUM(1-ta.primaryContact)as NonPrimaryTargetCount from Locations_CTE cte INNER JOIN I360_App_Canvass.Surveys.TargetsAssc ta(nolock)on ta.locationID=cte.locationID where ta.surveyID=@surveyID group by cte.locationID)select map.BookNum as'BookNum',f.seq as'HouseNum'from Count_CTE cte INNER JOIN I360_App_Canvass.Surveys.TargetsAssc ta(nolock)on ta.locationID=cte.locationID INNER JOIN I360_App_Canvass.Surveys.TargetLocations tl(nolock)on tl.targetLocationsID=ta.targetLocationsID INNER JOIN I360_App_Canvass.Surveys.Surveys s(nolock)on s.ID=ta.surveyID INNER JOIN I360_App_Canvass.Surveys.WalkBookRoutesStops f(nolock)on f.IDSurveyTarget=ta.targetID INNER JOIN I360_App_Canvass.Surveys.TargetWalkbookMap map(nolock)on map.IdSurveyTarget=ta.targetID INNER JOIN MD_Shield.dbo.Contacts c(nolock)on c.id=ta.contactID where ta.surveyID=@surveyID and map.BookNum in(select value from @helperBooks)and cte.PrimaryTargetCount>1order by map.BookNum asc,f.seq asc option(maxdop 3);return;\
						")
				})
				.then(result => {
			    	console.dir(result.recordset)
				})

				//.catch(err => {
				//	console.log('Something went wrong'.red.bold)
				//})
		});


		//passing - for if we need to check data on different servers in the same test case (it statement)
		it('Should create a sql connection pool to query two different servers in the same test case', function () {

			const pool1 = new sql.ConnectionPool(creds.SQLconfigMD1, err => {
			    // error checks can go here

			    pool1.request() // or: new sql.Request(pool1)
			    .query("declare @surveyID BigInt=187164;\
						declare @helperBooks table(Value INT);INSERT INTO @helperBooks select s.booknum from i360_app_canvass.surveys.surveywalkbookassignments s(nolock)INNER JOIN i360portal.dbo.helper h(nolock)on h.helperID=s.idhelper\
						where s.idsurvey='187164'and h.LogID='1654wseward'\
						order by s.booknum asc;with Locations_CTE as(select distinct ta.locationID from I360_App_Canvass.Surveys.TargetsAssc ta(nolock)INNER JOIN I360_App_Canvass.Surveys.TargetWalkbookMap map(nolock)on map.IdSurveyTarget=ta.targetID where ta.surveyID= @surveyID and map.BookNum in(select value from @helperBooks)),Count_CTE as(select cte.locationID,SUM(ta.primaryContact)as PrimaryTargetCount,SUM(1-ta.primaryContact)as NonPrimaryTargetCount from Locations_CTE cte INNER JOIN I360_App_Canvass.Surveys.TargetsAssc ta(nolock)on ta.locationID=cte.locationID where ta.surveyID=@surveyID group by cte.locationID)select map.BookNum as'BookNum',f.seq as'HouseNum'from Count_CTE cte INNER JOIN I360_App_Canvass.Surveys.TargetsAssc ta(nolock)on ta.locationID=cte.locationID INNER JOIN I360_App_Canvass.Surveys.TargetLocations tl(nolock)on tl.targetLocationsID=ta.targetLocationsID INNER JOIN I360_App_Canvass.Surveys.Surveys s(nolock)on s.ID=ta.surveyID INNER JOIN I360_App_Canvass.Surveys.WalkBookRoutesStops f(nolock)on f.IDSurveyTarget=ta.targetID INNER JOIN I360_App_Canvass.Surveys.TargetWalkbookMap map(nolock)on map.IdSurveyTarget=ta.targetID INNER JOIN MD_Shield.dbo.Contacts c(nolock)on c.id=ta.contactID where ta.surveyID=@surveyID and map.BookNum in(select value from @helperBooks)and cte.PrimaryTargetCount>1order by map.BookNum asc,f.seq asc option(maxdop 3);return;"
						, (err, result) => {
			        //error checks can go here
			        console.dir(result.recordset)
			    })

			})

			//pool1.on('error', err => {
			//    // ... error handler
			//})

			const pool2 = new sql.ConnectionPool(creds.SQLconfigREPORT, err => {
				// error checks can go here

			    pool2.request() // or: new sql.Request(pool2)
			    .query('SEleCt Top 1 fsr.SA_ID froM i360Reporting.Reporting.FACT_SurveyReturns fsr(nolock) inner jOin i360Reporting.Reporting.DIM_Surveys ds(nolock) On ds.SurveyKey=fsr.SurveyKey lEfT OUTeR JOIN i360Reporting.Reporting.FACT_SurveyTargets fst(nolock) ON fst.ClientOrgID=fsr.ClientOrgID and fst.IDSurvey=fsr.SV_ID And fst.IDContact=fsr.Responder_Contact_ID lefT oUTeR joIn i360Reporting.Reporting.Helper h(nolock) On h.HelperID=fsr.IDHelper wHeRE fsr.SV_ID=187764 oRDeR by fsr.ReceivedTStampGMT DEsC,fst.namegiven DEsC oPTIOn(MAxdOp 1);'
			    	    , (err, result) => {
			        //error checks can go here
			        console.dir(result.recordset)
			    })
			})

			//pool2.on('error', err => {
			//    // ... error handler
			//})

		});

		//tested and works
		it("should print every menu item", function () {
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
				.fullLogin(creds.testUserName1, creds.testUserPwd1)
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
				.loginQuick()
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
				.waitForElementByClassName('XCUIElementTypeTable', 10000)
				.endTotalAndLogTime('Load Survey 2')
				.elementById('Walkbook 1')
				.click()
				.elementById(elements.survey.popoverOpenBook)
				.click()
				.waitForElementByClassName('XCUIElementTypeTable', 10000)
				.scrollHouseList(15)
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
};