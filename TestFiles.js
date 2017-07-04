'use strict';

	module.exports.sampleTests = function ( sampleTests ) {

		switch ( sampleTests ) {
			case 'sample' :
				return require( './tests/sample.js' )();
			case 'add_edit_volunteer' :
				return require( './tests/add_edit_volunteer.js')();
			case 'login_counts_homescreen' :
				return require( './tests/login_counts_homescreen.js')();
			case 'prospects' :
				return require( './tests/prospects.js')();
			case 'inactive_vols' :
				return require( './tests/inactive_vols.js')();
		}
		console.log( 'No test case was selected!' );
	};
