var preferences = {},
    xhrupload = new XMLHttpRequest(),
	  uploadserver = 'http://preferences.gpii.net/user/',
	  localPreferences = {},
	  preferencesFormatObject = { 'http://registry.gpii.org/applications/org.chrome.cloud4chrome' : [] };

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#screenReaderCheckBoxOP').addEventListener('click', screenReaderCheckBoxOPClicked); 
  document.querySelector('#noHighContrastRBOP').addEventListener('click', noHighContrastRBOPClicked); 
  document.querySelector('#highContrastBlackWhite').addEventListener('click', highContrastBlackWhiteClicked);
  document.querySelector('#highContrastWhiteBlack').addEventListener('click', highContrastWhiteBlackClicked);
  document.querySelector('#highContrastYellowBlack').addEventListener('click', highContrastYellowBlackClicked);
  document.querySelector('#highContrastBlackYellow').addEventListener('click', highContrastBlackYellowClicked);

  document.querySelector('#invertColorsCheckbox').addEventListener('click', invertColorsCheckboxClicked);

  document.querySelector('#zoom100OP').addEventListener('click', zoom100OPClicked);
  document.querySelector('#zoom200OP').addEventListener('click', zoom200OPClicked);
  document.querySelector('#zoom300OP').addEventListener('click', zoom300OPClicked);
  document.querySelector('#textSizeNormalOP').addEventListener('click', textSizeNormalOPClicked);
  document.querySelector('#textSizeLargeOP').addEventListener('click', textSizeLargeOPClicked); 
  document.querySelector('#textSizeXLargeOP').addEventListener('click', textSizeXLargeOPClicked);
  document.querySelector('#simplifierCheckBoxOP').addEventListener('click', simplifierCheckBoxOPClicked);
  
  document.querySelector('#preferencesFormOP').addEventListener('submit', formPreferenceSubmit);

  document.querySelector('#optionsPageTitle').innerText = chrome.i18n.getMessage("optionsPageTitleText");
  document.querySelector('#optionsPageSubtitle').innerText = chrome.i18n.getMessage("optionsPageSubtitleText");
  document.querySelector('#formTokenWarning').innerText = chrome.i18n.getMessage("formTokenWarningText");
  document.querySelector('#tokenTitle').innerText = chrome.i18n.getMessage("tokenTitleText");
  document.querySelector('#newTokenInputOP').setAttribute('placeholder', chrome.i18n.getMessage("tokenInputPlaceholder"));
  document.querySelector('#screenReaderTitle').innerText = chrome.i18n.getMessage("screenReaderTitleText");
  document.querySelector('#screenReaderLabel').innerText = chrome.i18n.getMessage("screenReaderLabelText");
  document.querySelector('#chromeVoxNotInstalledWarning').innerText = chrome.i18n.getMessage("chromeVoxNotInstalledWarningText");
  document.querySelector('#installCVButton').innerText = chrome.i18n.getMessage("installCVButtonText");
  document.querySelector('#highContrastRgTitle').innerText = chrome.i18n.getMessage("highContrastRgTitleText");
  document.querySelector('#noHighContrastLabel').innerText = chrome.i18n.getMessage("NoHighContrastRB2Text");
  document.querySelector('#highContrastBlackWhiteLabel').innerText = chrome.i18n.getMessage("highContrastBlackWhiteLabelText");
  document.querySelector('#highContrastWhiteBlackLabel').innerText = chrome.i18n.getMessage("highContrastWhiteBlackLabelText");
  document.querySelector('#highContrastYellowBlackLabel').innerText = chrome.i18n.getMessage("highContrastYellowBlackLabelText");
  document.querySelector('#highContrastBlackYellowLabel').innerText = chrome.i18n.getMessage("highContrastBlackYellowLabelText");
  document.querySelector('#invertColoursTitle').innerText = chrome.i18n.getMessage("invertColoursTitleText");
  document.querySelector('#invertLabel').innerText = chrome.i18n.getMessage("invertLabelText");
  document.querySelector('#zoomrg').innerText = chrome.i18n.getMessage("zoomRgTitleText");
  document.querySelector('#fontsizerg').innerText = chrome.i18n.getMessage("fontSizeRGTitleText");
  document.querySelector('#textSizeMediumLabel').innerText = chrome.i18n.getMessage("textSizeMediumLabelText");
  document.querySelector('#textSizeLargeLabel').innerText = chrome.i18n.getMessage("textSizeLargeLabelText");
  document.querySelector('#textSizeXLargeLabel').innerText = chrome.i18n.getMessage("textSizeXLargeLabelText");
  document.querySelector('#simplifierTitle').innerText = chrome.i18n.getMessage("simplifierTitleText");
  document.querySelector('#simplifierCheckBoxLabel').innerText = chrome.i18n.getMessage("simplifierCheckBoxLabelText");
  document.querySelector('#savePrefsBtn').setAttribute('value', chrome.i18n.getMessage("saveButtonText"));
  document.querySelector('#clearBtn').innerText = chrome.i18n.getMessage("clearBtnText");
  document.querySelector('#clearBtn').setAttribute('title', chrome.i18n.getMessage("clearBtnTitleText"));

  chrome.storage.local.get({'token' : "" , 'preferences': {} }, function(results) {
    setPreferencesFormOP({token: results['token'], preferences: results['preferences']});
  });
  
  xhrupload.upload.addEventListener('load', transferComplete, false);
  xhrupload.upload.addEventListener('error', transferFailed, false);
  xhrupload.upload.addEventListener('abort', transferCanceled, false); 
}); 

function setPreferencesFormOP(npsetObject) {

  if (npsetObject.hasOwnProperty('token') && npsetObject.hasOwnProperty('preferences')) {
    // The needs and preferences object has a property 'token' and a property 'preferences'
  
	  if (isEmpty(npsetObject['preferences']) && npsetObject['token'] == "") {
	    // The preferences object is empty and the token is an empty string
	    initializeForm();
	
	  } else {
	    // Either the token is a valid string or there are actual preferences 
	    console.log('set of needs and preferences stored locally at setPreferencesFormOP');
	    
	    if (npsetObject['token'] != "") {
	      document.querySelector('#newTokenInputOP').value = npsetObject['token'];
	    }
	  
	    if (isEmpty(npsetObject['preferences'])) {
	      // The preferences object is empty
	      initializeForm()
		
	    } else {
	      // The preferences object is not empty
	      localPreferences = npsetObject['preferences'];
		
		    // Initialize screenreader
		    if (localPreferences.hasOwnProperty('screenReaderTTSEnabled')) {
	        chrome.management.get('kgejglhpjiefppelpmljglcjbhoiplfn', function(extInfo) {
		        try {
		          console.log(extInfo.name + " is installed.");
			
			        if (localPreferences['screenReaderTTSEnabled']) {
			          document.querySelector('#screenReaderCheckBoxOP').checked = true;
			          console.log("Screen reader checkbox initialized to true in background");
			  
			          if (!extInfo.enabled) {
			            chrome.management.setEnabled(extInfo.id, true, function() {
				            console.log("ChromeVox has been enabled in initialization");
				          }); 
			          }
		          } else {
			          document.querySelector('#screenReaderCheckBoxOP').checked = false;
			          console.log("Screen reader checkbox initializated to false in background");
			  
			          if (extInfo.enabled) {
			            chrome.management.setEnabled(extInfo.id, false, function() {
			              console.log("ChromeVox has been disabled in initialization");
			            }); 
			          }
		          }
		        } catch (e) {
		          console.log('Error in screen reader management: ' + e.message);
			        document.querySelector('#screenReaderDivCVInstalled').style.display = 'none';
			        document.querySelector('#screenReaderDivCVNotInstalled').style.display = 'block';
		        }
		      });
	      } // if screenreader
	     
		    // Initialize high contrast
		    if (localPreferences.hasOwnProperty('highContrastEnabled')) {
		    	if (localPreferences['highContrastEnabled']) {
		    		if (localPreferences.hasOwnProperty('highContrastTheme')) {
		    			switch (localPreferences['highContrastTheme']) {
		    				case 'bw':
		    					document.querySelector['#highContrastBlackWhite'].checked = true;
		    					document.documentElement.setAttribute('hc', 'bw');
		    					break;
		    				case 'wb':
		    					document.querySelector['#highContrastWhiteBlack'].checked = true;
		    					document.documentElement.setAttribute('hc', 'wb');
		    					break;
		    				case 'yb':
		    					document.querySelector['#highContrastYellowBlack'].checked = true;
		    					document.documentElement.setAttribute('hc', 'yb');
		    					break;
		    				case 'by':
		    					document.querySelector['#highContrastBlackYellow'].checked = true;
		    					document.documentElement.setAttribute('hc', 'by');
		    					break;
		    			}
		    		}
		    	// localPreferences hasOwnProperty highContrastEnabled
		    	} else { 
		    		document.querySelector('#noHighContrastRBOP').checked = true;
		    		document.documentElement.removeAttribute('hc');
		    	}
		    }

		    if (localPreferences.hasOwnProperty('invertColours')) {
		    	if (localPreferences['invertColours']) {
		    		document.querySelector('#invertColorsCheckbox').checked = true;
		    		document.documentElement.setAttribute('ic', 'invert');
		    	} else {
		    		document.querySelector('#invertColorsCheckbox').checked = false;
		    		document.documentElement.removeAttribute('ic');
		    	}
		    }

		    if (localPreferences.hasOwnProperty('magnifierEnabled')) {
		    	if (localPreferences['magnifierEnabled']) {
		    		if (localPreferences.hasOwnProperty('magnification')) {
		    			switch (localPreferences['magnification']) {
		    				case 1: 
			        		// Magnification 100%
		          				document.querySelector('#zoom100OP').checked = true;
			        			document.documentElement.removeAttribute('zoom');
			        			console.log("Zoom initilialized to 100% in background");
		          				break;
		        			case 2: 
			        		// Magnification 200%
		          				document.querySelector('#zoom200OP').checked = true;
			        			document.documentElement.setAttribute('zoom', '200%');
			        			console.log("Zoom initilialized to 200% in background");
		          				break;
		        			case 3: 
			        		// Magnification 300%
		          				document.querySelector('#zoom300OP').checked = true;
			        			document.documentElement.setAttribute('zoom', '300%');
			        			console.log("Zoom initilialized to 300% in background");
		          				break;
		        			default:
			        		// No correct value of magnification selected
		          			document.querySelector('#zoom100OP').defaultChecked;
			        		console.log("Not valid value for magnification");
		    			}
		    		// Magnifier is enabled but there is no a magnification value
		    		} else {
		    			document.querySelector('#zoom100OP').checked = true;
			        	document.documentElement.removeAttribute('zoom');		
		    		}
		    	// Magnifier is not enabled
		    	} else {
					document.querySelector('#zoom100OP').checked = true;
			        document.documentElement.removeAttribute('zoom');
		    	}
		    }
		
	      if (localPreferences.hasOwnProperty('fontSize')) {
		      // There is a property font Size
	        console.log(localPreferences['fontSize']);
	        switch (localPreferences['fontSize']) {
		        case 'medium': 
		          document.querySelector('#textSizeNormalOP').checked = true;
			        document.documentElement.removeAttribute('ts');
			        console.log("Text size initialized to normal in background");
		          break;
		        case 'large': 
		          document.querySelector('#textSizeLargeOP').checked = true; 
			        document.documentElement.setAttribute('ts', 'large');
			        console.log("Text size initialized to large in background"); 
		          break;
		        case 'x-large': 
		          document.querySelector('#textSizeXLargeOP').checked = true;
			        document.documentElement.setAttribute('ts', 'x-large');
			        console.log("Text size initializated to x-large in background");
		          break;
		        default:
		          console.log('text size value is not properly defined');
	        } 
	      } // fontSize
		
		    // Initialize simplifier
		    if (localPreferences.hasOwnProperty('simplifier')) {
	        if (localPreferences['simplifier']) {
		        document.querySelector('#simplifierCheckBoxOP').checked = true;
		          console.log("Simplification set to true in background");
		      } else {
		        document.querySelector('#simplifierCheckBoxOP').checked = false;
		        console.log("Simplification set to false in background");
		      }
	      } // end if simplifier
		
	    } // The preferences object is empty ifelse
	  } // The preferences object is empty and the token is an empty string
  } else {
    // The preferences object lacks the token property or the preferences property
    console.log('The JSON object is not well built');
  }  
}	
	
function onOptionsClick() {
  chrome.tabs.create({ url: 'options.html' }); 
	window.close();
}


function transferComplete(e) {
  console.log("the transfer is complete");
  document.querySelector('.formWarning').style.display = 'block';
  document.querySelector('.formWarning').innerText = "Your preferences have been successfully updated";
  document.querySelector('.formWarning').style.color = "green";
}

function transferFailed(e) {
  console.log("An error occurred while transferring the file " + e.message); 
}

function transferCanceled(evt) {
  console.log("The transfer has been cancelled by the user"); 
}

function screenReaderCheckBoxOPClicked() {
  console.log('screen reader clicked');
  if (document.querySelector('#screenReaderCheckBoxOP').checked) {
    chrome.tts.speak("ChromeVox has been activated");
    preferences['screenReaderTTSEnabled'] = true;
  } else {
    preferences['screenReaderTTSEnabled'] = false;
  }
}

function noHighContrastRBOPClicked() {
  document.documentElement.removeAttribute('hc'); 
  preferences['highContrastEnabled'] = false;
}

function highContrastBlackWhiteClicked() {
	console.log("Black on white");
	preferences['highContrastEnabled'] = true;
	preferences['highContrastTheme'] = 'black-white';
	document.documentElement.setAttribute('hc', 'bw');
}

function highContrastWhiteBlackClicked() {
	console.log("White on Black");
	preferences['highContrastEnabled'] = true;
	preferences['highContrastTheme'] = 'white-black';
	document.documentElement.setAttribute('hc', 'wb');
}

function highContrastYellowBlackClicked() {
	console.log("Yellow on Black");
	preferences['highContrastEnabled'] = true;
	preferences['highContrastTheme'] = 'yellow-black';
	document.documentElement.setAttribute('hc', 'yb');
}

function highContrastBlackYellowClicked() {
	console.log("Black on Yellow");
	preferences['highContrastEnabled'] = true;
	preferences['highContrastTheme'] = 'black-yellow';
	document.documentElement.setAttribute('hc', 'by');

}

function invertColorsCheckboxClicked() {
	if (document.querySelector('#invertColorsCheckbox').checked) {
		document.documentElement.setAttribute('ic', 'invert');
		preferences['invertColours'] = true; 		
	} else {
		document.documentElement.removeAttribute('ic');
		preferences['invertColours'] = false;
	}
}

function zoom100OPClicked() {
  document.documentElement.removeAttribute('zoom'); 
  preferences['magnification'] = 1;
  preferences['magnifierEnabled'] = false;
}

function zoom200OPClicked() {
  document.documentElement.setAttribute('zoom', '200%');
  preferences['magnifierEnabled'] = true;
  preferences['magnification'] = 2;
}

function zoom300OPClicked() {
  document.documentElement.setAttribute('zoom', '300%'); 
  preferences['magnifierEnabled'] = true;
  preferences['magnification'] = 3;
}

function textSizeNormalOPClicked() {
  document.documentElement.removeAttribute('ts'); 
  preferences['fontSize'] = 'medium';
}

function textSizeLargeOPClicked() {
  document.documentElement.setAttribute('ts', 'large'); 
  preferences['fontSize'] = 'large';
}

function textSizeXLargeOPClicked() {
  document.documentElement.setAttribute('ts', 'x-large'); 
  preferences['fontSize'] = 'x-large';
}

function simplifierCheckBoxOPClicked() {
   console.log('Simplifier clicked');
   if (this.checked == true) {
     preferences['simplifier'] = true;
   } else {
     preferences['simplifier'] = false;
   }
}

// In case there ar no preferences stored, initialize form and all preferences
function initializeForm() {
	console.log("Preferences object is empty");
	preferences['screenReaderTTSEnabled'] = false;
	document.querySelector('#noHighContrastRBOP').checked = true;
	preferences['highContrastEnabled'] = false;
	preferences['invertColours'] = false;
	document.querySelector('#zoom100OP').checked = true;
	preferences['magnifierEnabled'] = false;
	preferences['magnification'] = 1;
	document.querySelector('#textSizeNormalOP').checked = true;
	preferences['fontSize'] = 'medium';
	preferences['simplifier'] = false;
}

function formPreferenceSubmit(e) {
  e.preventDefault(); 
  console.log('submitting form'); 
  if (document.querySelector('#newTokenInputOP').value == "") {
    document.querySelector('.formWarning').style.display = 'block';
	document.querySelector('#tokenTitle').style.color = 'red';
  } else {
    if (isEmpty(preferences)) {
	  document.querySelector('.formWarning').innerText = "Please select some options";
	  document.querySelector('.formWarning').style.display = 'block';
	} else {
	  var npObject = {
	    token: document.querySelector('#newTokenInputOP').value,
		preferences: preferences
	  }
	  
	  chrome.storage.local.set(npObject); 
	  
	  preferencesFormatObject['http://registry.gpii.org/applications/org.chrome.cloud4chrome'][0] = { value : preferences };
	  
  	  var npJSON = JSON.stringify(preferencesFormatObject);
	  
	  console.log(npJSON); 
	  
	  
	  // SAVING LOCALLY DOES NOT WORK
	  xhrupload.open(
	    "POST",
		uploadserver + npObject['token'], 
		true
	  ); 
	  xhrupload.setRequestHeader('Content-Type', 'application/json;charset=utf-8'); 
	  xhrupload.send(npJSON); 
	}
  }
  
}


