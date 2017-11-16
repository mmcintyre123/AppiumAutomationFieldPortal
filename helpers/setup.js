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

//actions
wd.addPromiseChainMethod('swipe', actions.swipe);
wd.addPromiseChainMethod('customTap', actions.customTap);
wd.addPromiseChainMethod('pinch', actions.pinch);
wd.addPromiseChainMethod('zoom', actions.zoom);
wd.addPromiseChainMethod('takeScreenshotMethod', actions.takeScreenshotMethod);

//promise-utils
wd.addPromiseChainMethod('saveAllNameAttributes',promiseUtils.saveAllNameAttributes);
wd.addPromiseChainMethod('saveFirstNameAttributes',promiseUtils.saveFirstNameAttributes);
wd.addPromiseChainMethod('getFirstListItemByIdPart',promiseUtils.getFirstListItemByIdPart);

//commons
wd.addPromiseChainMethod('startTime',commons.startTime);
wd.addPromiseChainMethod('endTotalAndLogTime',commons.endTotalAndLogTime);
wd.addPromiseChainMethod('loginQuick',commons.loginQuick);
wd.addPromiseChainMethod('fullLogin',commons.fullLogin);
wd.addPromiseChainMethod('pry',commons.pry);
wd.addPromiseChainMethod('mute',commons.mute);
wd.addPromiseChainMethod('unmute',commons.unmute);
wd.addPromiseChainMethod('scrollHouseList',commons.scrollHouseList);
wd.addPromiseChainMethod('refreshHouseList',commons.refreshHouseList);
wd.addPromiseChainMethod('consoleLog',commons.consoleLog);
wd.addPromiseChainMethod('surveyAllPrimaryTargets',commons.surveyAllPrimaryTargets);
wd.addPromiseChainMethod('homeToHouseList',commons.homeToHouseList);
wd.addPromiseChainMethod('waitForElementToDisappearByClassName',commons.waitForElementToDisappearByClassName);
wd.addPromiseChainMethod('wait_for_sql',commons.wait_for_sql);
wd.addPromiseChainMethod('recoverFromFailuresVolunteers',commons.recoverFromFailuresVolunteers);
wd.addPromiseChainMethod('is_selected',commons.is_selected)
wd.addPromiseChainMethod('is_not_selected',commons.is_not_selected)
wd.addPromiseChainMethod('is_visible',commons.is_visible)
wd.addPromiseChainMethod('is_not_visible',commons.is_not_visible)
wd.addPromiseChainMethod('refresh_vol_or_prospect_list',commons.refresh_vol_or_prospect_list)
wd.addPromiseChainMethod('getHouseWithMultPrimary',commons.getHouseWithMultPrimary);

// queries
wd.addPromiseChainMethod('touchedHouses',sqlQuery.touchedHouses);
wd.addPromiseChainMethod('getHousesWithMoreThan1Primary',sqlQuery.getHousesWithMoreThan1Primary);
wd.addPromiseChainMethod('getUserRoles',sqlQuery.getUserRoles);
wd.addPromiseChainMethod('getDeletedVolTags',sqlQuery.getDeletedVolTags);

exports.should = should;
exports.expect = expect;
exports.assert = assert;
exports.chai   = chai;

