'use strict';

require('colors');
let childProcess = require('child_process');
let update;
let loaded  = false;
let stripColors = function ( string ) {
	return string.replace( /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '' );
};
let homeDir = function () {
	return process.env[ ( process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME' ];
};

update = childProcess.exec(
	"cd /Users/mliedtka/i360fieldportal-ios && git pull ",
	{stdio: 'inherit'},
	function (err,stdout,stderr) {
	    if (err) {
	        console.log("\n"+stderr);
	    } else {
	        console.log(stdout);
	    }
	}
)

update.on('exit', function (code,signal) {

	let clean = childProcess.spawn('xcodebuild', [
		'-scheme', 'i360FieldPortal',
		'-target', 'i360FieldPortal',
		'-configuration', 'Debug',
		'-derivedDataPath', 'build', 'clean'
	], {stdio: "inherit", cwd: "/Users/mliedtka/i360fieldportal-ios/"});

	clean.on('exit', function (code,signal) {

		let build = childProcess.spawn( 'xcrun', [
			'xcodebuild', '-scheme', 'i360FieldPortal',
			'-target', 'i360FieldPortal',
			'-configuration', 'Debug',
			'-derivedDataPath', 'build'
		], {stdio: "inherit", cwd: "/Users/mliedtka/i360fieldportal-ios/"} ); //the 'inherit' preserves the colors from build process

		build.on('exit', function (code, signal) {
		  console.log('build process exited with ' + `code ${code} and signal ${signal}`);
		  childProcess.exec('cd /Users/mliedtka/AppiumAutomation');
		});
	})
});
