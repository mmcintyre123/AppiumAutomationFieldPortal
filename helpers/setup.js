require( 'colors' );
let wd 			         = require( 'wd' );
let chai                 = require( 'chai' );
let chaiAsPromised       = require( 'chai-as-promised' );
let should               = chai.should();
let expect               = chai.expect;
let assert               = chai.assert;
let actions              = require('./actions');
let commons              = require('./commons');
let promiseUtils         = require('./promise-utils');
let config    			 = require('./config');
let sqlQuery             = require('./queries');


chai.config.includeStack = true;
chaiAsPromised.transferPromiseness = wd.transferPromiseness;
chai.use(chaiAsPromised);

wd.addPromiseChainMethod('swipe', actions.swipe);
wd.addPromiseChainMethod('takeScreenshotMethod', actions.takeScreenshotMethod);
wd.addPromiseChainMethod('startTime',commons.startTime);
wd.addPromiseChainMethod('endTotalAndLogTime',commons.endTotalAndLogTime);
wd.addPromiseChainMethod('loginQuick',commons.loginQuick);
wd.addPromiseChainMethod('fullLogin',commons.fullLogin);
wd.addPromiseChainMethod('pry',commons.pry);
wd.addPromiseChainMethod('mute',commons.mute);
wd.addPromiseChainMethod('unmute',commons.unmute);
wd.addPromiseChainMethod('scrollHouseList',commons.scrollHouseList);
wd.addPromiseChainMethod('getFirstListItemByIdPart',promiseUtils.getFirstListItemByIdPart);
wd.addPromiseChainMethod('refreshHouseList',commons.refreshHouseList);
wd.addPromiseChainMethod('consoleLog',commons.consoleLog);
wd.addPromiseChainMethod('saveAllNameAttributes',promiseUtils.saveAllNameAttributes);
wd.addPromiseChainMethod('saveFirstNameAttributes',promiseUtils.saveFirstNameAttributes);
wd.addPromiseChainMethod('getHouseWithMultPrimary',commons.getHouseWithMultPrimary);
wd.addPromiseChainMethod('surveyAllPrimaryTargets',commons.surveyAllPrimaryTargets);
wd.addPromiseChainMethod('homeToHouseList',commons.homeToHouseList);
wd.addPromiseChainMethod('waitForElementToDisappearByClassName',commons.waitForElementToDisappearByClassName);
wd.addPromiseChainMethod('getHousesWithMoreThan1Primary',sqlQuery.getHousesWithMoreThan1Primary);
wd.addPromiseChainMethod('touchedHouses',sqlQuery.touchedHouses);


exports.should = should;
exports.expect = expect;
exports.assert = assert;
exports.chai   = chai;

