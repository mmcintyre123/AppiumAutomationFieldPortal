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

	describe("Logs in and verifies the counts and percents on the home screen".bgYellow.black, function() {

		let allPassed = true;
		console.log(('RUNNING ' + __filename.slice(__dirname.length + 1)).green.bold.underline)

		//set new percentages based on current expected counts

		it('Should set expected homeScreenStat percentages'.bgWhite.blue, function () {
			config.homeScreenStats[0].activepercent = Math.round((config.homeScreenStats[0].activecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
			config.homeScreenStats[0].inactivepercent = Math.round((config.homeScreenStats[0].inactivecount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
			config.homeScreenStats[0].reactivatedpercent = Math.round((config.homeScreenStats[0].reactivatedcount / config.homeScreenStats[0].volunteerbase) * 100) + '%'
		});
		
		it('Full Login'.bgWhite.blue, function () {
			this.retries = 1
			return driver
				.fullLogin()
		});

		it('Volunteer Base Count, String'.bgWhite.blue, function () {
			console.log(('First verify counts against expected tally based on test actions:\n').green.bold.underline)
			return driver
				.elementByXPath(elements.homeScreen.volBaseString)
				.then(function (el) {
					return el.getAttribute('name').then(function (string) {
						assert.equal(Number(string.match(/\d+/g)), config.homeScreenStats[0].volunteerbase)
						console.log('volunteerbase: ' + Number(string.match(/\d+/g)) + ' == ' + config.homeScreenStats[0].volunteerbase)
					})
				})
		});

		it('Active Count'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.activeCount)
				.then(function (el) {
					return el.getAttribute('name').then(function (count) {
						assert.equal(toString(count), config.homeScreenStats[0].activecount)
						console.log('activecount: ' + count + ' == ' + config.homeScreenStats[0].activecount)
					})
				})
		});

		it('Active Percent'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.activePercent)
				.then(function (el) {
					return el.getAttribute('name').then(function (percent) {
						assert.equal(percent, config.homeScreenStats[0].activepercent)
						console.log('activepercent: ' + percent + ' == ' + config.homeScreenStats[0].activepercent)
					})
				})
		});

		it('Inactive Count'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.inActiveCount)
				.then(function (el) {
					return el.getAttribute('name').then(function (count) {
						assert.equal(toString(count), config.homeScreenStats[0].inactivecount)
						console.log('inactivecount: ' + count + ' == ' + config.homeScreenStats[0].inactivecount)
					})
				})
		});

		it('Inactive Percent'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.inActivePercent)
				.then(function (el) {
					return el.getAttribute('name').then(function (percent) {
						assert.equal(percent, config.homeScreenStats[0].inactivepercent)
						console.log('inactivepercent: ' + percent + ' == ' + config.homeScreenStats[0].inactivepercent)
					})
				})
		});

		it('Re-activated Count'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.reActivatedCount)
				.then(function (el) {
					return el.getAttribute('name').then(function (count) {
						assert.equal(toString(count), config.homeScreenStats[0].reactivatedcount)
						console.log('reactivatedcount: ' + count + ' == ' + config.homeScreenStats[0].reactivatedcount)
					})
				})
		});

		it('Re-activated Percent'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.reActivatedPercent)
				.then(function (el) {
					return el.getAttribute('name').then(function (percent) {
						assert.equal(percent, config.homeScreenStats[0].reactivatedpercent)
						console.log('reactivatedpercent: ' + percent + ' == ' + config.homeScreenStats[0].reactivatedpercent)
					})
				})
		});

		it('Get home screen stats from SQL'.bgWhite.blue, function () {
			console.log(('Next verify tally against values in SQL:\n').green.bold.underline)
			return driver
				.sleep(1)
				.then(function getHomeScreenStats() {
					return sqlQuery.getHomeScreenStats()
				})
				.wait_for_sql('getHomeScreenStats', 'homeScreenStats')
		});

		it('Volunteer Base Count, String'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.volBaseString)
				.then(function (el) {
					return el.getAttribute('name').then(function (string) {
						assert.equal(Number(string.match(/\d+/g)), config.homeScreenStats[0].volunteerbase)
						console.log('volunteerbase: ' + Number(string.match(/\d+/g)) + ' == ' + config.homeScreenStats[0].volunteerbase)
					})
				})
		});

		it('Active Count'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.activeCount)
				.then(function (el) {
					return el.getAttribute('name').then(function (count) {
						assert.equal(toString(count), config.homeScreenStats[0].activecount)
						console.log('activecount: ' + count + ' == ' + config.homeScreenStats[0].activecount)
					})
				})
		});

		it('Active Percent'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.activePercent)
				.then(function (el) {
					return el.getAttribute('name').then(function (percent) {
						assert.equal(percent, config.homeScreenStats[0].activepercent)
						console.log('activepercent: ' + percent + ' == ' + config.homeScreenStats[0].activepercent)
					})
				})
		});

		it('Inactive Count'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.inActiveCount)
				.then(function (el) {
					return el.getAttribute('name').then(function (count) {
						assert.equal(toString(count), config.homeScreenStats[0].inactivecount)
						console.log('inactivecount: ' + count + ' == ' + config.homeScreenStats[0].inactivecount)
					})
				})
		});

		it('Inactive Percent'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.inActivePercent)
				.then(function (el) {
					return el.getAttribute('name').then(function (percent) {
						assert.equal(percent, config.homeScreenStats[0].inactivepercent)
						console.log('inactivepercent: ' + percent + ' == ' + config.homeScreenStats[0].inactivepercent)
					})
				})
		});

		it('Re-activated Count'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.reActivatedCount)
				.then(function (el) {
					return el.getAttribute('name').then(function (count) {
						assert.equal(toString(count), config.homeScreenStats[0].reactivatedcount)
						console.log('reactivatedcount: ' + count + ' == ' + config.homeScreenStats[0].reactivatedcount)
					})
				})
		});

		it('Re-activated Percent'.bgWhite.blue, function () {
			return driver
				.elementByXPath(elements.homeScreen.reActivatedPercent)
				.then(function (el) {
					return el.getAttribute('name').then(function (percent) {
						assert.equal(percent, config.homeScreenStats[0].reactivatedpercent)
						console.log('reactivatedpercent: ' + percent + ' == ' + config.homeScreenStats[0].reactivatedpercent)
					})
				})
		});

	});
};