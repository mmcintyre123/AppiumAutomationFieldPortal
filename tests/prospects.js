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

		it('Login Quick', function () {
			return driver
				.loginQuick()
		});

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
						fullName = attr;
						firstName = attr.split(/\s+/).shift()
						lastName = attr.split(/\s+/).pop()
					})
				})
				.elementById(elements.prospectDetails.email)
				.then(function (el) {
					return el.getAttribute('name').then(function name(attr) {
						email = attr;
					})
				})
				.elementById(elements.prospectDetails.phone)
				.then(function (el) {
					return el.getAttribute('value').then(function (attr) {
						phone = attr;
					})
				})
				.elementByXPath(elements.prospectDetails.address)
				.then(function (el) {
					return el.getAttribute('name').then(function name(attr) {
						state = attr.match(/\w+(?=[\s]{1})/g)[0]
					})
				})
		});

		it('Turn a prospect into a volunteer', function () {
			return driver
				.elementById(elements.actionBar.addAsVol)
				.click()
				.waitForElementById(elements.actionBar.save, 10000)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.actionBar.edit, 20000)
		});

		it('On Volunteer Details after turning Prospect into Volunteer', function () {
			return driver
				.waitForElementById('Volunteer Details', 10000)
		});

		it('Compare Volunteer Info :: Former Prospect Info -- FIRST and LAST NAME match', function () {
			return driver
				// verify info based on prospect info above
				.elementByXPath('//*/XCUIElementTypeOther/XCUIElementTypeScrollView/XCUIElementTypeStaticText[1]') //first and last name
				.then(function (el) {
					return el.getAttribute('name').then(function name(attr) {
						assert.equal(firstName.trim(), attr.split(/\s+/).shift().trim())
						assert.equal(lastName.trim(), attr.split(/\s+/).pop().trim())
					})
				})
		});

		it('Compare Volunteer Info :: Former Prospect Info -- EMAIL matches', function () {
			return driver
				.elementById(elements.vol_details.email)
				.then(function (el) {
					return el.getAttribute('name').then(function name(attr) {
						assert.equal(email, attr)
					})
				})
		});

		it('Compare Volunteer Info :: Former Prospect Info -- PHONE matches', function () {
			return driver
				.elementById(elements.vol_details.phone)
				.then(function (el) {
					return el.getAttribute('value').then(function (attr) {
						assert.equal(phone, attr)
					})
				})
		});

		it('Compare Volunteer Info :: Former Prospect Info -- STATE matches', function () {
			return driver
				.elementByXPath('//*/XCUIElementTypeOther/XCUIElementTypeScrollView/XCUIElementTypeStaticText[3]') //state
				.then(function (el) {
					return el.getAttribute('name').then(function name(attr) {
						assert.equal(state, attr.match(/\w+(?=[\s]{1})/g)[0])
					})
				})
				.back()
		});
		
		it('On Prospect list after returning from Vol Details, after prospect made a volunteer', function () {
			return driver
				.waitForElementById(elements.volunteers.prospects,10000)
				.then(function (el) {
					return el.getAttribute('value').then(function (value) {
						assert.equal(value,1)
					})
				})
				.back()
		});
		
		it('On Home Screen', function () {
			return driver
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
						assert.equal((fullName.trim()), name.trim())
					})
				})
		});
	});
};