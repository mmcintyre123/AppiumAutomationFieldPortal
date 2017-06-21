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

	describe("Describe the test category...defines the group of tests specified below", function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)

		it('Quick Login', function () {
			return driver
				.loginQuick()
		});

		it('Add a note to a target', function () {
			return driver
				.homeToHouseList()
				.getHouseWithMultPrimary()
				.then(function () {
					return driver
						.getFirstListItemByIdPart(config.thisHousehold)
				})
				.then(function () {
					return driver
					    .elementById(config.thisHousehold)
					    .click()
					    .waitForElementById(elements.walkbook.popoverOpenHouse, 10000)
					    .click()
				})
				.waitForElementById(elements.houseHold.primPlus1)
				.click()
				.elementById(elements.target.addNote)
				.click()
				.elementById(elements.target.edit)
				.click()
				.sendKeys('abcdef')
		});



	});
};