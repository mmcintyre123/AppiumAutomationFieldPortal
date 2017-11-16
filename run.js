'use strict';

require( 'colors' );
let childProcess = require( 'child_process' );
let intercept    = require('intercept-stdout');
let config       = require( './helpers/config');
let creds        = require('./credentials');
let loaded       = false;
let rawArgs      = process.argv.slice( 2 );
let args         = [ 'mocha.js' ];
let appium;
let homeDir = function () {
	return process.env[ ( process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME' ];
};

// make sure Cisco is not running then start VPN
childProcess.exec('pkill -9 "Cisco"')
childProcess.exec(creds.vpnDisconnectReconnect)

for ( var i  in rawArgs ) {
	args.push( rawArgs[ i ] );
}

let stripColors = function ( string ) {
	return string.replace( /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '' );
};

for (var i in args ) {

	var arg = args[i];
	var i   = Number( i );

	switch ( arg ) {
		case '--sim' : {
			appium = childProcess.spawn( 'appium', [ 
				'--strict-caps',
				'--session-override',
				'--log-level', 'debug',
				'--debug-log-spacing',
				'--log', '/Users/mliedtka/appium_logs1/appium.log',
				'--address', 'localhost',
				'--default-capabilities', '{ \
					"bundleId":"com.i360.i360FieldPortal", \
					"showIOSLog":false, \
					"autoAcceptAlerts":true,\
					"nativeInstrumentsLib":true, \
					"automationName":"XCUITest",\
					"clearSystemFiles":true, \
					"preventWDAAttachments":true, \
					"newCommandTimeout":0, \
					"fullReset":false, \
					"noReset":true, \
					"connectHardwareKeyboard":true \
				}'
			]);
			break;
		}

		case '--os' : {
			if ( args[ i + 1 ] !== undefined ) {
				if ( args[ i + 1 ].indexOf( 'android' ) != -1 ) {
					appium = childProcess.spawn( 'appium', [
						'--app-pkg', 'com.i360.i360Walk',
						'--app', '',
						//( config.get( 'reset' ) == true ? '--full-reset' : '--no-reset' ),
						'--dont-stop-app-on-reset',
						//'--pre-launch',
						'--debug-log-spacing',
						'--automation-name', 'Appium',
						'--platform-name', 'Android',
						'--clearSystemFiles','true',
						'--preventWDAAttachments','true',
						'--platform-version', '6.0'
					] );
				} else {
					appium = childProcess.spawn( 'appium', [
						'--app-pkg', 'com.i360.i360Walk',
						'--app', homeDir() + '',
						//( config.get( 'reset' ) == true ? '--full-reset' : '--no-reset-' ),
						'--full-reset',
						'--dont-stop-app-on-reset',
						//'--pre-launch',
						'--udid', 'D7662095-A24B-44B5-A0B1-071A1250DAE9',
						'--show-ios-log',
						'--show-ios-log',
						'--default-device',
						'--automation-name', 'Appium',
						'--platform-name', 'iOS',
						'--platform-version', '10.2',
						'--clearSystemFiles','true',
						'--preventWDAAttachments','true',
						'--native-instruments-lib'
					] );
				}

			} else {
				throw 'You did not specify an os for --os';
			}

			break;
		}
	}
}

appium.on('exit', function (code, signal) {
	console.log('appium process exited with ' + `code ${code} and signal ${signal}`);
});

/*
//ask Mike Meyer about this
appium.stdout.on( 'data', function ( data ) {

	var buff = new Buffer( data );

	if ( !loaded ) {
		console.log( buff.toString( 'utf8' ).replace( '\n', '' ) );
	}

	if ( stripColors( buff.toString( 'utf8' ) ) === 'info: Console LogLevel: debug\n' && !loaded ) {

		loaded = true;

		var mocha = childProcess.spawn( 'mocha', args );

		mocha.stdout.on( 'data', function ( data ) {

			var buff = new Buffer( data );
			console.log( buff.toString( 'utf8' ).replace( '\n', '' ) );
		} );

		mocha.stderr.on( 'data', function ( data ) {

			var buff = new Buffer( data );
			console.log( buff.toString( 'utf8' ).replace( '\n', '' ) );
		} );
	}
});
*/


appium.stdout.on( 'data', function ( data ) {

	var buff = new Buffer( data );

	if (!loaded ) {
		console.log( buff.toString( 'utf8' ).replace( '\n', '' ) );
	}

	if ( stripColors( buff.toString( 'utf8' ) ) === '[Appium] Welcome to Appium v1.7.1\n' && !loaded ) {

		loaded = true;
		let mocha = childProcess.spawn( 'mocha', args, {stdio: "inherit"} ); //the 'inherit' preserves the colors from mocha process

		mocha.on('exit', function (code, signal) {
		  console.log('mocha process exited with ' + `code ${code} and signal ${signal}`);
		  appium.kill('SIGINT')
		});
	}
});

