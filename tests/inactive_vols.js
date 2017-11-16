"use strict";

module.exports = function () {

	require('colors');
	let wd            = require("wd");
	let assert  	  = require('assert');
	let asserters     = wd.asserters;
	let	_             = require('underscore');
	let	Q             = require('q');
	let	fsExtra       = require('fs-extra');
	let	fs            = require('fs');
	let	pry  		  = require('pryjs');
	const sql         = require('mssql');
	let	_p            = require('../helpers/promise-utils');
	let	elements      = require('../helpers/elements');
	let	actions       = require('../helpers/actions');
	let store    	  = require('../helpers/store');
	let	config 		  = require('../helpers/config');
	let	serverConfigs = require('../helpers/appium-servers');
	let creds         = require('../credentials');
	let sqlQuery      = require('../helpers/queries');
	let	serverConfig  = process.env.SAUCE ? serverConfigs.sauce : serverConfigs.local;
	let	args  		  = process.argv.slice( 2 );
	let	simulator     = false;
	let	desired;
	let driver = config.driver;
	let	commons = require('../helpers/commons'); // this must be after the desired and driver are set

	describe("All inactive volunteer-related tests".bgYellow.black, function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)
		let firstName, lastName, fullName, email, state, phone, width, height;
		config.searchResults = []

		it('Full Login'.bgWhite.blue, function () {
            this.retries = 1
			return driver
				.fullLogin()
		});

		it('Navigate to inactive volunteer list - tab is highlighted after selecting'.bgWhite.blue, function () {
			return driver
				.elementById(elements.homeScreen.volunteers)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.volunteers.inActive,10000)
				.click()
				.sleep(500) // time for tab to select
				.elementById(elements.volunteers.inActive)
				.then(function (el) {
					return el.getAttribute('value').then(function (value) {
						assert.equal(value,1)
					})
				})
		});

		it('Open inactive volunteer details'.bgWhite.blue, function () {
			return driver
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById('Volunteer Details', 20000)
		});

		it('Save volunteer information'.bgWhite.blue, function () {
			return driver
				.waitForElementByXPath(elements.vol_details.firstAndLastName, 10000) //first and last name
				.then(function (el) {
					return el.getAttribute('name').then(function name(attr) {
						fullName = attr.trim();
						firstName = attr.trim().split(/\s+/).shift()
						lastName = attr.trim().split(/\s+/).pop()
					})
				})
                .back()
		});

		it('Mark inactive volunteer active'.bgWhite.blue, function () {
			return driver
                .elementByIdOrNull(elements.volunteers.inActive)
                .then(function (el) {
                    if (el == null) {
                        return driver
                            .resetApp()
                            .loginQuick()
                            .elementById(elements.homeScreen.volunteers)
                            .click()
                            .waitForElementToDisappearByClassName(elements.general.spinner)
                            .waitForElementById(elements.volunteers.inActive, 10000)
                            .click()
                    } else {
                        return el.getAttribute('value').then(function (value) {
                            if (value != 1) {
                                return driver
                                    .waitForElementById(elements.volunteers.inActive, 10000)
                                    .click()
                            }
                        })
                    }
                })
                // on inactive tab - swipe left on first person
                .elementById(elements.volunteers.volunteer1.volunteer1)
                .then(function (el) {
                    return el.getSize().then(function (size) {
                        height = size.height;
                        width = size.width;
                    })
                })
                .elementById(elements.volunteers.volunteer1.volunteer1)
                .getLocation()
                .then(function (loc) {
                    //swipe left
                    console.log(('Element location: ' + loc.x + ', ' + loc.y + ' height: ' + height + ' width: ' + width).white.bold)
                    loc.x = loc.x + width - 75 // just to the left of the right edge of element
                    loc.y = loc.y + height/2 // halfway down the element
                    return driver
                        .swipe({startX: loc.x, startY: loc.y, offsetX: -(width/2), offsetY: 0,})
                })
                // tap Mark Active - todo - guessing the location of Mark Active - fix this once we have an id to click:
                .elementById(elements.volunteers.volunteer1.volunteer1)
                .then(function (el) {
                    var action = new wd.TouchAction(driver);
                    action
                      .tap({el: el, x: 564, y: 0})
                      .release();
                    return driver.performTouchAction(action);
                })
                .waitForElementToDisappearByClassName(elements.general.spinner)
		});

        it('Still on the inactive tab'.bgWhite.blue, function () {
            return driver
                .elementById(elements.volunteers.inActive)
                .then(function (el) {
                    return el.getAttribute('value').then(function (value) {
                        assert.equal(value,1)
                    })
                })
        });

        it('Volunteer no longer exists in the inactive tab'.bgWhite.blue, function () {
            return driver
                .elementByIdOrNull(elements.volunteers.inActive)
                .then(function (el) {
                    if (el == null) {
                        return driver
                            .resetApp()
                            .loginQuick()
                            .elementById(elements.homeScreen.volunteers)
                            .click()
                            .waitForElementToDisappearByClassName(elements.general.spinner)
                            .waitForElementById(elements.volunteers.inActive, 10000)
                            .click()
                    } else {
                        return el.getAttribute('value').then(function (value) {
                            if (value != 1) {
                                return driver
                                    .elementById(elements.volunteers.inActive)
                                    .click()
                            }
                        })
                    }
                })
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(fullName)
                .sleep(1000) // make sure automation not too fast - wait for results (should be instant)
                //get first result element:
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then(function (el) {
                    return el.getAttribute('visible').then(function (visible) {
                        assert.equal(visible, 'false')
                    })
                })
                .then(function () {

                    config.homeScreenStats[0].activecount        += 1
                    config.homeScreenStats[0].activepercent       = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    config.homeScreenStats[0].inactivecount      -= 1
                    config.homeScreenStats[0].inactivepercent     = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    config.homeScreenStats[0].reactivatedcount   += 1
                    config.homeScreenStats[0].reactivatedpercent  = Math.round((config.homeScreenStats[0].reactivatedcount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    
                })
        });
        
        it('Cancel search'.bgWhite.blue, function () {
            return driver
                .elementById(elements.actionBar.cancel)
                .click()
        });

        it('Switch to active tab'.bgWhite.blue, function () {
            return driver
                .elementByIdOrNull(elements.volunteers.active)
                .then(function (el) {
                    if (el == null) {
                        return driver
                            .resetApp()
                            .loginQuick()
                            .elementById(elements.homeScreen.volunteers)
                            .click()
                            .waitForElementToDisappearByClassName(elements.general.spinner)
                            .waitForElementById(elements.volunteers.active, 10000)
                            .click()
                            .elementById(elements.volunteers.active)
                            .then(function (el) {
                                return el.getAttribute('value').then(function (value) {
                                    assert.equal(value,1)
                                })
                            })
                    } else {
                        return driver
                            .elementById(elements.volunteers.active)
                            .click()
                            .elementById(elements.volunteers.active)
                            .then(function (el) {
                                return el.getAttribute('value').then(function (value) {
                                    assert.equal(value,1)
                                })
                            })
                    }
                })
        });
                
        it('Should be added to active tab'.bgWhite.blue, function () {
            return driver
                .waitForElementById(elements.actionBar.search,10000)
                .click()
                .sendKeys(fullName)
                .sleep(1000) // make sure automation not too fast - wait for results (should be instant)
                //get first result element:
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then(function (el) {
                    return el.getAttribute('visible').then(function (visible) {
                        assert.equal(visible, 'true')
                    })
                })
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then(function (el) {
                    return el.getAttribute('name').then(function (name) {
                        assert.equal(name.trim(), fullName.trim())
                    })
                })
        });
        
	});
};