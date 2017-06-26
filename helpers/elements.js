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
        'hamburgerMenu' : 'hamburger',
        'search'        : 'Search', // magnifying glass - make sure this works in Android.
        'select'        : 'Select',
        'cancel'        : 'Cancel',
        'save'          : 'Save',
        'back'          : 'Back',
        'addVolunteer'  : 'Add', // Bottom right of the screen
        'logOut'        : 'Log Out' // in the hamburger menu
    }


	// currently by xpath and ID
	exports.loginLogout = {
        'userName'       : 'etUsername',
        'password'       : 'etPassword',
        'logIn'          : 'btnLogin',
        'rememberMe'     : 'cbRemember',
        'forgotPassword' : 'btnForgotPassword', // also currently ID accessible
        'signOut'        : 'btnSignOut',
        'OK'             : 'OK'
    }

	// by ID
	exports.homeScreen = {
        'events'             : '',
        'surveys'            : '',
        'volunteers'         : 'btnVolunteers',
        'activeCount'        : '//*/XCUIElementTypeOther/XCUIElementTypeStaticText[4]',
        'activePercent'      : '//*/XCUIElementTypeOther/XCUIElementTypeStaticText[5]',
        'inActiveCount'      : '//*/XCUIElementTypeOther/XCUIElementTypeStaticText[8]',
        'inActivePercent'    : '//*/XCUIElementTypeOther/XCUIElementTypeStaticText[10]',
        'reActivatedCount'   : '//*/XCUIElementTypeStaticText[9]',
        'reActivatedPercent' : '//*/XCUIElementTypeStaticText[11]'
        //'activeCount'        : '',
        //'activePercent'      : '',
        //'inActiveCount'      : '',
        //'inActivePercent'    : '',
        //'reActivatedCount'   : '',
        //'reActivatedPercent' : ''
    }

	exports.volunteers = {
        'active'          : 'Active',
        'inActive'        : 'Inactive',
        'prospects'       : 'My Prospects',
        'volunteer1'      : 'cellVolunteer_0',
        'volunteer2'      : 'cellVolunteer_1',
        'volunteer3'      : 'cellVolunteer_2',
        'volunteer4'      : 'cellVolunteer_3',
        'volunteer5'      : 'cellVolunteer_4',
        'volunteer6'      : 'cellVolunteer_5',
        'volunteer7'      : 'cellVolunteer_6',
        'volunteer8'      : 'cellVolunteer_7',
        'volunteer9'      : 'cellVolunteer_8',
        'volunteer1phone' : 'cellVolunteer_phone3_0',
        'volunteer2phone' : 'cellVolunteer_phone3_1',
        'volunteer3phone' : 'cellVolunteer_phone3_2'
    }

	exports.vol_details = {
        'delete' : 'Delete',
        'share'  : 'Share',
        'tags'   : 'btnAddTag',
        'notes'  : 'btnAddNote',
        'email'  : 'tvEmail',
        'phone'  : 'tvPhone',
        'tag'    : {
                        'categ1' : 'tagCategory_0',
                        'categ2' : 'tagCategory_1',
                        'categ3' : 'tagCategory_2',
                        'categ4' : 'tagCategory_3',
                        'tag1'   : 'tagItem_0',
                        'tag2'   : 'tagItem_1',
                        'tag3'   : 'tagItem_2',
                        'tag4'   : 'tagItem_3'
                   },
        'note'   : {
                        'title' : 'etNoteTitle',
                        'text' : 'etNoteText'
                   }
    }

	exports.addVolunteer = {
        'salut'       : 'Salutation',
        'firstName'   : 'etFirstNameEdit',
        'lastName'    : 'etLastNameEdit',
        'suffix'      : 'Suffix',
        'twitter'     : 'etTwitterEdit',
        'facebook'    : 'etFacebookEdit',
        'addr1'       : 'etAddressEdit',
        'addr2'       : 'etAddress2Edit',
        'city'        : 'etCityEdit',
        'state'       : '//*/XCUIElementTypeOther/XCUIElementTypeTable/XCUIElementTypeCell[10]/XCUIElementTypeTextField',
        'zip'         : 'etZipEdit',
        'county'      : 'etCounty',
        'phone1'      : 'cbPhone1Edit',
        'phone1toggle': 'cbPhone1',
        'phone2'      : 'cbPhone2Edit',
        'phone2'      : 'cbPhone2',
        'phone3'      : 'cbPhone3Edit',
        'phone3'      : 'cbPhone3',
        'email'       : 'etEmailEdit',
        'gender'      : 'Gender',
        'dob'         : 'Date of Birth',
        'employer'    : 'etEmployerEdit',
        'occupation'  : 'etOccupationEdit',
        'done'        : 'Done',
        'coord'       : '//*/XCUIElementTypeOther/XCUIElementTypeTable/XCUIElementTypeCell[21]/XCUIElementTypeTextField'
    }
