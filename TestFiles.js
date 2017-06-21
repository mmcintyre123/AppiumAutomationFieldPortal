'use strict';

	module.exports.sampleTests = function ( sampleTests ) {

		switch ( sampleTests ) {
			case 'sample' :
				return require( './tests/sample.js' )();
			case 'add_edit_volunteer' :
				return require( './tests/add_edit_volunteer.js')();
		}
		console.log( 'No test case was selected!' );
	};
