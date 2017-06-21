# AppiumAutomation

To run multiple simulators, start one via xcode
Press stop
In the simulator "Hardware" menu change the device type
On the command line go to: 

	cd /Applications/Xcode.app/Contents/Developer/Applications

Execute the following:

	open -n Simulator.app

Should start another device.  You can change the type of the original device back to have two of the same devices running simultaneously.

Appium server with default args:
	appium -p 4723 -cp 4723 -bp 2734 --selendroid-port 8080 --chromedriver-port 9515 --webkit-debug-proxy-port 27753 --session-override --log-level 'debug' --debug-log-spacing --log '/Users/mliedtka/appium_logs1/appium.log' --address "localhost" --command-timeout '7200' --launch-timeout '90000' --default-capabilities '{"app":"/Users/mliedtka/Library/Developer/Xcode/DerivedData/i360_Canvass-byzgucvkbseaivggszvazdzohhjo/Build/Products/Debug-iphonesimulator/i360 Canvass.app", "showIOSLog":"false", "nativeInstrumentsLib":"true", "platformName":"iOS", "platformVersion":"10.2", "automationName":"XCUITest", "deviceName":"iPad Air 2", "bundleId":"com.i360.i360Walk", "fullReset":"false", "noReset":"true", "autoAcceptAlerts": true}'

Appium server for inspector with custom ports (hoping to run concurrently with tests one day):
	appium -p 4725 -cp 4725 -bp 4726 --selendroid-port 8081 --chromedriver-port 9516 --webkit-debug-proxy-port 27754 --session-override --log-level 'debug' --debug-log-spacing --log '/Users/mliedtka/appium_logs2/appium.log' --address "localhost" --command-timeout '7200' --launch-timeout '90000' --default-capabilities '{"app":"/Users/mliedtka/Library/Developer/Xcode/DerivedData/i360_Canvass-byzgucvkbseaivggszvazdzohhjo/Build/Products/Debug-iphonesimulator/i360 Canvass.app", "showIOSLog":"false", "nativeInstrumentsLib":"true", "platformName":"iOS", "platformVersion":"10.2", "automationName":"XCUITest", "deviceName":"iPad Air", "bundleId":"com.i360.i360Walk", "fullReset":"false", "noReset":"true", "autoAcceptAlerts": true}'
