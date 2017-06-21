"use strict";

let Q = require('q');
let _ = require('underscore');
let store = require('../helpers/store');
let config = require('../helpers/config');
let commons = require('../helpers/commons')
let driver = config.driver;

//for re-routing the each function to return/noop when
//we want to stop further action after some promise has
//been resolved.  See getFirstListItemByIdPart for example.
config.counter = 0;
config.resolvedFlags = {};
let key = config.counter;

exports.each = function (fn) {
  return function (els) {
    let seq = _(els).map(function (el, i) {
      return function () {
        return fn(el, i);
      };
    });
    // iterating
    return seq.reduce(Q.when, new Q()).then(function () {
      return els;
    });
  };
};

exports.filter = function (fn) {
  return function (els) {
    let seq = _(els).map(function (el, i) {
      return function (filteredEls) {
        return fn(el, i).then(function (isOk) {
          if (isOk) filteredEls.push(el);
          return filteredEls;
        });
      };
    });
    // iterating
    return seq.reduce(Q.when, new Q([]));
  };
};

exports.printNames = exports.each(function (el, i) {
  return el.getAttribute('name').print(i + "--> ");
});


exports.saveAllNameAttributes = function (idLike, array_name, regexp) {

  console.log('saveAllNameAttributes', idLike, array_name, regexp)

  config[array_name] = [];
  return exports.each(function(el, i) {
    console.log('iterating over eaches')
    return el.getAttribute('name').then(function (attr) {

      if (regexp == undefined) {regexp = new RegExp('.*' + idLike + '.*', 'i');}

      if (regexp.test(attr)) {
        config[array_name].push(attr);
      }

    });
  });
};

// this will quit saving upon encounter of the first attribute not matching the given id part
// speeds up saving primary targets or any time elements are listed in order and we only care about the first group
exports.saveFirstNameAttributes = function (idLike, array_name, regexp, els) {

  config[array_name] = [];
  console.log('Getting and saving current primary target elements'.white.bold)

  return Q.Promise(function(resolve, reject, notify) {
    let promises = exports.each(function(el, i) {
      return el.getAttribute('name').then(function (attr) {

        if (regexp == undefined) {regexp = new RegExp('.*' + idLike + '.*', 'i');}
        let regexpPlusBtn = new RegExp('^.*cellContactPlus_.*$', 'i');

        if (regexp.test(attr)) {

          config[array_name].push(attr);

        } else if ((regexp.test(attr) == false) && (regexpPlusBtn.test(attr) == false)) {

          // resolve after encountering the first element that is not a primary target or a plus button
          resolve();

        } else if ((els.length - 1) == i && config[array_name].length == 0) {

          // reject if all elements tested and none match
          reject(new Error('Could not find a list item id containing ' + idLike + '.'));

        } else if ((els.length - 1) == i && config[array_name].length != 0) {

          //resolve if we're at the end of the elements list and we saved some primaries
          resolve();

        }
      })
    })(els);
  });
};

exports.saveMenuButtonNames = exports.each(function(el, i) {
  return el.getAttribute('name').then(function (attr) {
    let this_key = 'menuButton_' + i;
    let this_value = attr;
    store.get('menuButtons')[this_key] = this_value;
  })
});


exports.getElementNameAttr = function getElementNameAttr(el) {
  return new Promise(function(resolve, reject) {
    return el.getAttribute('name')
  });
};

exports.getFirstListItemByIdPart = function (idPart) {

  if (idPart == undefined || idPart == '') {
    console.log('getFirstListItemByIdPart failed: The idPart was either undefined or blank.'.red.bold)
    return
  }
  console.log(('Running getFirstListItemByIdPart.  idPart is: ' + idPart).white.bold)
  return driver
    .waitForElementByClassName('XCUIElementTypeTable', 10000)
    .elementsByClassName('>','XCUIElementTypeCell')
    .then(function (els) {

        return Q.Promise(function(resolve, reject, notify) {
          config.counter += 1
          key = config.counter

          let promises = exports.each(function(el, i) {

            if (config.resolvedFlags[key] == true) {
              return 
            } else {

              return el.getAttribute('name').then(function (attr) {

                let regexp = new RegExp('.*' + idPart + '.*', 'i');
                let regexpIsHouse = new RegExp('.*cellHouse_.*', 'i')

                if (regexp.test(attr)) {
                  if (regexpIsHouse.test(attr)) { // for walkbook house list

                    if (config.thisHousehold == '' || config.thisHousehold == null) {

                        config.thisHousehold = attr;
                        config.resolvedFlags[key] = true

                    } else {

                        console.log(('config.thisHousehold was already defined as '
                                      + config.thisHousehold + '.  Redefining as ' + attr).white)
                        config.thisHousehold = attr;
                        config.resolvedFlags[key] = true

                    }

                    config.houseNum = Number(attr.match(/\d+/)[0]) + 1;
                    console.log(('getFirstListItemByIdPart picked ' + attr).white.bold)

                    return driver
                      .scrollHouseList(config.houseNum)
                      .then(function () {
                        resolve();
                      })

                  } else {

                      config.resolvedFlags[key] = true
                      return driver
                        .sleep(1)
                        .then(function () {
                          config.thisElem = attr;
                          console.log(('thisElem = ' + config.thisElem).white.bold.underline);
                          resolve();
                        })
                  }

                } else if ((els.length - 1) == i) {
                  // if all elements tested and none match
                  reject(new Error('Could not find a list item id containing ' + idPart + '.'));
                }

              })
              
            }
          })(els);
        });
      })
      .then(function () {
        if (config.thisHousehold != '') {
          console.log('End of getFirstListItemByIdPart, config.thisHousehold is now ' + config.thisHousehold)
        }
      })
};


exports.filterDisplayed = exports.filter(function (el) {
  return el.isDisplayed();
});

exports.filterWithName = function (name) {
  return exports.filter(function (el) {
    return el.getAttribute('name').then(function (_name) {
      return _name === name;
    });
  });
};

exports.filterWithNamePart = function (namePart) {
  let regexp = /.* + namePart + .*/i;
  return exports.filter(function (el) {
    return el.getAttribute('name').then(function (name) {
      return regexp.test(name);
    });
  });
};

