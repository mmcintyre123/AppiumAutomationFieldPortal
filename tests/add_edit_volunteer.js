"use strict";

module.exports = function () {

	require('colors');
	let   wd            = require("wd");
	let   assert        = require('assert');
	let   asserters     = wd.asserters;
	let   _             = require('underscore');
	let   childProcess  = require( 'child_process' );
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
	describe("Tests adding and editing volunteers and related actions", function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)

		it('Set variables for test', function () {
			// because beforeAll needs to run before we set these due to the need to have dateTime defined.
			return driver
				.sleep(1)
				.then(function () {
					config.lastCreatedVolunteer = {};
					config.userId = {}
					config.firstName = 'First' + config.dateTime;
					config.lastName  = 'Last' + config.dateTime;
					config.fullName = config.firstName + ' ' + config.lastName
					config.email = config.firstName + '.' + config.lastName + '@callingfromhome.com'
					config.state = 'AL'
					config.firstNameReg = new RegExp(config.firstName)
					config.lastNameReg = new RegExp(config.lastName)
					config.emailReg = new RegExp(config.email)
					config.stateReg = new RegExp(config.state)
				})
		});

		it('Quick Login', function () {
			return driver
				.loginQuick()
		});

		it('Open Volunteers, Add Volunteer', function () {
			return driver
				.elementById(elements.homeScreen.volunteers)
				.click()
				.waitForElementById(elements.actionBar.addVolunteer, 30000)
				.click()
		});

		it('Add a volunteer', function () {
			return driver
				.waitForElementById(elements.addVolunteer.firstName, 15000)
				.click()
				.sendKeys(config.firstName)
				.elementById(elements.addVolunteer.lastName)
				.click()
				.sendKeys(config.lastName)
				.elementByXPath(elements.addVolunteer.state) // state
				.click()
				.elementById(elements.addVolunteer.done) // todo scroll state list before picking
				.click()
				.elementById(elements.addVolunteer.email)
				.click()
				.sendKeys(config.email)
				.elementById(elements.actionBar.save)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.volunteers.active, 60000)
		});

		it('Volunteer appears in list', function () {

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
						assert.equal((config.fullName), name)
					})
				})
		});

		//todo add check for state and email appearing under the name in the list

		it('Get new volunteer info from sql', function () {
			return driver
				.sleep(1)
				.then(function () {
					sqlQuery.getUserId()
				})
				.wait_for_sql('getUserId', 'userId')
				.then(function(){
					sqlQuery.getLastCreatedVolunteer()
				})
				.wait_for_sql('getLastCreatedVolunteer','lastCreatedVolunteer')
		});

		it('Volunteer id was created', function () {
			config.lastCreatedVolunteer[0].id.should.match(/\d+/)
		});

		it('Contact id was created', function () {
			config.lastCreatedVolunteer[0].contactid.should.match(/\d+/)
		});

		it('First name was as expected', function () {
			config.lastCreatedVolunteer[0].firstname.should.match(config.firstNameReg)
		});

		it('Last name was as expected', function () {
			config.lastCreatedVolunteer[0].lastname.should.match(config.lastNameReg)
		});

		it('State was as expected', function () {
			config.lastCreatedVolunteer[0].state.should.match(config.stateReg)
		});

		it('Email was as expected', function () {
			config.lastCreatedVolunteer[0].email.should.match(config.emailReg)
		});

		it('Volunteer was active as expected', function () {
			config.lastCreatedVolunteer[0].active.should.match(/^true$/)
		});

		it('Volunteer status = 1 as expected', function () {
			config.lastCreatedVolunteer[0].status.should.match(/^1$/)
		});

		//todo make this programmatic
		it('Coordinator was as expected', function () {
			config.lastCreatedVolunteer[0].coordinator.should.match(/^B93EFF44-69F9-4FD8-925C-518B74206895$/)
		});

		it('lastupdatedby was as expected', function () {
			config.lastCreatedVolunteer[0].lastupdatedby.should.match(/^B93EFF44-69F9-4FD8-925C-518B74206895$/)
		});

		//todo build this from first and last name and org.
		//it('LogID was as expected', function () {
		//	config.lastCreatedVolunteer[0].logid.should.match(/^1594.FLast06_23T15_38$/)
		//});

	});
};