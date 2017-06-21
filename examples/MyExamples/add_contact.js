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

	describe("Test adding and editing contacts and related actions", function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1) + ' for iOS').green.bold.underline);

		it('Should search for a contact and see results', function () {
			return driver
				.loginQuick()
				.elementById(elements.homeScreen.voterLookup)
				.click()
				.elementById(elements.voterLookup.last_name)
				.click()
				.sendKeys('Smith')
				.hideKeyboard()
				.elementById(elements.voterLookup.search)
				.click()
				.waitForElementById(elements.voterLookupResults.table, 20000)
		});

		it('Should add a tag', function () {
			let thisCategory = '';
			let thisTag = '';
			return driver
				.elementById(elements.voterLookupResults.voter1)
				.click()
				.waitForElementById(elements.voterDetail.addTag.addTag, 20000)
				.click()
				.elementById(elements.voterDetail.addTag.category1)
				.then(function getCategoryName (el) {
					return el.getAttribute('value').then(function(value) {
						thisCategory = value;
					})
				})
				.elementById(elements.voterDetail.addTag.category1)
				.click()
				.elementById(elements.voterDetail.addTag.tag1)
				.then(function getCategoryName (el) {
					return el.getAttribute('value').then(function(value) {
						thisTag = value;
					})
				})
				.elementById(elements.voterDetail.addTag.tag1)
				.click()
				.elementById(elements.voterDetail.addTag.done)
				.click()
				.waitForElementById(thisCategory,10000)
				.waitForElementById(thisTag,10000)
		});

		it.only('Should add a contact', function () {
			// on the 
			return driver
				.resetApp()
				.loginQuick()
				.elementById(elements.homeScreen.voterLookup)
				.click()
				.elementById(elements.voterLookup.add_contact)
				.click()
				.waitForElementById('First Name')
					.click()
					.sendKeys('First123')
				.elementById('Last Name')
					.click()
					.sendKeys('Last123')
				.elementById('etDOB')
					.click()
					.sendKeys('01/01/1975')
				.elementById('City')
					.click()
					.sendKeys('San Francisco')
				.elementById('etEmail')
					.click()
					.sendKeys('First123.Last123@callingfromhome.com')
				.elementById('voterLookupAddEdit_btnDone')
					.click()
				.waitForElementById(elements.voterDetail.addTag.addTag, 10000)
		});

		it('', function () {
			
		});


		
	});
};