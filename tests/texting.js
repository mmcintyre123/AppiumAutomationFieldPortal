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
	let   Mocha         = require('mocha');
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
    config.textEnabled = false

    describe('Verify the texting icon is present if the user has the role, and absent if the user does not have the role', function () {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)

		it('Should determine if texting role is present', function () {
			this.retries = 1
			return driver
				.sleep(1)
				.then(function getUserId() {
					sqlQuery.getUserId()
				})
				.wait_for_sql('getUserId', 'userId')
				.then(function () {
					sqlQuery.getUserRoles()
				})
				.wait_for_sql('getUserRoles','userRoles')
				.then(function () {
					if(config.userRoles.includes('fptext')){
						config.textEnabled = true;
					} else {
						config.textEnabled = false;
					}
				})
		});
		
    	it('Full Login', function () {
			this.retries = 1
    		return driver
    			.fullLogin() // when no args passed, uses credentials supplied via command line (process.argv.slice(2))
    	});
		
        it('Verify the text icon is available when the role is present and absent if it is not present', function () {
            return driver
                .sleep(1)
                .then(function () {
                    if(config.textEnabled){
                        return driver
                            .elementById(elements.homeScreen.text)
                    } else {
                        return driver
                            .elementByIdOrNull(elements.homeScreen.text)
                            .then(function (el) {
                                assert.equal(el, null)
                            })
                    }
                })
        });

        // it('', function () {
		// 	(!config.textEnabled) ? this.skip() : undefined
			
        // });
        
        
        
        
    });
};