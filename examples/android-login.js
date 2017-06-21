"use strict";

require("./helpers/setup");

var wd = require("wd"),
    _ = require('underscore'),
    serverConfigs = require('./helpers/appium-servers');

//Let's try it!

  it("should find an element", function () {
    return driver
      //.elementByAccessibilityId('etLoginUsername')
      //.click()
      .elementByXPath('//android.widget.EditText[@text=\'Username\']')
        .should.exists;
  });
