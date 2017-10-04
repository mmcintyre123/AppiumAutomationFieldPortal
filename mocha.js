//'use strict';

require( 'colors' );
let wd            = require( 'wd' );
let fs            = require( 'fs' );
let assert        = require( 'assert' );
let serverConfigs = require( './helpers/appium-servers' );
let args          = process.argv.slice( 2 );
let config        = require( './helpers/config' );
let _             = require('underscore');
let actions       = require( './helpers/actions' );
let elements      = require( './helpers/elements' );
let sqlQuery      = require('./helpers/queries');

let timeout       = 9999000;
let simulator     = false;
let desired;

	for ( var i in args ) {
		var arg = args[ i ];
		var i   = Number( i );

		switch ( arg ) {
			case '--sim' : {
				if ( args[ i + 1 ] !== undefined && args[ i + 1 ].substring(0,2) !== '--') {
					simulator = true;
					desired   = _.clone(require( './helpers/caps' )[ args[ i + 1 ] ]);

					config.set( {
						'os'      : args[ i + 1 ],
						'desired' : desired,
						'sim'     : true
					} );

					config.desired.newCommandTimeout = args.includes("--dbg") ? 1800 : 120, // in seconds - 30 min or 2 min
					config.desired.launchTimeout = 180000  // in ms - 3 minutes

				} else {
					throw 'You did not specify a simulator device, see caps.js for available devices!'
				}

				break;
			}

			case '--time' : {
				if ( args[ i + 1 ] !== undefined && args[ i + 1 ].substring(0,2) !== '--') {
					timeout = args[ i + 1 ];
				} else {
					throw 'You did not specify a timeout for -time';
				}

				break;
			}

			case '--reset' : {
				if ( args[ i + 1 ] !== undefined && args[ i + 1 ].substring(0,2) !== '--') {
					config.set( {
						'fullReset' : true
					} );
				}

				break;
			}

			case '--os' : {
				if ( args[ i + 1 ] !== undefined && args[ i + 1 ].substring(0,2) !== '--') {
					desired = _.clone(require( './helpers/caps' )[ args[ i + 1 ] ]);

					config.set( {
						'os'      : args[ i + 1 ],
						'desired' : desired,
						'sim'     : false
					} );

					config.desired.newCommandTimeout = args.includes("--dbg") ? 1800 : 120, // in seconds - 30 min or 2 min
					config.desired.launchTimeout = 180000  // in ms - 3 minutes


				} else {
					throw 'You did not specify an os for --os';
				}

				break;
			}

			case '--ENV' : {
				if ( args[ i + 1 ] !== undefined && args[ i + 1 ].substring(0,2) !== '--') {
					config.set( {
						'ENV' : args[ i + 1 ]
					});
				} else {
					throw 'You did not specify an environment, for example, --ENV test';
				}
				break;
			}

			case '--uname' : {
				if ( args[ i + 1 ] !== undefined && args[ i + 1 ].substring(0,2) !== '--') {
					config.set( {
						'thisUser' : args[ i + 1 ]
					});
				} else {
					throw 'You did not specify a user name to use for the initial login! For example: --uname mmcintyre';
				}
				break;
			}

			case '--pwd' : {
				if ( args[ i + 1 ] !== undefined && args[ i + 1 ].substring(0,2) !== '--') {
					config.set( {
						'pwd' : args[ i + 1 ]
					});
				} else {
					throw 'You did not specify a password to use for the initial login! For example: --pwd qwerty09';
				}
				break;
			}
		}
	}

	if (config.ENV === undefined) {
		throw new Error('You must specify an environment (ENV) when executing tests.')
	}

let driver = wd.promiseChainRemote( serverConfigs.local );
config.set({
	'driver'   : driver,
	'elements' : elements
});

require("./helpers/setup");
let commons = require( './helpers/commons' );

describe( 'Automation Test in Progress!'.green, function () {

	this.timeout( timeout ); // total time limit for all tests to complete
	let allPassed = true;
	// require( './helpers/logging' ).configure( driver );

	commons.beforeAll();
	commons.beforeEachIt();
	commons.afterEachIt();
	commons.afterAll();

	describe( 'Running automation, please wait for all tests to complete!'.green, function () {
/*
		describe( 'Running "SourceCode Check and SourceCode updates" Test.'.red, function () {

			let run = require( './TestFiles.js' );
				run.sourceCodeCheck( 'gitPullCheck' );
				//run.sourceCodeCheck( 'buildUpdates' );
		} );

		describe( 'Running Sync Smoke Test'.red, function () {

			let run = require( './TestFiles.js' );
				run.logins( 'loginSanboxSmokeTest' );
		} );
*/

		describe( 'Run icon color tests'.green, function () {

			let devlopeApp = true; //todo figure out what this is for

			let run = require( './TestFiles.js' );
				// run.sampleTests('sample')
				// run.sampleTests( 'login_counts_homescreen_initial' );
				// run.sampleTests( 'clean_data' );
				// run.sampleTests( 'add_edit_volunteer' );
				// run.sampleTests( 'texting' );
				// run.sampleTests( 'prospects' );
				// run.sampleTests( 'inactive_vols' );
				// run.sampleTests( 'active_vols' );
				run.sampleTests( 'delete_volunteers' );
				// run.sampleTests( 'login_counts_homescreen_final' );
		} );
	} );
} );
