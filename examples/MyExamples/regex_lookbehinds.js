//test strings
cellHouse_10_sfh_notstarted
cellHouse_0_mfh_attempted
cellHouse_0_sfh_partial
cellHouse_0_sfh_reject
cellHouse_0_sfh_complete

//lookbehind expressions to match "notstarted", 'attempted', etc above
(?<=cellHouse_\d{2}_\w{3}_)\w+
(?<=cellHouse_\d_\w{3}_)\w+

//install some libraries
npm i -g npm #update npm
npm install lodash.merge
npm install xregexp
npm install xregexp-lookbehind

//test it out
let merge = require('lodash.merge');
let XRegExp = require('xregexp');
merge(XRegExp, require('xregexp-lookbehind'));

let h1 = 'cellHouse_10_sfh_notstarted';
let h2 = 'cellHouse_0_mfh_attempted';

XRegExp.matchAllLb(h1, "(?i)(?<=cellHouse_\\d{2}_\\w{3}_)", /\w*/i)[0] 
'Above should be string notstarted'
XRegExp.matchAllLb(h2, "(?i)(?<=cellHouse_\\d_\\w{3}_)", /\w*/i)[0]
'Above should be string attempted'
