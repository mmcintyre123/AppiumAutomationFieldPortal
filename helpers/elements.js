let apps   = require('./apps.js');
let config = require('./config');

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
        'edit'          : 'Edit',
        'back'          : 'Back',
        'addAsVol'      : 'Add as Volunteer', //ios - todo likely doesn't match Android
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
        'events'             : 'btnEvents',
        'surveys'            : 'btnSurveys',
        'volunteers'         : 'btnVolunteers',
        'text'               : 'btnText',
        'volBaseString'      : '//*/XCUIElementTypeOther/XCUIElementTypeStaticText[1]',
        'activeCount'        : '//*/XCUIElementTypeOther/XCUIElementTypeStaticText[4]',
        'activePercent'      : '//*/XCUIElementTypeOther/XCUIElementTypeStaticText[5]',
        'inActiveCount'      : '//*/XCUIElementTypeOther/XCUIElementTypeStaticText[8]',
        'inActivePercent'    : '//*/XCUIElementTypeOther/XCUIElementTypeStaticText[10]',
        'reActivatedCount'   : '//*/XCUIElementTypeStaticText[9]',
        'reActivatedPercent' : '//*/XCUIElementTypeStaticText[11]'
    }

	exports.volunteers = {
        'active'        : 'Active',
        'activeTable'   : 'IvActive',
        'inActive'      : 'Inactive',
        'inActiveTable' : 'IvInactive',
        'prospects'     : 'My Prospects',
        'prospectTable' : 'IvProspects',
        'volunteer1'    : { 'volunteer1'   : 'cellVolunteer_0',
                              'fullName'   : '//XCUIElementTypeCell[@name="cellVolunteer_0"][1]/XCUIElementTypeStaticText[1]',
                              'cityState'  : '//XCUIElementTypeCell[@name="cellVolunteer_0"][1]/XCUIElementTypeStaticText[2]',
                              'email'      : '//XCUIElementTypeCell[@name="cellVolunteer_0"][1]/XCUIElementTypeStaticText[3]',
                              'phone1'     : '//XCUIElementTypeCell[@name="cellVolunteer_0"][1]/XCUIElementTypeButton[1]',
                              'phone2'     : '//XCUIElementTypeCell[@name="cellVolunteer_0"][1]/XCUIElementTypeButton[2]',
                              'phone3'     : '//XCUIElementTypeCell[@name="cellVolunteer_0"][1]/XCUIElementTypeButton[3]'
                            },
        'volunteer2'      : { 'volunteer2' : 'cellVolunteer_1',
                              'fullName'   : '//XCUIElementTypeCell[@name="cellVolunteer_1"][1]/XCUIElementTypeStaticText[1]',
                              'cityState'  : '//XCUIElementTypeCell[@name="cellVolunteer_1"][1]/XCUIElementTypeStaticText[2]',
                              'email'      : '//XCUIElementTypeCell[@name="cellVolunteer_1"][1]/XCUIElementTypeStaticText[3]',
                              'phone1'     : '//XCUIElementTypeCell[@name="cellVolunteer_1"][1]/XCUIElementTypeButton[1]',
                              'phone2'     : '//XCUIElementTypeCell[@name="cellVolunteer_1"][1]/XCUIElementTypeButton[2]',
                              'phone3'     : '//XCUIElementTypeCell[@name="cellVolunteer_1"][1]/XCUIElementTypeButton[3]'
                            },
        'volunteer3'      : { 'volunteer3' : 'cellVolunteer_2',
                              'fullName'   : '//XCUIElementTypeCell[@name="cellVolunteer_2"][1]/XCUIElementTypeStaticText[1]',
                              'cityState'  : '//XCUIElementTypeCell[@name="cellVolunteer_2"][1]/XCUIElementTypeStaticText[2]',
                              'email'      : '//XCUIElementTypeCell[@name="cellVolunteer_2"][1]/XCUIElementTypeStaticText[3]',
                              'phone1'     : '//XCUIElementTypeCell[@name="cellVolunteer_2"][1]/XCUIElementTypeButton[1]',
                              'phone2'     : '//XCUIElementTypeCell[@name="cellVolunteer_2"][1]/XCUIElementTypeButton[2]',
                              'phone3'     : '//XCUIElementTypeCell[@name="cellVolunteer_2"][1]/XCUIElementTypeButton[3]'
                            },
        'volunteer4'      : { 'volunteer4' : 'cellVolunteer_3',
                              'fullName'   : '//XCUIElementTypeCell[@name="cellVolunteer_3"][1]/XCUIElementTypeStaticText[1]',
                              'cityState'  : '//XCUIElementTypeCell[@name="cellVolunteer_3"][1]/XCUIElementTypeStaticText[2]',
                              'email'      : '//XCUIElementTypeCell[@name="cellVolunteer_3"][1]/XCUIElementTypeStaticText[3]',
                              'phone1'     : '//XCUIElementTypeCell[@name="cellVolunteer_3"][1]/XCUIElementTypeButton[1]',
                              'phone2'     : '//XCUIElementTypeCell[@name="cellVolunteer_3"][1]/XCUIElementTypeButton[2]',
                              'phone3'     : '//XCUIElementTypeCell[@name="cellVolunteer_3"][1]/XCUIElementTypeButton[3]'
                            },
        'volunteer5'      : { 'volunteer5' : 'cellVolunteer_4',
                              'fullName'   : '//XCUIElementTypeCell[@name="cellVolunteer_4"][1]/XCUIElementTypeStaticText[1]',
                              'cityState'  : '//XCUIElementTypeCell[@name="cellVolunteer_4"][1]/XCUIElementTypeStaticText[2]',
                              'email'      : '//XCUIElementTypeCell[@name="cellVolunteer_4"][1]/XCUIElementTypeStaticText[3]',
                              'phone1'     : '//XCUIElementTypeCell[@name="cellVolunteer_4"][1]/XCUIElementTypeButton[1]',
                              'phone2'     : '//XCUIElementTypeCell[@name="cellVolunteer_4"][1]/XCUIElementTypeButton[2]',
                              'phone3'     : '//XCUIElementTypeCell[@name="cellVolunteer_4"][1]/XCUIElementTypeButton[3]'
                            },
        'volunteer6'      : { 'volunteer6' : 'cellVolunteer_5',
                              'fullName'   : '//XCUIElementTypeCell[@name="cellVolunteer_5"][1]/XCUIElementTypeStaticText[1]',
                              'cityState'  : '//XCUIElementTypeCell[@name="cellVolunteer_5"][1]/XCUIElementTypeStaticText[2]',
                              'email'      : '//XCUIElementTypeCell[@name="cellVolunteer_5"][1]/XCUIElementTypeStaticText[3]',
                              'phone1'     : '//XCUIElementTypeCell[@name="cellVolunteer_5"][1]/XCUIElementTypeButton[1]',
                              'phone2'     : '//XCUIElementTypeCell[@name="cellVolunteer_5"][1]/XCUIElementTypeButton[2]',
                              'phone3'     : '//XCUIElementTypeCell[@name="cellVolunteer_5"][1]/XCUIElementTypeButton[3]'
                            },
        'volunteer7'      : { 'volunteer7' : 'cellVolunteer_6',
                              'fullName'   : '//XCUIElementTypeCell[@name="cellVolunteer_6"][1]/XCUIElementTypeStaticText[1]',
                              'cityState'  : '//XCUIElementTypeCell[@name="cellVolunteer_6"][1]/XCUIElementTypeStaticText[2]',
                              'email'      : '//XCUIElementTypeCell[@name="cellVolunteer_6"][1]/XCUIElementTypeStaticText[3]',
                              'phone1'     : '//XCUIElementTypeCell[@name="cellVolunteer_6"][1]/XCUIElementTypeButton[1]',
                              'phone2'     : '//XCUIElementTypeCell[@name="cellVolunteer_6"][1]/XCUIElementTypeButton[2]',
                              'phone3'     : '//XCUIElementTypeCell[@name="cellVolunteer_6"][1]/XCUIElementTypeButton[3]'
                            },
        'searchResults'   : 'Search results'
    }

	exports.prospects = {
        'prospect1'      : { 'prospect1' : 'cellProspect_0',
                             'fullName'  : '//XCUIElementTypeCell[@name="cellProspect_0"][1]/XCUIElementTypeStaticText[1]',
                             'cityState' : '//XCUIElementTypeCell[@name="cellProspect_0"][1]/XCUIElementTypeStaticText[2]',
                             'email'     : '//XCUIElementTypeCell[@name="cellProspect_0"][1]/XCUIElementTypeStaticText[3]',
                             'phone1'    : '//XCUIElementTypeCell[@name="cellProspect_0"][1]/XCUIElementTypeButton[1]',
                             'phone2'    : '//XCUIElementTypeCell[@name="cellProspect_0"][1]/XCUIElementTypeButton[2]',
                             'phone3'    : '//XCUIElementTypeCell[@name="cellProspect_0"][1]/XCUIElementTypeButton[3]'
                            },
        'prospect2'      : { 'prospect2' : 'cellProspect_1',
                             'fullName'  : '//XCUIElementTypeCell[@name="cellProspect_1"][1]/XCUIElementTypeStaticText[1]',
                             'cityState' : '//XCUIElementTypeCell[@name="cellProspect_1"][1]/XCUIElementTypeStaticText[2]',
                             'email'     : '//XCUIElementTypeCell[@name="cellProspect_1"][1]/XCUIElementTypeStaticText[3]',
                             'phone1'    : '//XCUIElementTypeCell[@name="cellProspect_1"][1]/XCUIElementTypeButton[1]',
                             'phone2'    : '//XCUIElementTypeCell[@name="cellProspect_1"][1]/XCUIElementTypeButton[2]',
                             'phone3'    : '//XCUIElementTypeCell[@name="cellProspect_1"][1]/XCUIElementTypeButton[3]'
                            },
        'prospect3'      : { 'prospect3' : 'cellProspect_2',
                             'fullName'  : '//XCUIElementTypeCell[@name="cellProspect_2"][1]/XCUIElementTypeStaticText[1]',
                             'cityState' : '//XCUIElementTypeCell[@name="cellProspect_2"][1]/XCUIElementTypeStaticText[2]',
                             'email'     : '//XCUIElementTypeCell[@name="cellProspect_2"][1]/XCUIElementTypeStaticText[3]',
                             'phone1'    : '//XCUIElementTypeCell[@name="cellProspect_2"][1]/XCUIElementTypeButton[1]',
                             'phone2'    : '//XCUIElementTypeCell[@name="cellProspect_2"][1]/XCUIElementTypeButton[2]',
                             'phone3'    : '//XCUIElementTypeCell[@name="cellProspect_2"][1]/XCUIElementTypeButton[3]'
                            },
        'prospect4'      : { 'prospect4' : 'cellProspect_3',
                             'fullName'  : '//XCUIElementTypeCell[@name="cellProspect_3"][1]/XCUIElementTypeStaticText[1]',
                             'cityState' : '//XCUIElementTypeCell[@name="cellProspect_3"][1]/XCUIElementTypeStaticText[2]',
                             'email'     : '//XCUIElementTypeCell[@name="cellProspect_3"][1]/XCUIElementTypeStaticText[3]',
                             'phone1'    : '//XCUIElementTypeCell[@name="cellProspect_3"][1]/XCUIElementTypeButton[1]',
                             'phone2'    : '//XCUIElementTypeCell[@name="cellProspect_3"][1]/XCUIElementTypeButton[2]',
                             'phone3'    : '//XCUIElementTypeCell[@name="cellProspect_3"][1]/XCUIElementTypeButton[3]'
                            },
        'prospect5'      : { 'prospect5' : 'cellProspect_4',
                             'fullName'  : '//XCUIElementTypeCell[@name="cellProspect_4"][1]/XCUIElementTypeStaticText[1]',
                             'cityState' : '//XCUIElementTypeCell[@name="cellProspect_4"][1]/XCUIElementTypeStaticText[2]',
                             'email'     : '//XCUIElementTypeCell[@name="cellProspect_4"][1]/XCUIElementTypeStaticText[3]',
                             'phone1'    : '//XCUIElementTypeCell[@name="cellProspect_4"][1]/XCUIElementTypeButton[1]',
                             'phone2'    : '//XCUIElementTypeCell[@name="cellProspect_4"][1]/XCUIElementTypeButton[2]',
                             'phone3'    : '//XCUIElementTypeCell[@name="cellProspect_4"][1]/XCUIElementTypeButton[3]'
                            }
    }

	exports.prospectDetails = {
        'delete'          : 'Delete',
        'firstAndLastName': '//*/XCUIElementTypeOther/XCUIElementTypeScrollView/XCUIElementTypeStaticText[1]',
        'address'         : '//*/XCUIElementTypeOther/XCUIElementTypeScrollView/XCUIElementTypeStaticText[3]',
        'share'           : 'Share',
        'notes'           : 'btnAddNote',
        'email'           : 'tvEmail',
        'phone'           : 'tvPhone',
        'note'            : {
                                'title' : 'etNoteTitle',
                                'text' : 'etNoteText'
                            }
    }

	exports.vol_details = {
        'firstAndLastName': '//*/XCUIElementTypeOther/XCUIElementTypeScrollView/XCUIElementTypeStaticText[1]',
        'email'           : 'tvEmail',
        'phone'           : 'tvPhone',
        'address'         : '//*/XCUIElementTypeOther/XCUIElementTypeScrollView/XCUIElementTypeStaticText[3]',
        'tags'            : 'btnAddTag',
        'notes'           : 'btnAddNote',
        'delete'          : 'Delete',
        'share'           : 'Share',
        'tag'             : { 'categ1' : 'tagCategory_0',
                              'categ2' : 'tagCategory_1',
                              'categ3' : 'tagCategory_2',
                              'categ4' : 'tagCategory_3',
                              'tag1'   : 'tagItem_0',
                              'tag2'   : 'tagItem_1',
                              'tag3'   : 'tagItem_2',
                              'tag4'   : 'tagItem_3'
                            },
        'note'            : {
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
