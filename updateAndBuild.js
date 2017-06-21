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
	"cd /Users/mliedtka/i360 && git pull ",
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
		'-scheme', 'i360 Canvass',
		'-target', 'i360 Canvass',
		'-configuration', 'Debug',
		'-derivedDataPath', 'build', 'clean'
	], {stdio: "inherit", cwd: "/Users/mliedtka/i360/iOS/i360 Canvass/"});

	clean.on('exit', function (code,signal) {

		let build = childProcess.spawn( 'xcrun', [
			'xcodebuild', '-scheme', 'i360 Canvass',
			'-target', 'i360 Canvass',
			'-configuration', 'Debug',
			'-derivedDataPath', 'build'
		], {stdio: "inherit", cwd: "/Users/mliedtka/i360/iOS/i360 Canvass/"} ); //the 'inherit' preserves the colors from build process

		build.on('exit', function (code, signal) {
		  console.log('build process exited with ' + `code ${code} and signal ${signal}`);
		  childProcess.exec('cd /Users/mliedtka/AppiumAutomation');
		});
	})
});
