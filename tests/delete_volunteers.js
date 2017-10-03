"use strict";

module.exports = function () {
	
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

	describe("Describe the test category...defines the group of tests specified below", function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)
		let fullName, firstName, lastName;

		it.skip('Full Login', function () {
			this.retries = 1
			return driver
				.fullLogin() // when no args passed, uses credentials supplied via command line (process.argv.slice(2))
		});

		it('Login Quick', function () {
			this.retries = 1
			return driver
				.loginQuick()
		});

		///first test
		it('Navigate to active volunteer list - tab is selected by default', function () {
			return driver
				.elementById(elements.homeScreen.volunteers)
                .click()
                .waitForElementToDisappearByClassName(elements.general.spinner)
                .waitForElementById(elements.volunteers.active,10000)
                .then(el => driver.is_visible(el).is_selected(el))
		});
		
		it('Open active volunteer details', function () {
			return driver
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
		});

		it('Save volunteer information', function () {
			return driver
                .waitForElementByXPath(elements.vol_details.firstAndLastName, 10000) //first and last name
                .getAttribute('name')
                .then((name) => {
                    fullName = name.trim();
                    firstName = name.trim().split(/\s+/).shift()
                    lastName = name.trim().split(/\s+/).pop()
                })
                .back()
                .waitForElementById(elements.volunteers.active, 5000)
		});

        it('On Active tab after going back', function () {
            return driver
                .elementByIdOrNull(elements.volunteers.active)
                .then(el => driver.recoverFromFailuresVolunteers(el))
                .elementById(elements.volunteers.active)
                .then(el => driver.is_selected(el))
        });
		
		it('Delete a volunteer from active list - Do Not Contact', function () {
			return driver
				.elementById(elements.actionBar.select)
				.click()
				.elementById(fullName)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.doNotContact)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});
		
		it('Volunteer no longer exists in the active tab', function () {
            return driver
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then(el => driver.is_not_visible(el))
                .then(function () {
                    config.homeScreenStats[0].activecount     -= 1
                    config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    config.homeScreenStats[0].inactivecount   += 1
                    config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                })
		});
		
		it('Active tab visible and selected after cancelling search', function () {
			return driver
				.elementById(elements.actionBar.cancel)
				.click()
				.elementById(elements.volunteers.active)
				.then(el => driver.is_visible(el).is_selected(el))
		});

		///second test
		it('Save Volunteer Info', function () {
				return driver
					.elementByIdOrNull(elements.volunteers.volunteer1.volunteer1)
					.then(el => driver.recoverFromFailuresVolunteers(el))
					.elementById(elements.volunteers.volunteer1.volunteer1)
					.click()
					.waitForElementToDisappearByClassName(elements.general.spinner)
					.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
					.waitForElementByXPath(elements.vol_details.firstAndLastName, 5000) //first and last name
					.getAttribute('name')
					.then((name) => {
						fullName = name.trim();
						firstName = name.trim().split(/\s+/).shift()
						lastName = name.trim().split(/\s+/).pop()
					})
					.back()
					.waitForElementById(elements.volunteers.active, 5000)
					.then(el => driver.is_selected(el))
		});
		
		it('Delete a volunteer from active list - Not Interested', function () {
			return driver
				//on active tab
				.elementById(elements.actionBar.select)
				.click()
				.elementById(fullName)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.notInterested)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('Volunteer no longer exists in the active tab', function () {
            return driver
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then(el => driver.is_not_visible(el))
                .then(function () {
                    config.homeScreenStats[0].activecount     -= 1
                    config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    config.homeScreenStats[0].inactivecount   += 1
                    config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                })
				.elementById(elements.actionBar.cancel)
				.click()
		});
		
		//TODO refresh to ensure the vol was actually deleted
		//TODO check the database to ensure vol was updated correctly - deleted and marked notInterested.
		
		///third test
		it('Save Volunteer Info', function () {
			return driver
				.elementByIdOrNull(elements.volunteers.volunteer1.volunteer1)
				.then(el => driver.recoverFromFailuresVolunteers(el))
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
				.waitForElementByXPath(elements.vol_details.firstAndLastName, 5000) //first and last name
				.getAttribute('name')
				.then((name) => {
					fullName = name.trim();
					firstName = name.trim().split(/\s+/).shift()
					lastName = name.trim().split(/\s+/).pop()
				})
				.back()
				.waitForElementById(elements.volunteers.active, 5000)
				.then(el => driver.is_selected(el))
		});
		
		it('Delete a volunteer from active list - Moved', function () {
			return driver
				//on active tab
				.elementById(elements.actionBar.select)
				.click()
				.elementById(fullName)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.moved)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('Volunteer no longer exists in the active tab', function () {
			return driver
				.elementById(elements.actionBar.search)
				.click()
				.sendKeys(fullName)
				.sleep(500) // wait for results (should be instant)
				.elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then(el => driver.is_not_visible(el))
				.then(function () {
					config.homeScreenStats[0].activecount     -= 1
					config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
					config.homeScreenStats[0].inactivecount   += 1
					config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
				})
				.elementById(elements.actionBar.cancel)
				.click()
		});

		///fourth test
		it('Save Volunteer Info', function () {
			return driver
				.elementByIdOrNull(elements.volunteers.volunteer1.volunteer1)
				.then(el => driver.recoverFromFailuresVolunteers(el))
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
				.waitForElementByXPath(elements.vol_details.firstAndLastName, 5000) //first and last name
				.getAttribute('name')
				.then((name) => {
					fullName = name.trim();
					firstName = name.trim().split(/\s+/).shift()
					lastName = name.trim().split(/\s+/).pop()
				})
				.back()
				.waitForElementById(elements.volunteers.active, 5000)
				.then(el => driver.is_selected(el))
		});
		
		it('Delete a volunteer from active list - Other', function () {
			return driver
				//on active tab
				.elementById(elements.actionBar.select)
				.click()
				.elementById(fullName)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.other)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('Volunteer no longer exists in the active tab', function () {
			return driver
				.elementById(elements.actionBar.search)
				.click()
				.sendKeys(fullName)
				.sleep(500) // wait for results (should be instant)
				.elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then(el => driver.is_not_visible(el))
				.then(function () {
					config.homeScreenStats[0].activecount     -= 1
					config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
					config.homeScreenStats[0].inactivecount   += 1
					config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
				})
				.elementById(elements.actionBar.cancel)
				.click()
		});

		///fifth test
		it('Delete multiple volunteers from active list - Other', function () {
			return driver

		});


		///sixth test
		it('Delete active volunteer from Volunteer Details - Do Not Contact', function () {
			return driver

		});

		it('Delete active volunteer from Volunteer Details - Not Interested', function () {
			return driver

		});

		it('Delete active volunteer from Volunteer Details - Moved', function () {
			return driver

		});

		it('Delete active volunteer from Volunteer Details - Other', function () {
			return driver

		});

		// DUPLICATE ALL OF THE ABOVE FOR INACTIVE VOLUNTEERS
		


	});
};