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

	describe("Should test portal login and demonstrate clicking around", function () {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1) + ' for iOS').green.bold.underline);

		it('Should log in to portal', function () {
			return driver
				.contexts().then(function(contexts) {
					console.log(contexts)
					return driver.context(contexts[1])
				})
				.get('https://test-portalv3.i-360.com')
				.waitForElementById('username')
				.click()
				.sendKeys('mmcintyre')
				.elementById('password')
				.sendKeys('qwerty09')
				.elementById('Login1_Button1')
				.click()
		});

		it('Should start a type 2 (MyData) search and then logout', function () {
			return driver
				.waitForElementById('ctl15_imgMasterHdrLogo')
				.get('https://test-portalv3.i-360.com/MobileMenu.aspx#Search')
				.get('https://test-portalv3.i-360.com/Search/Search/StandardSearch.aspx')
				.waitForElementById('MainContent_rblSearchType_1')
				.click()
				.elementById('btnStartClose')
				.click()
				.sleep(4000)
				.get('https://test-portalv3.i-360.com/MobileMenu.aspx#Misc')
				.waitForElementById('accordionMenu')
				.get('https://test-portalv3.i-360.com/Logout.aspx')
		});


	});
};