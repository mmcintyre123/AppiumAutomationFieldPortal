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

	describe("Deleting Volunteers".bgYellow.black, function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)
		let vol1FirstName, vol1LastName, vol2FirstName, vol2LastName, vol1FullName, vol2FullName, firstName, lastName, fullName, email, state, phone, width, height;

		it.skip('Full Login', function () {
			this.retries = 1
			return driver
				.fullLogin() // when no args passed, uses credentials supplied via command line (process.argv.slice(2))
		});

		//todo if this concatenation works use it everywhere
		it('Login Quick'.bgWhite.blue, function () {
			this.retries = 1
			return driver
				.loginQuick()
		});

		it.skip('testing'.bgWhite.blue, function () {
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
				.then((el) => {return driver.customTap(el, 564, 0) })
                //.then(function (el) {
                //    var action = new wd.TouchAction(driver);
                //    action
                //      .customTap({el: el, x: 564, y: 0})
                //      .release();
                //    return driver.performTouchAction(action);
                //})
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
		it('Navigate to active volunteer list - tab is selected by default'.bgWhite.blue, function () {
			return driver
				.elementById(elements.homeScreen.volunteers)
                .click()
                .waitForElementToDisappearByClassName(elements.general.spinner)
                .waitForElementById(elements.volunteers.active,10000)
                .then((el) => {return driver.is_visible(el).is_selected(el)})
		});

		it('Open active volunteer details (edit page) - first test'.bgWhite.blue, function () {
			//open active vol details edit page
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

		it('Save volunteer information - first test'.bgWhite.blue, function () {
			//save vol info from edit
			return driver
				.elementById(elements.addEditVolunteer.firstName) //first and last name
				.getAttribute('value')
				.then((value) => { firstName = value.trim() })
				.elementById(elements.addEditVolunteer.lastName)
				.getAttribute('value')
				.then((value) => {lastName = value.trim()})
				.then(() => {fullName = firstName + ' ' + lastName })
				.back()
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 5000)
				.back()
				.waitForElementById(elements.volunteers.active, 5000)
		});

        it('On Active tab after going back'.bgWhite.blue, function () {
			return driver
                .elementByIdOrNull(elements.volunteers.active)
                .then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.volunteers.active)
                .then((el) => {return driver.is_selected(el)})
        });

		it('Delete a volunteer from active list - Do Not Contact'.bgWhite.blue, function () {
			return driver
				.elementById(elements.actionBar.select)
				.click()
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.doNotContact)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.elementById(elements.actionBar.cancel)
				.click()
		});

		it('Volunteer no longer exists in the active tab - first test'.bgWhite.blue, function () {
			//todo add this everywhere else
            return driver
                .elementById(elements.actionBar.search)
                .click()
                .sendKeys(fullName)
				.sleep(500) // wait for results (should be instant)
				.elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
				.then((el) => {return driver.is_not_visible(el)})
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(1000)
				.waitForElementById(elements.volunteers.active, 3000)
				.then(el => driver.is_visible(el).is_selected(el))
                // .then(function () {
                    // config.homeScreenStats[0].activecount     -= 1
                    // config.homeScreenStats[0].activepercent    = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                    // config.homeScreenStats[0].inactivecount   += 1
                    // config.homeScreenStats[0].inactivepercent  = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
                // })
		});

		it('Volunteer still does not exist in tab after refresh - first test'.bgWhite.blue, function () {
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

		it('Active tab visible and selected after cancelling search'.bgWhite.blue, function () {
			return driver
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(1000)
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

		///second test
		it('Open first active volunteer edit page - second test'.bgWhite.blue, function () {
			//open active vol details edit page
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
		
		it('Save Volunteer Info - second test'.bgWhite.blue, function () {
			//save vol info from edit
			return driver
				.elementById(elements.addEditVolunteer.firstName) //first and last name
				.getAttribute('value')
				.then((value) => { firstName = value.trim() })
				.elementById(elements.addEditVolunteer.lastName)
				.getAttribute('value')
				.then((value) => {lastName = value.trim()})
				.then(() => {fullName = firstName + ' ' + lastName })
				.back()
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 5000)
				.back()
				.waitForElementById(elements.volunteers.active, 5000)
		});

		it('Delete a volunteer from active list - Not Interested'.bgWhite.blue, function () {
			return driver
				.elementById(elements.actionBar.select)
				.click()
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.notInterested)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.elementById(elements.actionBar.cancel)
				.click()
		});

		it('Volunteer no longer exists in the active tab - second test'.bgWhite.blue, function () {
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
		});
			
		it('Active tab visible and selected'.bgWhite.blue, function () {
			return driver
				.waitForElementById(elements.volunteers.active, 3000)
				.then(el => driver.is_visible(el).is_selected(el))
		});
			
		it('Volunteer still does not exists in tab after refresh - second test'.bgWhite.blue, function () {
			return driver
				.elementByIdOrNull(elements.volunteers.active)
				.then(el => driver.recoverFromFailuresVolunteers(el))
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
		});

		//TODO check the database to ensure vol was updated correctly - deleted and marked notInterested.

		///third test
		it('Open active volunteer details (edit page) - third test'.bgWhite.blue, function () {
			//open active vol details edit page
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

		it('Save Volunteer Info - third test'.bgWhite.blue, function () {
			//save vol info from edit
			return driver
				.elementById(elements.addEditVolunteer.firstName) //first and last name
				.getAttribute('value')
				.then((value) => { firstName = value.trim() })
				.elementById(elements.addEditVolunteer.lastName)
				.getAttribute('value')
				.then((value) => {lastName = value.trim()})
				.then(() => {fullName = firstName + ' ' + lastName })
				.back()
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 5000)
				.back()
				.waitForElementById(elements.volunteers.active, 5000)
		});

		it('Delete a volunteer from active list - Moved'.bgWhite.blue, function () {
			return driver
				.elementById(elements.actionBar.select)
				.click()
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.moved)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.elementById(elements.actionBar.cancel)
				.click()
		});

		it('Volunteer no longer exists in the active tab - third test'.bgWhite.blue, function () {
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
		});
		
		it('Volunteer still does not exists in tab after refresh - third test'.bgWhite.blue, function () {
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
		});

		///fourth test
		it('Open first active volunteer edit page'.bgWhite.blue, function () {
			//open active vol details edit page
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
		
		it('Save Volunteer Info - fourth test'.bgWhite.blue, function () {
			//save vol info from edit
			return driver
				.elementById(elements.addEditVolunteer.firstName) //first and last name
				.getAttribute('value')
				.then((value) => { firstName = value.trim() })
				.elementById(elements.addEditVolunteer.lastName)
				.getAttribute('value')
				.then((value) => {lastName = value.trim()})
				.then(() => {fullName = firstName + ' ' + lastName })
				.back()
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 5000)
				.back()
				.waitForElementById(elements.volunteers.active, 5000)
		});

		it('Delete a volunteer from active list - Other'.bgWhite.blue, function () {
			return driver
				.elementById(elements.actionBar.select)
				.click()
				.elementById(elements.volunteers.volunteer1.volunteer1)
				.click()
				.elementById(elements.volunteers.bottomBar.delete)
				.click()
				.elementById(elements.volunteers.delete.other)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.elementById(elements.actionBar.cancel)
				.click()
		});

		it('Volunteer no longer exists in the active tab - fourth test'.bgWhite.blue, function () {
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
		});
		
		it('Volunteer still does not exist in tab after refresh - fourth test'.bgWhite.blue, function () {
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
		});

		///fifth test
		it('Save volunteer1 and volunteer2 info'.bgWhite.blue, function () {
			//open active vol details edit page
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
				.elementById(elements.addEditVolunteer.firstName)
				.getAttribute('value')
				.then((value) => { vol1FirstName = value.trim() })
				.elementById(elements.addEditVolunteer.lastName)
				.getAttribute('value')
				.then((value) => { 
					if (value.trim().length === 0 && vol1FirstName.length === 0	) {
						throw new Error('The volunteer chosen for volunteer1 has no name')
					} else {
						vol1LastName = value.trim() 
					}
				})
				.then(() => { vol1FullName = firstName + ' ' + lastName })
				.back()
				.waitForElementById(elements.vol_details.volDetailsPageTitle,5000)
				.back()
				.waitForElementById(elements.volunteers.active,5000)
				.elementById(elements.volunteers.volunteer2.volunteer2)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 20000)
				.elementById(elements.actionBar.edit)
				.click()
				.waitForElementById(elements.addEditVolunteer.editVolunteerPageTitle, 10000)
				.elementById(elements.addEditVolunteer.firstName)
				.getAttribute('value')
				.then((value) => { vol2FirstName = value.trim() })
				.elementById(elements.addEditVolunteer.lastName)
				.click()
				.getAttribute('value')
				.then((value) => { 
					if (value.trim().length === 0 && vol2FirstName.length === 0	) {
						throw new Error('The volunteer chosen for volunteer2 has no name')
					} else {
						vol2LastName = value.trim() 
					}
				})
				.then(() => { vol2FullName = firstName + ' ' + lastName })
				.back()
				.waitForElementById(elements.vol_details.volDetailsPageTitle,5000)
				.back()
				.waitForElementById(elements.volunteers.active,5000)
		});
		
		it('Delete multiple volunteers from active list - Other'.bgWhite.blue, function () {
			return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_selected(el)})
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
				.elementById(elements.actionBar.cancel)
				.click()
		});

        it('Still on the active tab'.bgWhite.blue, function () {
            return driver
			.elementById(elements.volunteers.active)
			.then((el) => {return driver.is_visible(el).is_selected(el)})
        });

        it('Volunteer 1 no longer exists in the active tab - fifth test'.bgWhite.blue, function () {
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

        it('Volunteer 2 no longer exists in the active tab - fifth test'.bgWhite.blue, function () {
            return driver
                .elementById(elements.actionBar.search)
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

        it('Cancel search'.bgWhite.blue, function () {
            return driver
				.elementById(elements.actionBar.cancel)
				.click()
				.sleep(1000)
                .elementById(elements.volunteers.active)
                .then((el) => {return driver.is_visible(el).is_selected(el)})
        });

        it('Switch to inactive tab'.bgWhite.blue, function () {
			return driver
				.elementByIdOrNull(elements.volunteers.active)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.volunteers.inActive)
                .click()
                .elementById(elements.volunteers.inActive)
                .then((el) => {return driver.is_selected(el)})
        });

        it('Vol1 should not be in inactive tab either'.bgWhite.blue, function () {
			return driver
				.refresh_vol_or_prospect_list()
                .waitForElementById(elements.actionBar.search,10000)
                .click()
                .sendKeys(vol1FullName)
                .elementByXPath(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
        });

        it('Vol2 should not be in inactive tab either'.bgWhite.blue, function () {
			return driver
                .waitForElementById(elements.actionBar.search,10000)
				.clear()
				.sendKeys(vol2FullName)
                .elementByXPath(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
				.elementById(elements.actionBar.cancel)
				.click()
				.elementById(elements.volunteers.active)
				.click()
        });

		///sixth test
		it('On Active tab - sixth test'.bgWhite.blue, function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

		it('Open active volunteer details (edit page) - sixth test'.bgWhite.blue, function () {
			//open active vol details edit page
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

		it('Save volunteer information - sixth test'.bgWhite.blue, function () {
			//save vol info from edit
			return driver
				.elementById(elements.addEditVolunteer.firstName) //first and last name
				.getAttribute('value')
				.then((value) => { firstName = value.trim() })
				.elementById(elements.addEditVolunteer.lastName)
				.getAttribute('value')
				.then((value) => {lastName = value.trim()})
				.then(() => {fullName = firstName + ' ' + lastName })
				.back()
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 5000)
		});

		it('Delete active volunteer from Volunteer Details - Do Not Contact'.bgWhite.blue, function () {
			return driver
				.elementById(elements.vol_details.delete)
				.click()
				.elementById(elements.volunteers.delete.doNotContact)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('On Active tab - sixth test b'.bgWhite.blue, function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

        it('Volunteer no longer exists in the active tab - sixth test'.bgWhite.blue, function () {
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
		});
		
        it('Volunteer still does not exists in tab after refresh - sixth test'.bgWhite.blue, function () {
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
        });

		///seventh test
		it('On Active tab - seventh test'.bgWhite.blue, function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

		it('Open active volunteer details - seventh test'.bgWhite.blue, function () {
			//open active vol details edit page
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

		it('Save volunteer information - seventh test'.bgWhite.blue, function () {
			//save vol info from edit
			return driver
				.elementById(elements.addEditVolunteer.firstName) //first and last name
				.getAttribute('value')
				.then((value) => { firstName = value.trim() })
				.elementById(elements.addEditVolunteer.lastName)
				.getAttribute('value')
				.then((value) => {lastName = value.trim()})
				.then(() => {fullName = firstName + ' ' + lastName })
				.back()
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 5000)
		});

		it('Delete active volunteer from Volunteer Details - Not Interested'.bgWhite.blue, function () {
			return driver
				.elementById(elements.vol_details.delete)
				.click()
				.elementById(elements.volunteers.delete.notInterested)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('On Active tab - seventh test b'.bgWhite.blue, function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

        it('Volunteer no longer exists in the active tab - seventh test'.bgWhite.blue, function () {
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
		});
		
        it('Volunteer still does not exists in tab after refresh - seventh test'.bgWhite.blue, function () {
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
        });

		///eigth test
		it('On Active tab - eigth test'.bgWhite.blue, function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

		it('Open active volunteer details - eigth test'.bgWhite.blue, function () {
			//open active vol details edit page
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

		it('Save volunteer information - eigth test'.bgWhite.blue, function () {
			//save vol info from edit
			return driver
				.elementById(elements.addEditVolunteer.firstName) //first and last name
				.getAttribute('value')
				.then((value) => { firstName = value.trim() })
				.elementById(elements.addEditVolunteer.lastName)
				.getAttribute('value')
				.then((value) => {lastName = value.trim()})
				.then(() => {fullName = firstName + ' ' + lastName })
				.back()
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 5000)
		});

		it('Delete active volunteer from Volunteer Details - Moved'.bgWhite.blue, function () {
			return driver
				.elementById(elements.vol_details.delete)
				.click()
				.elementById(elements.volunteers.delete.moved)
				.click()
				.sleep(2000) // time for spinner to appear and hopefully disappear
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('On Active tab - eigth test b'.bgWhite.blue, function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

        it('Volunteer no longer exists in the active tab - eigth test'.bgWhite.blue, function () {
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
		});
		
        it('Volunteer still does not exists in tab after refresh - eigth test'.bgWhite.blue, function () {
			return driver
				.refresh_vol_or_prospect_list()
                .elementByIdOrNull(elements.volunteers.active)
                .then((el) => {return driver.recoverFromFailuresVolunteers(el)})
                .elementById(elements.actionBar.search)
				.clear()
                .sendKeys(fullName)
                .sleep(500) // wait for results (should be instant)
                .elementByXPathOrNull(elements.volunteers.volunteer1.fullName)
                .then((el) => {return driver.is_not_visible(el)})
				.elementById(elements.actionBar.cancel)
				.click()
        });

		///ninth test
		it('On Active tab - ninth test'.bgWhite.blue, function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

		it('Open active volunteer details - ninth test'.bgWhite.blue, function () {
			//open active vol details edit page
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

		it('Save volunteer information - ninth test'.bgWhite.blue, function () {
			//save vol info from edit
			return driver
				.elementById(elements.addEditVolunteer.firstName) //first and last name
				.getAttribute('value')
				.then((value) => { firstName = value.trim() })
				.elementById(elements.addEditVolunteer.lastName)
				.getAttribute('value')
				.then((value) => {lastName = value.trim()})
				.then(() => {fullName = firstName + ' ' + lastName })
				.back()
				.waitForElementById(elements.vol_details.volDetailsPageTitle, 5000)
		});

		it('Delete active volunteer from Volunteer Details - Other'.bgWhite.blue, function () {
			return driver
				.elementById(elements.vol_details.delete)
				.click()
				.elementById(elements.volunteers.delete.other)
				.click()
				.waitForElementToDisappearByClassName(elements.general.spinner)
		});

		it('On Active tab - ninth test b'.bgWhite.blue, function () {
            return driver
				.elementById(elements.volunteers.active)
				.then((el) => {return driver.is_visible(el).is_selected(el)})
		});

        it('Volunteer no longer exists in the active tab - ninth test'.bgWhite.blue, function () {

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
        });

        it('Volunteer still does not exist in tab after refresh - ninth test'.bgWhite.blue, function () {

			return driver
				.elementByIdOrNull(elements.volunteers.active,10000)
				.then((el) => {return driver.recoverFromFailuresVolunteers(el)})
				.refresh_vol_or_prospect_list()
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
        });



		// DUPLICATE ALL OF THE ABOVE FOR INACTIVE VOLUNTEERS



	});
};