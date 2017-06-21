/* ================================================================
 * xutil by xdf(xudafeng[at]126.com)
 *
 * first created at : Mon Feb 29 2016 22:37:05 GMT+0800 (CST)
 *
 * ================================================================
 * Copyright  xdf
 *
 * Licensed under the MIT License
 * You may not use this file except in compliance with the License.
 *
 * ================================================================ */

'use strict';

var _ = require('..');

describe('test', function() {
  it('base', function() {
    _.ipv4.should.be.ok();
    _.uuid().should.be.ok();
  });
});
