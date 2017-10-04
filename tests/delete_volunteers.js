"use strict";

module.exports = function () {

	require('colors');
	let   wd            = require("wd");
	let   assert        = require('assert');
	let   asserters     = wd.asserters;
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
	let	desired;
	let driver = config.driver;
	let	commons = require('../helpers/commons'); // this must be after the desired and driver are set

	describe("Describe the test category...defines the group of tests specified below", function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)
		let vol1FullName, vol2FullName, firstName, lastName, fullName, email, state, phone, width, height;

		it.skip('Full Login', function () {
			this.retries = 1
			return driver
				.fullLogin() // when no args passed, uses credentials supplied via command line (process.argv.slice(2))
		});

		it('Login Quick', function () {
			this.retries = 1
			return driver
				.loginQuick()
		});

		it.skip('testing', function () {
			//currently marks a prospect as a volunteer via swiping.
			return driver
				.loginQuick()
				.elementById(elements.homeScreen.volunteers)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.elementById(elements.volunteers.prospects)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.elementById(elements.prospects.prospect1.prospect1)
				.getSize()
				.then((size) => {
					height = size.height;
					width = size.width;
				})
				.elementById(elements.prospects.prospect1.prospect1)
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
                .elementById(elements.prospects.prospect1.prospect1)
                .then(function (el) {
                    var action = new wd.TouchAction(driver);
                    action
                      .tap({el: el, x: 564, y: 0})
                      .release();
                    return driver.performTouchAction(action);
                })
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.elementById(elements.volunteers.active)
				.click()
				.sleep(3000)
				.elementByClassName('XCUIElementTypeToolbar')
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.sleep(3000)
				// .refresh_vol_or_prospect_list()
		});

		///first test
		it('Navigate to active volunteer list - tab is selected by default', function () {
			return driver
				.elementById(elements.homeScreen.volunteers)
                .click()
                .waitForElementToDisappearByClassName(elements.general.spinner)
                .waitForElementById(elements.volunteers.active,10000)
                .then((el) => {return driver.is_visible(el).is_selected(el)})
		});

		it('Open active volunteer details (edit page) - first test', function () {
			//open active
			return driver
				.elementByIdOrNull(elements.volunteers.active)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
				.elementById(elements.actionBar.edit)
				.click()
				.waitForElementById(elements.addEditVolunteer.editVolunteerPageTitle, 10000)
		});

		it('Save volunteer information - first test', function () {
			//always use this method - more reliable.
			return driver
                .elementById(elements.addEditVolunteer.firstName) //first and last name
                .getAttribute('value')
				.then((value) => { firstName = value.trim() })
				.elementById(elements.addEditVolunteer.lastName)
				.getAttribute('value')
				.then((value) => {lastName = value.trim()})
				.then(() => {fullName = firstName + ' ' + lastName })
                .back()
                .waitForElementById(elements.volunteers.active, 5000)
		});

        it('On Active tab after going back', function () {
            return driver
                .elementByIdOrNull(elements.volunteers.active)
                .then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.volunteers.active)
                .then((el) => {return driver.is_selected(el)})
        });

		it('Delete a volunteer from active list - Do Not Contact', function () {
			return driver
				.elementById(elements.actionBar.select)
				.click()
				.elementById(fullName)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.doNotContact)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				//todo cancel?
		});

		it('Volunteer no longer exists in the active tab - first test', function () {
            return driver
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then((el) => {return driver.is_not_visible(el)})
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2000)
                // .then(function () {
                    // config.homeScreenStats[0].activecount     -= 1
                    // config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    // config.homeScreenStats[0].inactivecount   += 1
                    // config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                // })
		});

		it('Volunteer still does not exist in tab after refresh', function () {
			return driver
				.refresh_vol_or_prospect_list()
                .elementById(elements.actionBar.search)
				.click()
				.clear()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then((el) => {return driver.is_not_visible(el)})
		});

		it('Active tab visible and selected after cancelling search', function () {
			return driver
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

		///second test
		it('Open first active volunteer edit page - second test', function () {
			//open active
			return driver
				.elementByIdOrNull(elements.volunteers.active)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
				.elementById(elements.actionBar.edit)
				.click()
				.waitForElementById(elements.addEditVolunteer.editVolunteerPageTitle, 10000)
		});
		
		
		it('Save Volunteer Info - second test', function () {
			return driver
				.elementByIdOrNull(elements.volunteers.volunteer1.volunteer1)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
				.waitForElementByXPath(elements.vol_details.firstAndLastName, 5000) //first and last name
				.getAttribute('name')
				.then((name) => {
					fullName = name.trim();
					firstName = name.trim().split(/\s+/).shift()
					lastName = name.trim().split(/\s+/).pop()
				})
				.back()
				.waitForElementById(elements.volunteers.active, 5000)
				.then((el) => {return driver.is_selected(el)})
		});

		it('Delete a volunteer from active list - Not Interested', function () {
			return driver
				.elementById(elements.actionBar.select)
				.click()
				.elementById(fullName)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.notInterested)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('Volunteer no longer exists in the active tab - second test', function () {
            return driver
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then((el) => {return driver.is_not_visible(el)})
                // .then(function () {
                    // config.homeScreenStats[0].activecount     -= 1
                    // config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    // config.homeScreenStats[0].inactivecount   += 1
                    // config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                // })
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
		});
		it('Volunteer still does not exists in tab after refresh - second test', function () {
			return driver
				.refresh_vol_or_prospect_list()
                .elementById(elements.actionBar.search)
				.click()
				.clear()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then((el) => {return driver.is_not_visible(el)})
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
		});

		//TODO check the database to ensure vol was updated correctly - deleted and marked notInterested.

		///third test
		it('Save Volunteer Info - third test', function () {
			return driver
				.elementByIdOrNull(elements.volunteers.volunteer1.volunteer1)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
				.waitForElementByXPath(elements.vol_details.firstAndLastName, 5000) //first and last name
				.getAttribute('name')
				.then((name) => {
					fullName  = name.trim();
					firstName = name.trim().split(/\s+/).shift()
					lastName  = name.trim().split(/\s+/).pop()
				})
				.back()
				.waitForElementById(elements.volunteers.active, 5000)
				.then((el) => {return driver.is_selected(el)})
		});

		it('Delete a volunteer from active list - Moved', function () {
			return driver
				.elementById(elements.actionBar.select)
				.click()
				.elementById(fullName)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.moved)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('Volunteer no longer exists in the active tab - third test', function () {
			return driver
				.elementById(elements.actionBar.search)
				.click()
				.sendKeys(fullName)
				.sleep(500) // wait for results (should be instant)
				.elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then((el) => {return driver.is_not_visible(el)})
				// .then(function () {
					// config.homeScreenStats[0].activecount     -= 1
					// config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
					// config.homeScreenStats[0].inactivecount   += 1
					// config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
				// })
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
		});
		it('Volunteer still does not exists in tab after refresh - third test', function () {
			//still on active
			return driver
				.refresh_vol_or_prospect_list()
				.elementById(elements.actionBar.search)
				.click()
				.clear()
				.sendKeys(fullName)
				.sleep(500) // wait for results (should be instant)
				.elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then((el) => {return driver.is_not_visible(el)})
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
		});

		///fourth test
		it('Open first active volunteer edit page', function () {
			//open active vol
			return driver
				.elementByIdOrNull(elements.volunteers.active)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
				.elementById(elements.actionBar.edit)
				.click()
				.waitForElementById(elements.addEditVolunteer.editVolunteerPageTitle, 10000)
		});
		
		it('Save Volunteer Info - fourth test', function () {
			return driver
				.elementByIdOrNull(elements.volunteers.volunteer1.volunteer1)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
				.waitForElementByXPath(elements.vol_details.firstAndLastName, 5000) //first and last name
				.getAttribute('name')
				.then((name) => {
					fullName = name.trim();
					firstName = name.trim().split(/\s+/).shift()
					lastName = name.trim().split(/\s+/).pop()
				})
				.back()
				.waitForElementById(elements.volunteers.active, 5000)
				.then((el) => {return driver.is_selected(el)})
		});

		it('Delete a volunteer from active list - Other', function () {
			return driver
				.elementById(elements.actionBar.select)
				.click()
				.elementById(fullName)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.other)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('Volunteer no longer exists in the active tab - fourth test', function () {
			return driver
				.elementById(elements.actionBar.search)
				.click()
				.sendKeys(fullName)
				.sleep(500) // wait for results (should be instant)
				.elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then((el) => {return driver.is_not_visible(el)})
				// .then(function () {
					// config.homeScreenStats[0].activecount     -= 1
					// config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
					// config.homeScreenStats[0].inactivecount   += 1
					// config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
				// })
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
		});
		it('Volunteer still does not exist in tab after refresh - fourth test', function () {
			return driver
				.refresh_vol_or_prospect_list()
				.elementById(elements.actionBar.search)
				.click()
				.clear()
				.sendKeys(fullName)
				.sleep(500) // wait for results (should be instant)
				.elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then((el) => {return driver.is_not_visible(el)})
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
		});

		///fifth test
		it('Delete multiple volunteers from active list - Other', function () {
			return driver
				.elementByIdOrNull(elements.volunteers.active)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_selected(el)})
				//save names of first and second active volunteers
				.elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.getAttribute('name')
				.then((name) => {
					assert.ok(name.length > 0,'The chosen volunteer in delete mult vols in active list has no name!')
					vol1FullName = name.trim()
				})
				.elementByXPathOrNull(elements.volunteers.volunteer2.fullName)
				.getAttribute('name')
				.then((name) => {
					assert.ok(name.length > 0,'The chosen volunteer in delete mult vols in active list has no name!')
					vol2FullName = name.trim()
				})
				//select vol 1 and 2 and mark inactive
				.elementById(elements.actionBar.select)
				.click()
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.elementById(elements.volunteers.volunteer2.volunteer2)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.other)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

        it('Still on the active tab', function () {
            return driver
			.elementById(elements.volunteers.active)
			.then((el) => {return driver.is_visible(el).is_selected(el)})

        });

        it('Volunteer 1 no longer exists in the active tab - fifth test', function () {
			return driver
				.elementByIdOrNull(elements.volunteers.active)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(vol1FullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
                // .then(function () {
                    // config.homeScreenStats[0].activecount        -= 1
                    // config.homeScreenStats[0].inactivecount      += 1
// 
                    // let activepercentRaw = (config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100;
                    // let inActivePercentRaw = (config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100;
                    // console.log('active percent: ' + activepercentRaw);
                    // console.log('inactive percent: ' + inActivePercentRaw);
// 
                    // config.homeScreenStats[0].activepercent   = Math.round(activepercentRaw) + '%'
                    // config.homeScreenStats[0].inactivepercent = Math.round(inActivePercentRaw) + '%'
                // })
        });

        it('Volunteer 2 no longer exists in the active tab - fifth test', function () {
            return driver
                .elementById(elements.actionBar.search)
                .click()
                .clear()
                .sendKeys(vol2FullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
                // .then(function () {
                    // config.homeScreenStats[0].activecount        -= 1
                    // config.homeScreenStats[0].inactivecount      += 1
// 
                    // let activepercentRaw = (config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100;
                    // let inActivePercentRaw = (config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100;
                    // console.log('active percent: ' + activepercentRaw);
                    // console.log('inactive percent: ' + inActivePercentRaw);
// 
                    // config.homeScreenStats[0].activepercent   = Math.round(activepercentRaw) + '%'
                    // config.homeScreenStats[0].inactivepercent = Math.round(inActivePercentRaw) + '%'
                // })
        });

        it('Cancel search', function () {
            return driver
                .elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
                .elementByIdOrNull(elements.volunteers.active)
                .then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.volunteers.active)
                .then((el) => {return driver.is_visible(el).is_selected(el)})
        });

        it('Switch to inactive tab', function () {
            return driver
                .elementById(elements.volunteers.inActive)
                .click()
                .elementById(elements.volunteers.inActive)
                .then((el) => {return driver.is_selected(el)})
        });

        it('Vol1 should not be in inactive tab either', function () {
			return driver
				.sleep(1)
				.then(() => { assert.ok(vol1FullName.length>0,'vol1FullName is empty') })
                .waitForElementById(elements.actionBar.search,10000)
                .click()
                .sendKeys(vol1FullName)
                .elementByXPath(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
        });

        it('Vol2 should not be in inactive tab either', function () {
			return driver
				.sleep(1)
				.then(() => { assert.ok(vol2FullName.length>0,'vol2FullName is empty') })
                .waitForElementById(elements.actionBar.search,10000)
                .click()
				.clear()
				.sendKeys(vol2FullName)
                .elementByXPath(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
                .elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
        });

		///sixth test
		it('On Active tab - sixth test', function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

		it('Open active volunteer details - sixth test', function () {
			return driver
				.elementByIdOrNull(elements.volunteers.active)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
		});

		it('Save volunteer information - sixth test', function () {
			return driver
                .waitForElementByXPath(elements.vol_details.firstAndLastName, 10000) //first and last name
                .getAttribute('name')
                .then((name) => {
                    fullName = name.trim();
                    firstName = name.trim().split(/\s+/).shift()
                    lastName = name.trim().split(/\s+/).pop()
                })
		});

		it('Delete active volunteer from Volunteer Details - Do Not Contact', function () {
			return driver
				.elementById(elements.vol_details.delete)
				.click()
				.elementById(elements.volunteers.delete.doNotContact)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('On Active tab - sixth test b', function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

        it('Volunteer no longer exists in the active tab - sixth test', function () {
            return driver
                .elementByIdOrNull(elements.volunteers.active)
                .then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
                // .then(function () {
                    // config.homeScreenStats[0].activecount     -= 1
                    // config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    // config.homeScreenStats[0].inactivecount   += 1
                    // config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
				// })
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
        });
        it('Volunteer still does not exists in tab after refresh - sixth test', function () {
			return driver
				.refresh_vol_or_prospect_list()
                .elementByIdOrNull(elements.volunteers.active)
                .then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.actionBar.search)
				.click()
				.clear()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
        });

		///seventh test
		it('On Active tab - seventh test', function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

		it('Open active volunteer details - seventh test', function () {
			return driver
				.elementByIdOrNull(elements.volunteers.active)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
		});

		it('Save volunteer information - seventh test', function () {
			return driver
                .waitForElementByXPath(elements.vol_details.firstAndLastName, 10000) //first and last name
                .getAttribute('name')
                .then((name) => {
                    fullName = name.trim();
                    firstName = name.trim().split(/\s+/).shift()
                    lastName = name.trim().split(/\s+/).pop()
                })
		});

		it('Delete active volunteer from Volunteer Details - Not Interested', function () {
			return driver
				.elementById(elements.vol_details.delete)
				.click()
				.elementById(elements.volunteers.delete.notInterested)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('On Active tab - seventh test b', function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

        it('Volunteer no longer exists in the active tab - seventh test', function () {
            return driver
                .elementByIdOrNull(elements.volunteers.active)
                .then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
                // .then(function () {
                    // config.homeScreenStats[0].activecount     -= 1
                    // config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    // config.homeScreenStats[0].inactivecount   += 1
                    // config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
				// })
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
        });
        it('Volunteer still does not exists in tab after refresh - seventh test', function () {
			return driver
				.refresh_vol_or_prospect_list()
                .elementByIdOrNull(elements.volunteers.active)
                .then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.actionBar.search)
				.click()
				.clear()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
        });

		///eigth test
		it('On Active tab - eigth test', function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

		it('Open active volunteer details - eigth test', function () {
			return driver
				.elementByIdOrNull(elements.volunteers.active)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
		});

		it('Save volunteer information - eigth test', function () {
			return driver
                .waitForElementByXPath(elements.vol_details.firstAndLastName, 10000) //first and last name
                .getAttribute('name')
                .then((name) => {
                    fullName = name.trim();
                    firstName = name.trim().split(/\s+/).shift()
                    lastName = name.trim().split(/\s+/).pop()
                })
		});

		it('Delete active volunteer from Volunteer Details - Moved', function () {
			return driver
				.elementById(elements.vol_details.delete)
				.click()
				.elementById(elements.volunteers.delete.moved)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('On Active tab - eigth test b', function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

        it('Volunteer no longer exists in the active tab - eigth test', function () {
            return driver
                .elementByIdOrNull(elements.volunteers.active)
                .then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
                // .then(function () {
                    // config.homeScreenStats[0].activecount     -= 1
                    // config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    // config.homeScreenStats[0].inactivecount   += 1
                    // config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
				// })
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
        });
        it('Volunteer still does not exists in tab after refresh - eigth test', function () {
			return driver
				.refresh_vol_or_prospect_list()
                .elementByIdOrNull(elements.volunteers.active)
                .then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.actionBar.search)
				.click()
				.clear()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
        });

		///ninth test
		it('On Active tab - ninth test', function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

		it('Open active volunteer details - ninth test', function () {
			return driver
				.elementByIdOrNull(elements.volunteers.active)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
		});

		it('Save volunteer information - ninth test', function () {
			return driver
                .waitForElementByXPath(elements.vol_details.firstAndLastName, 10000) //first and last name
                .getAttribute('name')
                .then((name) => {
                    fullName = name.trim();
                    firstName = name.trim().split(/\s+/).shift()
                    lastName = name.trim().split(/\s+/).pop()
                })
		});

		it('Delete active volunteer from Volunteer Details - Other', function () {
			return driver
				.elementById(elements.vol_details.delete)
				.click()
				.elementById(elements.volunteers.delete.other)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('On Active tab - ninth test b', function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

        it('Volunteer no longer exists in the active tab - ninth test', function () {

            return driver
                .elementByIdOrNull(elements.volunteers.active)
                .then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
                // .then(function () {
                    // config.homeScreenStats[0].activecount     -= 1
                    // config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    // config.homeScreenStats[0].inactivecount   += 1
                    // config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
				// })
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
        });

        it('Volunteer still does not exist in tab after refresh', function () {

			return driver
				.refresh_vol_or_prospect_list()
                .waitForElementByIdOrNull(elements.volunteers.active,10000)
                .then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.actionBar.search)
				.click()
				.clear()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
                // .then(function () {
                    // config.homeScreenStats[0].activecount     -= 1
                    // config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    // config.homeScreenStats[0].inactivecount   += 1
                    // config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
				// })
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(2500) // sometimes the animation is slow
        });



		// DUPLICATE ALL OF THE ABOVE FOR INACTIVE VOLUNTEERS



	});
};