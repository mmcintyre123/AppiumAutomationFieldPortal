let apps = require('./apps.js');

// todo change the file structure here to be more like elements.walkbooks.surveys 
// rather than elements.surveys -- i.e. grouped by app area.

//iOS

	//use elementByClassName
	exports.general = {
		'spinner'  : 'XCUIElementTypeActivityIndicator'
	}

	// Updating from top down with accessibility IDs in Android - compare later to iOS
	//By ID
	exports.actionBar = {
		'hamburgerMenu'     :  'mnOverflow',
		'search'	        :  'Search', // magnifying glass - make sure this works in Android.
		'clearSearch'       :  'search_close_btn', // 'x' mark inside the search box
		'searchText'        :  'search_src_text', // active search query
		'refresh'	        :  'action_refresh',
		'addContact'	    :  '', // this usually adds a contact or volunteer, depending on the context.
		'checkConnectivity' :  'Check Connectivity',
		'logOut' 		    :  'Log Out' // probably use elementByName for Android
	}


	// currently by xpath and ID
	exports.loginLogout = {
		'userName'		 : 'etLoginUsername',
		'password'		 : 'etPassword',
		'logIn'			 : 'btnLogin',
		'rememberMe'	 : 'cbRemember',
		'forgotPassword' : 'btnForgotPassword', // also currently ID accessible
		'signOut'        : 'btnSignOut',
		'OK'			 : 'OK',
		'Cancel'		 : 'Cancel'
	}

	// by ID
	exports.homeScreen = {
		'walkbooks'		 : 'btnWalkbooks',
		'voterLookup'    : 'btnVoterLookup',
		'voterCheckIn'   : 'btnVoterCheckIn',
		'eventCheckIn'   : 'btnEventCheckIn'
	}

