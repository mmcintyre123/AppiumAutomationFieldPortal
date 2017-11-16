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

	describe("Describe the test category...defines the group of tests specified below".bgYellow.black, function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)

		it('Full Login'.bgWhite.blue, function () {
			this.retries = 1
			return driver
				.fullLogin() // when no args passed, uses credentials supplied via command line (process.argv.slice(2))
		});

		it('Should do what...'.bgWhite.blue, function () {
			return driver




		});



	});
};