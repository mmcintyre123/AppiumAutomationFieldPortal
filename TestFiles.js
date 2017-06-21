'use strict';

	module.exports.sampleTests = function ( sampleTests ) {

		switch ( sampleTests ) {
			case 'sample' :
				return require( './tests/sample.js' )();
			case 'icon_colors' :
				return require( './tests/icon_colors.js' )();
			case 'web_app' : 
				return require( './tests/web_app.js')();
			case 'add_contact' :
				return require( './tests/add_contact.js')();
			case 'target_page' :
				return require( './tests/target_page.js')();
			case 'walkbooks_smoke_tests' :
				return require( './tests/walkbooks_smoke_tests.js')();
			case 'add_note':
				return require('./tests/add_note.js')();
		}
		console.log( 'No test case was selected!' );
	};
