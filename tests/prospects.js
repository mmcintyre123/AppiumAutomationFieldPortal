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

	describe("All Prospect-related tests", function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)
		let firstName, lastName, fullName, email, state, phone;
		config.searchResults = []

		it('Full Login', function () {
			this.retries = 1
			return driver
				.fullLogin()
		});
		//it('Quick Login', function () {
		//	return driver
		//		.loginQuick()
		//});

		it('Navigate to prospects list (prospects tab highlighted after selecting)', function () {
			return driver
				.elementById(elements.homeScreen.volunteers)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.volunteers.prospects,10000)
				.click()
				.sleep(2000) // time for tab to select
				.elementById(elements.volunteers.prospects)
				.then(function (el) {
					return el.getAttribute('value').then(function (value) {
						assert.equal(value,1)
					})
				})
		});

		it('Open prospect details', function () {
			return driver
				.elementById(elements.prospects.prospect1.prospect1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById('Prospect Details', 20000)
		});

		it('Save prospect information', function () {
			return driver
				.waitForElementByXPath(elements.prospectDetails.firstAndLastName, 10000) //first and last name
				.then(function (el) {
					return el.getAttribute('name').then(function name(attr) {
						if (attr != null) {
							fullName = attr.trim();
						}
						if (attr != null) {
							firstName = attr.trim().split(/\s+/).shift();
						}
						if (attr != null) {
							lastName = attr.trim().split(/\s+/).pop();
						}
					})
				})

//				Can't test this yet - todo - need accessibility ID to not replace the actual element value / text you see.				
//				.elementById(elements.prospectDetails.email)
//				.then(function (el) {
//					return el.getAttribute('name').then(function name(attr) {
//						if (attr.length >= 6 && attr != 'tvEmail') { // we'll replace the email if it's less than 6 characters or not present (in which case equals the element id tvEmail). 6 chars should be the absolute minimum length of an email - e.g.: a@b.co
//							email = attr.trim();
//						}
//					})
//				})
//				.elementById(elements.prospectDetails.phone)
//				.then(function (el) {
//					return el.getAttribute('value').then(function (attr) {
//						if (attr != null) {
//							phone = attr.trim();
//						}
//					})
//				})

				// find the state - todo simplify this when the IDs are fixed.
				.elementByXPath('//*/XCUIElementTypeOther/XCUIElementTypeScrollView')
				.source()
				.then(function (source) { 
					let filteredList = source;
					let stateZip = filteredList.match(/[\w]{2}\s[\d]{5}/ig)
					if (stateZip != null) {
						state = stateZip[0].match(/^(\w+)/ig)[0];
					}
				})
		});

		it('Turn a prospect into a volunteer', function () {
			return driver
				.elementById(elements.actionBar.addAsVol)
				.click()
				.waitForElementById(elements.actionBar.save, 10000)
				.then(function () {
					if (!email) { // if email blank or undefined
						return driver
							.elementById(elements.addVolunteer.email)
							.click()
							.clear()
							.sendKeys(firstName + '.' + lastName + (Math.floor(Math.random() * 10000)) + '@callingfromhome.com')
							.elementById(elements.addVolunteer.email)
							.then(function (el) {
								return el.getAttribute('name').then(function (attr) {
									email = attr.trim()
								})
							})
					}
				})
				.elementById(elements.actionBar.save)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.actionBar.edit, 20000)
				.then(function () {
					config.homeScreenStats[0].activecount +=1
					config.homeScreenStats[0].volunteerbase += 1
				})
		});

		it('On Volunteer Details after turning Prospect into Volunteer', function () {
			return driver
				.waitForElementById('Volunteer Details', 10000)
		});

		it('Compare Volunteer Info :: Former Prospect Info -- FIRST and LAST NAME match', function () {
			return driver
				// verify info based on prospect info above
				.elementByXPath(elements.vol_details.firstAndLastName) //first and last name
				.then(function (el) {
					return el.getAttribute('name').then(function name(attr) {
						console.log('Actual name: ' + attr.trim() + ' Expected name: ' + firstName + ' ' + lastName)
						assert.equal(attr.trim().split(/\s+/).shift(), firstName)
						assert.equal(attr.trim().split(/\s+/).pop(), lastName)
					})
				})
		});

		it.skip('Compare Volunteer Info :: Former Prospect Info -- EMAIL matches', function () {
			return driver
				.elementById(elements.vol_details.email)
				.then(function (el) {
					return el.getAttribute('name').then(function name(attr) {
						console.log('Actual email: ' + attr.trim() + ' Expected email: ' + email)
						assert.equal(attr.trim(), email)
					})
				})
		});

		it.skip('Compare Volunteer Info :: Former Prospect Info -- PHONE matches', function () {
			return driver
				.elementById(elements.vol_details.phone)
				.then(function (el) {
					return el.getAttribute('value').then(function (attr) {
						if (attr != null) {
							console.log('Actual phone: ' + attr.trim() + ' Expected phone: ' + phone)
							assert.equal(attr.trim(), phone)
						}
					})
				})
		});

		it('Compare Volunteer Info :: Former Prospect Info -- STATE matches', function () {
			return driver
				.elementByXPath(elements.vol_details.address) // use this to get the state
				.then(function (el) {
					return el.getAttribute('name').then(function name(attr) {
						console.log('Actual state: ' + attr.trim() + ' Expected state: ' + state)
						assert.equal(attr.trim().match(/[A-Z]{2}(?=\s[\d]{5})/g)[0], state)
					})
				})
		});
		
		it('On Prospect list after returning from Vol Details, after prospect made a volunteer', function () {
			return driver
				.back()
				.waitForElementById(elements.volunteers.prospects,10000)
				.then(function (el) {
					return el.getAttribute('value').then(function (value) {
						console.log('Actual value: ' + value + ' Expected value: ' + 1)
						assert.equal(value,1)
					})
				})
		});
		
		it('On Home Screen', function () {
			return driver
				.back()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.homeScreen.volunteers, 15000)
		});
		
		it('Prospect made into Volunteer appears in active volunteer list', function () {
			return driver
				.elementByIdOrNull(elements.homeScreen.volunteers) // ensure we're on the login screen, if not, reset app
				.then(function (el) {
					if (el == null) {
						return driver
							.resetApp()
							.loginQuick()
					}
				})
				.elementById(elements.homeScreen.volunteers)
				.click()
				.waitForElementById(elements.actionBar.search, 10000)
				.click()
				.sendKeys(fullName.trim())
				.sleep(1000) // make sure automation not too fast - wait for results (should be instant)
				.elementByXPath(elements.volunteers.volunteer1.fullName)
				.then(function (el) {
					return el.getAttribute('name').then(function (name) {
						assert.equal(name.trim(), fullName.trim())
					})
				})
		});
	});
};