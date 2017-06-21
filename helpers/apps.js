//All app locations for ios, android and simulator.

let homeDir = function () {

	return process.env[ ( process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME' ];
};

let home = homeDir();

//built.io example:
// exports.iosSimApp = home + '/Library/Developer/Xcode/DerivedData/i360_Canvass-byzgucvkbseaivggszvazdzohhjo/Build/products/Debug-iphonesimulator/i360 Canvass.app'
exports.iosSimApp = home + '/i360/iOS/i360 Canvass/build/Build/Products/Debug-iphonesimulator/i360 Canvass.app/'
exports.iosDeviceApp = home + '/AppiumAutomationTestBuiltIO/apps/i360Canvass011817.ipa';
exports.androidDeviceApp = home + '/AppiumAutomationTestBuiltIO/apps/i360Walk022017.apk'; // mac
exports.androidDeviceAppW = home + '\\AppiumAutomationTestBuiltIO\\apps\\i360Walk012017.apk'; // windows