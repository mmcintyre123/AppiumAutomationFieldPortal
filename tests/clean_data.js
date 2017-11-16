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

	describe("Remove Salutations and Suffices and perform any other data cleansing tasks before running automation".bgYellow.black, function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)

		it('Full Login'.bgWhite.blue, function () {
			this.retries = 1
			return driver
				.fullLogin() // when no args passed, uses credentials supplied via command line (process.argv.slice(2))
		});

		it('Should remove salutations and suffices from prospects'.bgWhite.blue, function () {
			return driver
				.sleep(1)
				.then(function () {
					sqlQuery.removeSalsAndSufficesProspects()
				})
				.wait_for_sql('removeSalsAndSufficesProspects','removalResultsProspects')
		});

        it('Should remove salutations and suffices from volunteers'.bgWhite.blue, function () {
			return driver
				.sleep(1)
				.then(function () {
					sqlQuery.removeSalsAndSufficesVols()
				})
				.wait_for_sql('removeSalsAndSufficesVols','removalResultsVols')
		});

		it('Should remove volunteers that are missing any of: CountyName, Zip, or State'.bgWhite.blue, function () {
			return driver
				.sleep(1)
				.then(() => {
					sqlQuery.removeVolsWithNoCountyZipOrState()
				})
				.wait_for_sql('removeVolsWithNoCountyZipOrState','removalResultsVolsWithNoCountyZipOrState')
		});

	});
};