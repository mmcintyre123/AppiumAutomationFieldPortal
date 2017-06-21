//All app locations for ios, android and simulator.

let homeDir = function () {

	return process.env[ ( process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME' ];
};

let home = homeDir();

//built.io example:
exports.iosSimApp = home + '/i360/iOS/i360 Canvass/build/Build/Products/Debug-iphonesimulator/i360 Canvass.app/'
exports.iosDeviceApp = home + '';
exports.androidDeviceApp = home + ''; // mac
exports.androidDeviceAppW = home + ''; // windows