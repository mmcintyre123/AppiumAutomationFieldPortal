//'use strict';

require( 'colors' );
let wd            = require( 'wd' );
let fs            = require( 'fs' );
let assert        = require( 'assert' );
let serverConfigs = require( './helpers/appium-servers' );
let args          = process.argv.slice( 2 );
let config        = require( './helpers/config' );
let	_             = require('underscore');
let actions       = require( './helpers/actions' );
let elements      = require( './helpers/elements' );
let timeout       = 9999000;
let simulator     = false;
let desired;

	for ( var i in args ) {
		var arg = args[ i ];
		var i   = Number( i );

		switch ( arg ) {
			case '-sim' : {
				if ( args[ i + 1 ] !== undefined ) {
					simulator = true;
					desired   = _.clone(require( './helpers/caps' )[ args[ i + 1 ] ]);

					config.set( {
						'os'      : args[ i + 1 ],
						'desired' : desired,
						'sim'     : true,
						'newCommandTimeout' : args.includes("dbg") ? 1800 : 120, // in seconds - 30 min or 2 min
						'launchTimeout' : 180000  // in ms - 3 minutes todo add these below
					} );
				}

				break;
		}

			case '-time' : {
				if ( args[ i + 1 ] !== undefined ) {
					timeout = args[ i + 1 ];
				} else {
					throw 'You did not specify a timeout for -timeout';
				}

				break;
			}

			case '-reset' : {
				if ( args[ i + 1 ] !== undefined ) {
					config.set( {
						'reset' : true
					} );
				}

				break;
			}

			case '-os' : {
				if ( args[ i + 1 ] !== undefined ) {
					desired = _.clone(require( './helpers/caps' )[ args[ i + 1 ] ]);

					config.set( {
						'os'      : args[ i + 1 ],
						'desired' : desired,
						'sim'     : false,
						'newCommandTimeout' : args.includes("dbg") ? 1800 : 120, // in seconds - 30 min or 2 min
						'launchTimeout' : 180000  // in ms - 3 minutes todo add these below
					} );
				} else {
					throw 'You did not specify a os for -os';
				}

				break;
			}
		}
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
				// run.sampleTests( 'sample' );
				// run.sampleTests( 'web_app' );
				// run.sampleTests( 'icon_colors' );
				run.sampleTests( 'add_note');
				// run.sampleTests( 'target_page');
				// run.sampleTests( 'add_contact' );
				// run.sampleTests( 'walkbooks_smoke_tests' );

		} );
	} );


} );
