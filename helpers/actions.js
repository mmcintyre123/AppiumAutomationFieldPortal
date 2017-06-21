"use strict";

let wd     = require('wd'),
    Q      = require('q'),
    sizeOf = require('image-size'),
    config = require('./config'),
    fs     = require('fs-extra');
const resizeImg = require('resize-img');


exports.swipe = function (opts) {
  let action = new wd.TouchAction();
  action
    .press({x: opts.startX, y: opts.startY})
    // .wait(opts.duration)
    .moveTo({x: opts.offsetX, y: opts.offsetY})
    .release();
  return this.performTouchAction(action);
};

exports.pinch = function (el) {
  return Q.all([
    el.getSize(),
    el.getLocation(),
  ]).then(function (res) {
    let size = res[0];
    let loc = res[1];
    let center = {
      x: loc.x + size.width / 2,
      y: loc.y + size.height / 2
    };
    let a1 = new wd.TouchAction(this);
    a1.press({el: el, x: center.x, y: center.y - 100}).moveTo({el: el}).release();
    let a2 = new wd.TouchAction(this);
    a2.press({el: el, x: center.x, y: center.y + 100}).moveTo({el: el}).release();
    let m = new wd.MultiAction(this);
    m.add(a1, a2);
    return m.perform();
  }.bind(this));
};

exports.zoom = function (el) {
  return Q.all([
    this.getWindowSize(),
    this.getLocation(el),
  ]).then(function (res) {
    let size = res[0];
    let loc = res[1];
    let center = {
      x: loc.x + size.width / 2,
      y: loc.y + size.height / 2
    };
    let a1 = new wd.TouchAction(this);
    a1.press({el: el}).moveTo({el: el, x: center.x, y: center.y - 100}).release();
    let a2 = new wd.TouchAction(this);
    a2.press({el: el}).moveTo({el: el, x: center.x, y: center.y + 100}).release();
    let m = new wd.MultiAction(this);
    m.add(a1, a2);
    return m.perform();
  }.bind(this));
};

exports.takeScreenshotMethod = function(name) {
  var context = this;
  var unmute;
  return context
    .sleep(1)
    // base64 screeshot without printing output!
    .then(function () {
      var mute = require('mute');
      unmute = mute();
      return context
        .takeScreenshot()
        .should.eventually.exist;
    })
    // save screenshot to local file
    .then(function() {
      unmute();
      try {
        fs.unlinkSync('screenShots/' + name + '.png');
      } catch (ign) {}
      fs.existsSync('screenShots/' + name + '.png').should.not.be.ok;
    })
    .saveScreenshot('screenShots/' + name + '.png')
    .then(function() {
      fs.existsSync('screenShots/' + name + '.png').should.be.ok;
    })
    // get the dimensions of the screenshot (for shrinking below)
    .then(function () {
      config.dimensions = sizeOf('screenShots/' + name + '.png')
      config.width = config.dimensions['width'] / 2
      config.height = config.dimensions['height'] / 2
    })
    // shrink the image to make it easier to see
    .then(function() {
      resizeImg(fs.readFileSync('screenShots/' + name + '.png'), {
        width: config.width,
        height: config.height
      }).then(buf => {
        fs.writeFileSync('screenShots/' + name + '.png', buf);
      });
    })
};

