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
		config.lastCreatedVolunteer = {};

		it('Quick Login', function () {
			return driver
				.loginQuick()
		});

		it('Should add a volunteer', function () {
			let firstName = 'First' + config.dateTime;
			let lastName  = 'Last' + config.dateTime;
			let email = firstName + '.' + lastName + '@callingfromhome.com'
			let state = 'AL'

			let firstNameReg = new RegExp(firstName)
			let lastNameReg = new RegExp(lastName)
			let emailReg = new RegExp(email)
			let stateReg = new RegExp(state)

			config.userId = {}

			return driver
				.elementById(elements.homeScreen.volunteers)
				.click()
				.waitForElementById(elements.actionBar.addVolunteer, 15000)
				.click()
				.waitForElementById(elements.addVolunteer.firstName, 15000)
				.click()
				.sendKeys(firstName)
				.elementById(elements.addVolunteer.lastName)
				.click()
				.sendKeys(lastName)
				.elementByXPath(elements.addVolunteer.state) // state
				.click()
				.elementById(elements.addVolunteer.done) // todo scroll state list before picking
				.click()
				.elementById(elements.addVolunteer.email)
				.click()
				.sendKeys(email)
				.elementById(elements.actionBar.save)
				.click()
				.waitForElementById(elements.volunteers.active, 90000)

				//verify volunteer appears in database:
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
			config.lastCreatedVolunteer[0].firstname.should.match(firstNameReg)
		});

		it('Last name was as expected', function () {
			config.lastCreatedVolunteer[0].lastname.should.match(lastNameReg)
		});

		it('State was as expected', function () {
			config.lastCreatedVolunteer[0].state.should.match(stateReg)
		});

		it('Email was as expected', function () {
			config.lastCreatedVolunteer[0].email.should.match(emailReg)
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

		it('LogID was as expected', function () {
			config.lastCreatedVolunteer[0].logid.should.match(/^1594.FLast06_23T15_38$/)
		});

	});
};