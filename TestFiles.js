'use strict';

	module.exports.sampleTests = function ( sampleTests ) {

		switch ( sampleTests ) {
			case 'sample' :
				return require('./examples/MyExamples/sample.js')();
			case 'add_edit_volunteer' :
				return require( './tests/add_edit_volunteer.js')();
			case 'login_counts_homescreen_initial' :
				return require( './tests/login_counts_homescreen_initial.js')();
			case 'login_counts_homescreen_final' :
				return require( './tests/login_counts_homescreen_final.js')();
			case 'prospects' :
				return require( './tests/prospects.js')();
			case 'inactive_vols' :
				return require( './tests/inactive_vols.js')();
			case 'texting' :
				return require( './tests/texting.js')();
			case 'active_vols' :
				return require( './tests/active_vols.js')();
			case 'delete_volunteers' :
				return require( './tests/delete_volunteers.js')();
			case 'clean_data' :
				return require( './tests/clean_data.js')();
		}
		console.log( 'No test case was selected!' );
	};
