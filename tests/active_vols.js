"use strict";

module.exports = function () {

	require('colors');
	let   wd            = require("wd");
	let   assert        = require('assert');
	let   cities        = require('cities');
	let   counties      = require('us-zcta-counties');
	let   _             = require('underscore');
	let   childProcess  = require('child_process');
	let   clip          = require('clipboardy');
	let   Q             = require('q');
	let   fsExtra       = require('fs-extra');
	let   fs            = require('fs');
	let   pry           = require('pryjs');
	const sql           = require('mssql');
	let   _p            = require('../helpers/promise-utils');
	let   elements      = require('../helpers/elements');
	let   actions       = require('../helpers/actions');
	let   store         = require('../helpers/store');
	let   config        = require('../helpers/config');
	let   serverConfigs = require('../helpers/appium-servers');
	let   creds         = require('../credentials');
	let   sqlQuery      = require('../helpers/queries');
	let   serverConfig  = process.env.SAUCE ? serverConfigs.sauce : serverConfigs.local;
	let   args          = process.argv.slice( 2 );
	let   simulator     = false;
	let   asserters     = wd.asserters;
	let   driver        = config.driver;
	let	  desired;
	let   commons       = require('../helpers/commons'); // this must be after the desired and driver are set

	describe("Tests in the Active tab", function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)
        let vol1FullName, vol2FullName, firstName, lastName, fullName, email, state, phone, width, height;
        config.searchResults = []

        it.skip('testing stuff', function () {
            return driver
                .loginQuick()
                .elementById(elements.homeScreen.volunteers)
                .click()
                .waitForElementToDisappearByClassName(elements.general.spinner)
                .elementByIdOrNull(elements.volunteers.inActive)
                .then(el => driver.is_visible(el))
                .elementById(elements.actionBar.search)
                .click()
        });

		it.skip('Full Login', function () {
			this.retries = 1
			return driver
				.fullLogin() // when no args passed, uses credentials supplied via command line (process.argv.slice(2))
        });

        it('Quick Login', function () {
            this.retries = 1
            return driver
                .loginQuick()
        });

		it('Navigate to active volunteer list - tab is selected by default', function () {
			return driver
				.elementById(elements.homeScreen.volunteers)
                .click()
                .waitForElementToDisappearByClassName(elements.general.spinner)
                .waitForElementById(elements.volunteers.active,10000)
                .then(el => driver.is_visible(el).is_selected(el))
		});

		it('Open active volunteer details', function () {
			return driver
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById('Volunteer Details', 20000)
		});

		it('Save volunteer information', function () {
			return driver
                .waitForElementByXPath(elements.vol_details.firstAndLastName, 10000) //first and last name
                .getAttribute('name')
                .then((name) => {
                    fullName = name.trim();
                    firstName = name.trim().split(/\s+/).shift()
                    lastName = name.trim().split(/\s+/).pop()
                })
                .back()
                .waitForElementById(elements.volunteers.active, 5000)
		});

        it('On Active tab after going back', function () {
            return driver
                .elementByIdOrNull(elements.volunteers.active)
                .then(el => driver.recoverFromFailuresVolunteers(el))
                .elementById(elements.volunteers.active)
                .then(el => driver.is_selected(el))
        });

		it('Mark active volunteer inactive', function () {
            //todo update this when we have an id for the els under the slider.  Make more compact.
            return driver
                // on active tab - swipe left on first person
                .elementById(elements.volunteers.volunteer1.volunteer1)
                .getSize()
                .then((size) => {
                    height = size.height;
                    width = size.width;
                })
                .elementById(elements.volunteers.volunteer1.volunteer1)
                .getLocation()
                .then( (loc) => {
                    //swipe left
                    console.log(('Element location: ' + loc.x + ', ' + loc.y + ' height: ' + height + ' width: ' + width).white.bold)
                    loc.x = loc.x + width - 75 // just to the left of the right edge of element
                    loc.y = loc.y + height/2 // halfway down the element
                    return driver
                        .swipe({
                            startX: loc.x,
                            startY: loc.y,
                            offsetX: -(width/2),
                            offsetY: 0,
                        })
                })
                // tap Mark Inactive - todo - guessing the location of Mark Active - fix this once we have an id to click:
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

        it('Still on the active tab', function () {
            return driver
                .elementByIdOrNull(elements.volunteers.active)
                .then(el => driver.recoverFromFailuresVolunteers(el))
                .elementById(elements.volunteers.active)
                .then(el => driver.is_selected(el))
        });

        it('Volunteer no longer exists in the active tab', function () {
            return driver
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then(el => driver.is_not_visible(el))
                .then(function () {
                    config.homeScreenStats[0].activecount     -= 1
                    config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    config.homeScreenStats[0].inactivecount   += 1
                    config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                })
        });

        it('Cancel search', function () {
            return driver
                .elementById(elements.actionBar.cancel)
                .click()
                .elementById(elements.volunteers.active)
                .then(el => driver.is_visible(el).is_selected(el))
        });

        it('Switch to inactive tab', function () {
            return driver
                .elementById(elements.volunteers.inActive)
                .click()
                .elementById(elements.volunteers.inActive)
                .then(el => driver.is_selected(el))
        });

        it('Should be added to inactive tab', function () {
            return driver
                .waitForElementById(elements.actionBar.search,10000)
                .click()
                .sendKeys(fullName)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then(el => driver.is_visible(el))
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then((el) => {
                    return el
                        .getAttribute('name')
                        .then((name) => {assert.equal(name.trim(), fullName.trim())}) //full name is as expected
                })
                .elementById(elements.actionBar.cancel)
                .click()
                .elementById(elements.volunteers.active)
                .click()
        });

        it('Should mark multiple Volunteers Inactive via selecting', function () {
            return driver
                .elementByIdOrNull(elements.volunteers.active)
                .then(el => driver.recoverFromFailuresVolunteers(el))
                .elementById(elements.volunteers.active)
                .then(el => driver.is_selected(el))
                //save names of first and second active volunteers
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .getAttribute('name')
                .then((name) => {vol1FullName = name.trim()})
                .elementByXPathOrNull(elements.volunteers.volunteer2.fullName)
                .getAttribute('name')
                .then((name) => {vol2FullName = name.trim()})
                //select vol 1 and 2 and mark inactive
                .elementById(elements.actionBar.select)
                .click()
                .elementById(elements.volunteers.volunteer1.volunteer1)
                .click()
                .elementById(elements.volunteers.volunteer2.volunteer2)
                .click()
                .elementById(elements.volunteers.bottomBar.flag)
                .click()
                .elementById(elements.volunteers.flag.markInactive)
                .click()
                .waitForElementToDisappearByClassName(elements.general.spinner)
        });

        it('Still on the active tab', function () {
            return driver
                .elementByIdOrNull(elements.volunteers.active)
                .then(el => driver.recoverFromFailuresVolunteers(el))
                .elementById(elements.volunteers.active)
                .then(el => driver.is_selected(el))
        });

        it('Vol1 does not exist in the active tab', function () {
            return driver
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(vol1FullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then(el => driver.is_not_visible(el))
                .then(function () {
                    config.homeScreenStats[0].activecount        -= 1
                    config.homeScreenStats[0].inactivecount      += 1

                    let activepercentRaw = (config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100;
                    let inActivePercentRaw = (config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100;
                    console.log('active percent: ' + activepercentRaw);
                    console.log('inactive percent: ' + inActivePercentRaw);

                    config.homeScreenStats[0].activepercent   = Math.round(activepercentRaw) + '%'
                    config.homeScreenStats[0].inactivepercent = Math.round(inActivePercentRaw) + '%'
                })
        });

        it('Cancel search', function () {
            return driver
                .elementById(elements.actionBar.cancel)
                .click()
                .elementByIdOrNull(elements.volunteers.active)
                .then(el => driver.recoverFromFailuresVolunteers(el))
                .elementById(elements.volunteers.active)
                .then(el => driver.is_visible(el).is_selected(el))
        });

        it('Switch to inactive tab', function () {
            return driver
                .elementById(elements.volunteers.inActive)
                .click()
                .elementById(elements.volunteers.inActive)
                .then(el => driver.is_selected(el))
        });

        it('Vol1 should be added to inactive tab', function () {
            return driver
                .waitForElementById(elements.actionBar.search,10000)
                .click()
                .sendKeys(vol1FullName)
                .elementByXPath(elements.volunteers.volunteer1.fullName)
                .then(el => driver.is_visible(el))
                .elementByXPath(elements.volunteers.volunteer1.fullName)
                .getAttribute('name')
                .then( (name) => { assert.equal(name.trim(), vol1FullName.trim()) }) // full name is as expected })
                .elementById(elements.actionBar.cancel)
                .click()
        });

        it('Vol2 should be added to inactive tab', function () {
            //todo no keys to send - returns false positive
            return driver
                .waitForElementById(elements.actionBar.search,10000)
                .click()
                .clear()
                .sendKeys(vol2FullName)
                .elementByXPath(elements.volunteers.volunteer1.fullName)
                .then(el => driver.is_visible(el))
                .elementByXPath(elements.volunteers.volunteer1.fullName)
                .getAttribute('name')
                .then( (name) => { assert.equal(name.trim(), vol2FullName.trim()) }) // full name is as expected })
                .elementById(elements.actionBar.cancel)
                .click()
        });

	});
};