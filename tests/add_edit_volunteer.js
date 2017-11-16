"use strict";

module.exports = function () {

	//vars
	require('colors');
		let   wd            = require("wd");
		let   assert        = require('assert');
		let   asserters     = wd.asserters;
		let   cities        = require('cities');
		let   counties      = require('us-zcta-counties');
		let   _             = require('underscore');
		let   childProcess  = require('child_process');
		let   clip          = require('clipboardy');
		let   Q             = require('q');
		let   fsExtra       = require('fs-extra');
		let   fs            = require('fs');
		let   pry           = require('pryjs');
		const sql           = require('mssql');
		let   _p            = require('../helpers/promise-utils');
		let   elements      = require('../helpers/elements');
		let   actions       = require('../helpers/actions');
		let   store         = require('../helpers/store');
		let   config        = require('../helpers/config');
		let   serverConfigs = require('../helpers/appium-servers');
		let   creds         = require('../credentials');
		let   sqlQuery      = require('../helpers/queries');
		let   serverConfig  = process.env.SAUCE ? serverConfigs.sauce : serverConfigs.local;
		let   args          = process.argv.slice( 2 );
		let   simulator     = false;
		let	desired;
		let driver = config.driver;
		let	commons = require('../helpers/commons'); // this must be after the desired and driver are set

	//todo verify volunteer added in UI, active tab
	describe("Tests adding and editing volunteers and related actions".bgYellow.black, function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)

		it('Sets variables for test'.bgWhite.blue, function () {
			// because beforeAll needs to run before we set these due to the need to have dateTime defined.
			return driver
				.sleep(1)
				.then(function () {
					config.lastCreatedVolunteer = {};
					config.firstName            = 'First' + config.dateTime;
					config.lastName             = 'Last' + config.dateTime;
					config.fullName             = config.firstName + ' ' + config.lastName
					config.email                = config.firstName + '.' + config.lastName + '@callingfromhome.com'
					config.state                = 'AL'
					config.firstNameReg         = new RegExp(config.firstName)
					config.lastNameReg          = new RegExp(config.lastName)
					config.emailReg             = new RegExp(config.email)
					config.stateReg             = new RegExp(config.state)

					let theseCities = cities.findByState(config.state).filter(function nonBlanks (city) {
						return city.city != '' && city.zipcode != ''
					})
					let rand = Math.floor((Math.random() * theseCities.length) + 0);
					config.thisCity = theseCities[rand].city
					config.thisZip = theseCities[rand].zipcode
					config.thisCounty = counties.find({zip: config.thisZip}).county
				})
		});

		it('Full Login'.bgWhite.blue, function () {
			this.retries = 1

			return driver
				.fullLogin()
		});

		it('Open Volunteers, Add Volunteer'.bgWhite.blue, function () {
			return driver
				.elementById(elements.homeScreen.volunteers)
				.click()
				.waitForElementById(elements.actionBar.addVolunteer, 30000)
				.click()
		});

		it('Add a volunteer'.bgWhite.blue, function () {
			return driver
				.waitForElementById(elements.addEditVolunteer.firstName, 15000)
					.click()
					.sendKeys(config.firstName)
				.elementById(elements.addEditVolunteer.lastName)
					.click()
					.sendKeys(config.lastName)
				.elementById(elements.addEditVolunteer.city)
					.click()
					.sendKeys(config.thisCity) // random city
				.elementByXPath(elements.addEditVolunteer.state)
					.click()
					.elementById(elements.addEditVolunteer.done) // todo scroll state list before picking
					.click()
				.elementById(elements.addEditVolunteer.zip)
					.click()
					.sendKeys(config.thisZip)
				.elementById(elements.addEditVolunteer.county)
					.click()
					.sendKeys(config.thisCounty)
				.elementById(elements.addEditVolunteer.email)
					.click()
					.sendKeys(config.email)
				.elementByXPath(elements.addEditVolunteer.coord)
				.getAttribute('value')
				.then((value) => { config.expectedCoordinator = value; }) // set expectedCoordinator
				.then(() => { sqlQuery.getUserId(config.expectedCoordinator) }) // get userId of expectedCoordinator
				.wait_for_sql('getUserId', 'userId')
				.then(() => { config.userIdReg = new RegExp(config.userId[0].userid) }) // set userIdReg for config.expectedCoordinator
				.elementById(elements.actionBar.save)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.volunteers.active, 60000)
				.then(function () {
					config.homeScreenStats[0].volunteerbase +=1
					config.homeScreenStats[0].activecount +=1
					console.log('volunteerbase and activecount should now be ' + config.homeScreenStats[0].volunteerbase + ', ' + config.homeScreenStats[0].activecount + ' respectively.')
				})
		});

		//todo finish this
		it.skip('Add a volunteer in a different state', function () {
			//try this new method! mobile: selectPickerWheelValue
			return driver
				.elementByIdOrNull(elements.actionBar.addVolunteer)
				.then(function (el) {
					if (el == null) {
						return driver
							.resetApp()
							.loginQuick()
							.elementById(elements.homeScreen.volunteers)
							.click()
							.waitForElementById(elements.actionBar.addVolunteer,10000)
					}
				})
				.click()
		});

		it('Volunteer appears in "Active" list'.bgWhite.blue, function () {
			return driver
				.elementByIdOrNull(elements.volunteers.active)
				.then(function (el) {
					if (el == null) {
						return driver
							.resetApp()
							.loginQuick()
							.elementById(elements.homeScreen.volunteers)
							.click()
					}
				})
				.elementById(elements.actionBar.search)
				.click()
				.sendKeys(config.fullName)
				.sleep(1000) // make sure automation not too fast - wait for results (should be instant)
				.elementByXPath(elements.volunteers.volunteer1.fullName)
				.then(function (el) {
					return el.getAttribute('name').then(function (name) {
						assert.equal(name, config.fullName)
					})
				})
		});

		//todo add check for state and email appearing under the name in the list
		
		it('Get new volunteer info from sql'.bgWhite.blue, function () {
			return driver
				.sleep(1)
				.then(function () {
					sqlQuery.getUserId(config.thisUser)
				})
				.wait_for_sql('getUserId', 'userId')
				.then(function(){
					sqlQuery.getLastCreatedVolunteer()
				})
				.wait_for_sql('getLastCreatedVolunteer','lastCreatedVolunteer')
		});

		it('Volunteer id was created'.bgWhite.blue, function () {
			config.lastCreatedVolunteer[0].id.should.match(/\d+/)
		});

		it('Contact id was created'.bgWhite.blue, function () {
			config.lastCreatedVolunteer[0].contactid.should.match(/\d+/)
		});

		it('First name was as expected'.bgWhite.blue, function () {
			config.lastCreatedVolunteer[0].firstname.should.match(config.firstNameReg)
		});

		it('Last name was as expected'.bgWhite.blue, function () {
			config.lastCreatedVolunteer[0].lastname.should.match(config.lastNameReg)
		});

		it('State was as expected'.bgWhite.blue, function () {
			config.lastCreatedVolunteer[0].state.should.match(config.stateReg)
		});

		it('Email was as expected'.bgWhite.blue, function () {
			config.lastCreatedVolunteer[0].email.should.match(config.emailReg)
		});

		//todo finish this
		it.skip('County was as expected'.bgWhite.blue, function () {
			config.lastCreatedVolunteer[0].county.should.match(/^1$/)
		});

		it('Volunteer was active as expected'.bgWhite.blue, function () {
			config.lastCreatedVolunteer[0].active.should.match(/^true$/)
		});

		it('Volunteer status = 1 as expected'.bgWhite.blue, function () {
			config.lastCreatedVolunteer[0].status.should.match(/^1$/)
		});


		//todo store the default selected coordinator from the app and verify with that instead of config.userIdReg
		it.skip('Coordinator is the value that was pre-populated when creating the volunteer', function () {
			return driver
				.sleep(1)
				.then(() => {
					sqlQuery.getUserGeo()
				})
				.wait_for_sql('getUserGeo','userGeoInfo')
				.then(() => {
					console.log('\nUser Geo info:\n'.green.bold); //todo remove
					console.dir(config.userGeoInfo); //todo remove
					console.log('\n'); //todo remove
					config.lastCreatedVolunteer[0].coordinator.should.match(config.userIdReg) // config.expectedCoordinator
				})
				.catch(function(err){
					if (config.userGeoInfo) {
						// there was some user Geo for the current state and org
						console.log('There was user Geography Info:\n'.red.bold);
						console.dir(config.userGeoInfo);
					} else {
						console.log('There was no User Geogrpahy info.'.red.bold);
					}
					console.log('Volunteer\'s coordinator was not the pre-populated value.  See error below.\n'.red.bold);
					throw new Error(err)
				})
				.finally(()=>{
					//set config.userid back to the current user todo - alternatively create a special config value for this.
					return driver
						.sleep(1)
						.then(() => {
							sqlQuery.getUserId(config.thisUser)
						})
						.wait_for_sql('getUserId','userId')
						.then(() => { config.userIdReg = new RegExp(config.userId[0].userid) }) // set userIdReg for config.expectedCoordinator
				})
		});
		
		it.skip('When there\'s no user geography info the coordinator is the logged in user', function () {
			if (config.userGeoInfo) {
				console.log('Skipping test');
				this.skip //this condition covered in test case above
			} else {
				config.lastCreatedVolunteer[0].coordinator.should.match(config.userIdReg)
			}
		});
		
		it('lastupdatedby was as expected'.bgWhite.blue, function () {
			config.lastCreatedVolunteer[0].lastupdatedby.should.match(config.userIdReg)
		});

		it('LogID was as expected'.bgWhite.blue, function () {
			let logId = config.databaseNameAndServer[0].orgid + '.' + config.firstName.substring(0,1) + config.lastName;
			let logIdReg = new RegExp(logId)
			config.lastCreatedVolunteer[0].logid.should.match(logIdReg)
		});

	});
};