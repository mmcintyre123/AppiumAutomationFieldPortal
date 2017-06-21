'use strict';

require( 'colors' );
let childProcess = require( 'child_process' );
let config = require( './helpers/config');
let loaded  = false;
let rawArgs = process.argv.slice( 2 );
let args    = [ 'mocha.js' ];
let appium;
let homeDir = function () {
	return process.env[ ( process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME' ];
};

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
		case '-sim' : {
			appium = childProcess.spawn( 'appium', [
				//'-p','4725', //non-default args
				//'-cp','4725', //non-default args
				//'-bp','4726', //non-default args
				//'--selendroid-port', '8081', //non-default args
				//'--chromedriver-port', '9516', //non-default args
				//'--webkit-debug-proxy-port', '27754', //non-default args
				'--strict-caps',
				'--session-override',
				'--log-level', 'debug',
				'--debug-log-spacing',
				'--log', '/Users/mliedtka/appium_logs1/appium.log',
				'--address', "localhost",
				'--default-capabilities', '{ \
						"app":"/Users/mliedtka/Library/Developer/Xcode/DerivedData/i360_Canvass-byzgucvkbseaivggszvazdzohhjo/Build/Products/Debug-iphonesimulator/i360 Canvass.app", \
						"showIOSLog":"false", \
						"autoAcceptAlerts":"true", \
						"nativeInstrumentsLib":"true", \
						"platformName":"iOS", \
						"platformVersion":"10.2", \
						"automationName":"XCUITest", \
						"deviceName":"iPad Air 2", \
						"bundleId":"com.i360.i360Walk", \
						"fullReset":"false", \
						"noReset":"true" \
				}'
			]);
			break;
		}
		case '-os' : {
			if ( args[ i + 1 ] !== undefined ) {
				if ( args[ i + 1 ].indexOf( 'android' ) != -1 ) {
					appium = childProcess.spawn( 'appium', [
						'--app-pkg', 'com.i360.i360Walk',
						'--app', '/Users/mliedtka/AppiumAutomationTestBuiltIO/apps/i360Walk022017.apk',
						//( config.get( 'reset' ) == true ? '--full-reset' : '--no-reset' ),
						'--dont-stop-app-on-reset',
						//'--pre-launch',
						'--debug-log-spacing',
						'--automation-name', 'Appium',
						'--platform-name', 'Android',
						'--platform-version', '6.0'
					] );
				} else {
					appium = childProcess.spawn( 'appium', [
						'--app-pkg', 'com.i360.i360Walk',
						'--app', homeDir() + '/AppiumAutomationTestBuiltIO/apps/i360Canvass011817.ipa',
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
						'--native-instruments-lib'
					] );
				}

			} else {
				throw 'You did not specify an os for -os';
			}

			break;
		}

		appium.on('exit', function (code, signal) {
		  console.log('appium process exited with ' + `code ${code} and signal ${signal}`);
		});

	}



}

/*
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

	if ( stripColors( buff.toString( 'utf8' ) ) === '[Appium] Welcome to Appium v1.6.5\n' && !loaded ) {

		loaded = true;
		let mocha = childProcess.spawn( 'mocha', args, {stdio: "inherit"} ); //the 'inherit' preserves the colors from mocha process

		mocha.on('exit', function (code, signal) {
		  console.log('mocha process exited with ' + `code ${code} and signal ${signal}`);
		  appium.kill('SIGINT')
		});

	}
});

