//All app locations for ios, android and simulator.

let homeDir = function () {

	return process.env[ ( process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME' ];
};

let home = homeDir();

//built.io example:
exports.iosSimApp = home + '/Library/Developer/Xcode/DerivedData/i360FieldPortal-ajjqwixsfucdmdchgcuxgwodjufu/Build/Products/Debug-iphonesimulator/i360FieldPortal.app/'
exports.iosDeviceApp = home + '';
exports.androidDeviceApp = home + ''; // mac
exports.androidDeviceAppW = home + ''; // windows