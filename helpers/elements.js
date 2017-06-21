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

	// ******* WALKBOOKS ******* //

	exports.surveys = {
		'survey1'	: 'cellSurvey_0',
		'survey2'	: 'cellSurvey_1',
		'survey3'	: 'cellSurvey_2',
		'survey4'	: 'cellSurvey_3',
		'survey5'	: 'cellSurvey_4',
		'survey6'	: 'cellSurvey_5',
		'survey7'	: 'cellSurvey_6',
		'survey8'	: 'cellSurvey_7',
		'survey9'	: 'cellSurvey_8',
		'survey10'	: 'cellSurvey_9',
		'survey11'	: 'cellSurvey_10',
		'survey12'	: 'cellSurvey_11',
		'survey13'	: 'cellSurvey_12',
		'survey14'	: 'cellSurvey_13',
		'survey15'	: 'cellSurvey_14',
		'survey16'	: 'cellSurvey_15',
		'survey17'	: 'cellSurvey_16',
		'survey18'	: 'cellSurvey_17',
		'survey19'	: 'cellSurvey_18',
		'survey20'	: 'cellSurvey_19'
	}


	// by ID
	exports.survey = {
		'previewQuestions' 	 :  'tvSurveyPreview',
		'start' 			 :  'btnStartSurvey',
		'gpsLocateMe' 		 :  'locate icon', // in Android it's content-desc "My Location"
		'map' 				 :  'walkbook_map', //in iOS effectively, label "dismiss popup"
		'mapSettings'		 :  'i ipad', // in Android this is in the mnOverflow - text = "Icon Legend"
		'list' 				 :  'walkbook_list', // in iOS effectively, label 'menuButton', if on map view

		//use getFirstListItemByIdPart
		// alternative way - with XPath: '//*[contains(@label,\'cellWalkbook_1\')]',
		'walkbook1'     	 :  'cellWalkbook_0',
		'walkbook2'     	 :  'cellWalkbook_1',
		'walkbook3'     	 :  'cellWalkbook_2',
		'walkbook4'     	 :  'cellWalkbook_3',
		'walkbook5'     	 :  'cellWalkbook_4',
		'walkbook6'     	 :  'cellWalkbook_5',
		'walkbook7'     	 :  'cellWalkbook_6',
		'walkbook8'     	 :  'cellWalkbook_7',
		'popoverOpenBook'	 :  'More Info'
	}


	//Use getFirstListItemByIdPart
	exports.walkbook = {
		// 'houseHold1'       : "//*[contains(@label,'cellHouse_0')]",
		'houseHold1'       : 'cellHouse_0',
		'houseHold2'       : 'cellHouse_1',
		'houseHold3'       : 'cellHouse_2',
		'houseHold4'       : 'cellHouse_3',
		'houseHold5'       : 'cellHouse_4',
		'houseHold6'       : 'cellHouse_5',
		'houseHold7'       : 'cellHouse_6',
		'houseHold8'       : 'cellHouse_7',
		'houseHold9'       : 'cellHouse_8',
		'houseHold10'      : 'cellHouse_9',
		'houseHold11'      : 'cellHouse_10',
		'houseHold12'      : 'cellHouse_11',
		'houseHold13'      : 'cellHouse_12',
		'houseHold14'      : 'cellHouse_13',
		'houseHold15'      : 'cellHouse_14',
		'houseHold16'      : 'cellHouse_15',
		'houseHold17'      : 'cellHouse_16',
		'houseHold18'      : 'cellHouse_17',
		'houseHold19'      : 'cellHouse_18',
		'houseHold20'      : 'cellHouse_19',
		'list'             : 'house_list',
		'popoverOpenHouse' : 'More Info', // only iOS
		'close'			   : 'Close',
		'leaveOpen'		   : 'Leave Open'
		// house examples
		// cellHouse_0_sfh_notstarted
		// cellHouse_0_sfh_attempted
		// cellHouse_0_sfh_partial
		// cellHouse_0_sfh_reject
		// cellHouse_0_sfh_complete
	}

	exports.houseHold = {
		'primTarget1'  : 'prim_cellContact_0',
		'primTarget2'  : 'prim_cellContact_1',
		'primTarget3'  : 'prim_cellContact_2',
		'primTarget4'  : 'prim_cellContact_3',
		'primTarget5'  : 'prim_cellContact_4',
		'primTarget6'  : 'prim_cellContact_5',
		'secTarget1'   : 'sec_cellContact_0',
		'secTarget2'   : 'sec_cellContact_1',
		'secTarget3'   : 'sec_cellContact_2',
		'secTarget4'   : 'sec_cellContact_3',
		'secTarget5'   : 'sec_cellContact_4',
		'secTarget6'   : 'sec_cellContact_5',
		'primPlus1'    : 'prim_cellContactPlus_0',
		'primPlus2'    : 'prim_cellContactPlus_1',
		'primPlus3'    : 'prim_cellContactPlus_2',
		'primPlus4'    : 'prim_cellContactPlus_3',
		'primPlus5'    : 'prim_cellContactPlus_4',
		'primPlus6'    : 'prim_cellContactPlus_5',
		'secPlus1'     : 'sec_cellContactPlus_0',
		'secPlus2'     : 'sec_cellContactPlus_1',
		'secPlus3'     : 'sec_cellContactPlus_2',
		'secPlus4'     : 'sec_cellContactPlus_3',
		'secPlus5'     : 'sec_cellContactPlus_4',
		'secPlus6'     : 'sec_cellContactPlus_5',
		'primInfo1'    : 'prim_cellContactInfo_0',
		'primInfo2'    : 'prim_cellContactInfo_1',
		'primInfo3'    : 'prim_cellContactInfo_2',
		'primInfo4'    : 'prim_cellContactInfo_3',
		'primInfo5'    : 'prim_cellContactInfo_4',
		'primInfo6'    : 'prim_cellContactInfo_5',
		'secInfo1'     : 'sec_cellContactInfo_0',
		'secInfo2'     : 'sec_cellContactInfo_1',
		'secInfo3'     : 'sec_cellContactInfo_2',
		'secInfo4'     : 'sec_cellContactInfo_3',
		'secInfo5'     : 'sec_cellContactInfo_4',
		'secInfo6'     : 'sec_cellContactInfo_5',
		'notHome' 	   : 'btnDisposition_Not Home',
		'refused' 	   : 'btnDisposition_Refused',
		'wrongAddress' : 'btnDisposition_Wrong Address',
		'restricted'   : 'btnDisposition_Restricted Access',
		'addContact'   : 'btnAddContact',
		'finished'     : 'btnDispoFinishHousehold'
	}

	exports.target = {
		'takeSurvey'     : 'btnTakeSurvey',    // Formerly: 'Take Survey',
		'notHome' 		 : 'btnNotHome', 	   // Formerly: 'Not Home',
		'refused' 		 : 'btnRefuse', 	   // Formerly: 'Refused',
		'wrongAddress'   : 'btnWrongAddress',  // Formerly: 'Wrong Address',
		'addNote' 		 : 'btnNote', 		   // Formerly: 'Add Note',
		'tag' 		     : 'btnTag', 		   // Formerly: 'Tag',
		'edit' 		     : 'btnEdit', 		   // Formerly: 'Edit',
		'requestBallot'  : 'btnAbsentee', 	   // Formerly: 'Request Absentee Ballot'
	}

	exports.takeSurvey = {
		'answer1'                  : 'btnAnswer_0',  		                   //Formerly : 'btnAnswer_0',
		'answer2'                  : 'btnAnswer_1',  		                   //Formerly : 'btnAnswer_1',
		'answer3'                  : 'btnAnswer_2',  		                   //Formerly : 'btnAnswer_2',
		'answer4'                  : 'btnAnswer_3',  		                   //Formerly : 'btnAnswer_3',
		'answer5'                  : 'btnAnswer_4',  		                   //Formerly : 'btnAnswer_4',
		'answer6'                  : 'btnAnswer_5',  		                   //Formerly : 'btnAnswer_5',
		'answer7'                  : 'btnAnswer_6',  		                   //Formerly : 'btnAnswer_6',
		'answer8'                  : 'btnAnswer_7',  		                   //Formerly : 'btnAnswer_7',
		'skip'                     : 'btnSkipQuestion',  			           //Formerly : 'Skip',
		'prev'                     : 'btnSurveyPrevious', 			           //Formerly : 'Prev', // previous question
		'submitAnswer'             : 'btnSkipQuestion',			               //Formerly : 'Submit Answer',
		'remainingTarget'          : '//*[(contains(id()\'btnRemaining\')]',
		'remainingPrimaryTarget'   : 'prim_btnRemaining_1',			           //Formerly : '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAButton[2]',
		'remainingSecondaryTarget' : 'sec_btnRemaining_3',			           //Formerly : '//UIAApplication[1]/UIAWindow[1]/UIAScrollView[1]/UIAButton[2]',
		'finish'	               : 'btnEpilogueFinished' 			           //Formerly : 'Finish with Household'
		}

	// ******* Voter Lookup ******* //

		exports.voterLookup = {
			'close'       : 'Close',
			'clear_all'   : 'Clear All',
			'state'       : 'voterLookupSearch_StateSpinner',
			'first_name'  : 'First Name',
			'last_name'   : 'Last Name',
			'city'        : 'City',
			'zip_code'    : 'Zip Code',
			'address_1'   : 'Address 1',
			'address_2'   : 'Address 2',
			'phone'       : 'Phone',
			'email'       : 'Email',
			'dbtoggle'    : 'cbDatabase',
			'search'      : 'voterLookupSearch_btnSearch',
			'add_contact' : {
								'add_contact' : 'Add Contact',
								'first_name' : 'Add Contact',
								'' : 'Add Contact',
								'' : 'Add Contact',
								'' : 'Add Contact',
							}


		}

		exports.voterLookupResults = {
			'table'  : 'voterLookupSearchResults_results',
			'voter1' : 'cellVoter_0',
			'voter2' : 'cellVoter_1',
			'voter3' : 'cellVoter_2',
			'voter4' : 'cellVoter_3',
			'voter5' : 'cellVoter_4',
			'voter6' : 'cellVoter_5',
			'voter7' : 'cellVoter_6',
			'voter8' : 'cellVoter_7'
		}

		exports.voterDetail = {
			'addTag'    : {
								'addTag'    : 'btnAddTag',
								'category1' : 'cellTagCategory_0',
								'category2' : 'cellTagCategory_1',
								'category3' : 'cellTagCategory_2',
								'category4' : 'cellTagCategory_3',
								'category5' : 'cellTagCategory_4',
								'category6' : 'cellTagCategory_5',
								'category7' : 'cellTagCategory_6',
								'category8' : 'cellTagCategory_7',
								'tag1'      : 'cellTag_0',
								'tag2'      : 'cellTag_1',
								'tag3'      : 'cellTag_2',
								'tag4'      : 'cellTag_3',
								'tag5'      : 'cellTag_4',
								'tag6'      : 'cellTag_5',
								'done'      : 'Done'
							},
			'addVolunteer' : 'voterAddVolunteer',
			'takeSurvey'   : 'voterLookupDetail_btnTakeSurvey',
	}

		exports.addContact = {

		}

