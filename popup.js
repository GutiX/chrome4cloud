// popup.js holds all the handlers for the interactive elements of popup.html.
// handlers store the value in sync storage and change aria values

// Set all handlers

"use strict";

var userToken = "",
    localPreferences = {};

var notification_OnScreenReaderActivated = {
	type: "basic",
	title: chrome.i18n.getMessage("onScreenKeyboardNotificationTitle"),
	message: chrome.i18n.getMessage("onScreenKeyboardNotificationMessage"),
	iconUrl: 'images/icon48.png'
}

$(document).ready(function(e) {

  $('#token-form').submit(onTokenFormSubmit);
  
  $('#options-link').click(onOptionsClick);
  $("#c4a-website-link").click(onC4aWebsiteLinkClick);
  
  $('#screenreader-checkbox').click(screenReaderCBClicked);
  $('#install-CV-btn').click(installCVClicked);
  $('input[name="high-contrast"]').change(highContrastChanged);
  $('#invert-colours-checkbox').click(invertRBClicked);
  $('#zoom-enable-checkbox').click(zoomEnableCheckboxClicked);
  $('#zoom-level').change(onZoomChanged);
  $('input[name="font-size"]').change(fontSizeChanged);
  $('#font-face-select').change(fontFaceChanged);
  $('input[name="cursor-size"]').click(cursorSizeChanged);
  $('#onscreenkeyboard-checkbox').click(onScreenKeyboardCheckBoxClicked);
  $('#install-onscreenkeyboard-button').click(onInstallOnScreenKeyboardButtonClicked);
  $('#simplifier-checkBox').click(simplifierCheckBoxClicked);
  $('#synonyms-en-checkbox').click(synonymsEnCheckboxClicked);
  $('#sinonimos-es-checkbox').click(sinonimosEsCheckboxClicked);

  $('#see-all-prefs').click(onOptionsClick);

  $('.sign-out-btn').click(signOutBtnClicked);
  $('.sign-out-btn').text(chrome.i18n.getMessage("signOutBtnText"));
  $('.sign-out-btn').attr('title', chrome.i18n.getMessage("signOutBtnTitle"));
  
  // Initialize all text to make the extension localizable
  $("#welcome-message").text(chrome.i18n.getMessage("welcomeMessage"));
  $('#token-input').attr('placeholder', chrome.i18n.getMessage("tokenInputPlaceholder"));
  $('#token-input-label').text(chrome.i18n.getMessage("tokenInputLabelText"));
  $('#options-link').text(chrome.i18n.getMessage("optionsLinkText"));
  $('#c4a-website-link').attr('title', chrome.i18n.getMessage('c4aWebsiteLinkTitle'));
  $('#c4a-website-link').text(chrome.i18n.getMessage('c4aWebsiteLinkText'));
  $('#config-title').text(chrome.i18n.getMessage("configTitleText"));
  $('#config-description').text(chrome.i18n.getMessage("configDescriptionText"));
  $('#see-all-prefs').text(chrome.i18n.getMessage("seeAllPrefsText"));
  $('#see-all-prefs').attr('title', chrome.i18n.getMessage("seeAllPrefsTitle"));
  $('#screenreader-title').text(chrome.i18n.getMessage("screenReaderTitleText"));
  $('#screenreader-checkbox-label').text(chrome.i18n.getMessage("screenReaderLabelText"));
  $('#CV-not-installed-warning').text(chrome.i18n.getMessage("chromeVoxNotInstalledWarningText"));
  $('#install-CV-btn').text(chrome.i18n.getMessage("installCVButtonText"));
  $('#high-contrast-title').text(chrome.i18n.getMessage("highContrastRgTitleText"));
  $('#no-high-contrast-label').text(chrome.i18n.getMessage("NoHighContrastRB2Text"));
  $('#high-contrast-black-white-label').text(chrome.i18n.getMessage("highContrastBlackWhiteLabelText"));
  $('#high-contrast-white-black-label').text(chrome.i18n.getMessage("highContrastWhiteBlackLabelText"));
  $('#high-contrast-yellow-black-label').text(chrome.i18n.getMessage("highContrastYellowBlackLabelText"));
  $('#high-contrast-black-yellow-label').text(chrome.i18n.getMessage("highContrastBlackYellowLabelText"));
  $('#invert-colours-title').text(chrome.i18n.getMessage("invertColoursTitleText"));
  $('#invert-colours-checkbox-label').text(chrome.i18n.getMessage("invertLabelText"));
  $('#zoom-title').text(chrome.i18n.getMessage("zoomRgTitleText"));
  $('#zoom-enable-checkbox-label').text(chrome.i18n.getMessage('zoomEnableChechboxLabelText'));
  $('#zoom-level-label').text(chrome.i18n.getMessage("zoomLevelLabelText"));
  $('#font-options-title').text(chrome.i18n.getMessage("fontOptionsTitleText"));
  $('#font-size-title').text(chrome.i18n.getMessage("fontSizeTitleText"));
  $('#font-face-title').text(chrome.i18n.getMessage("fontFaceTitleText"));
  $('#font-face-original').text(chrome.i18n.getMessage("fontFaceOriginalText"));
  $('#font-size-normal-label').text(chrome.i18n.getMessage("fontSizeNormalLabelText"));
  $('#font-size-large-label').text(chrome.i18n.getMessage("fontSizeLargeLabelText"));
  $('#font-size-x-large-label').text(chrome.i18n.getMessage("fontSizeXLargeLabelText"));
  $('#cursor-size-title').text(chrome.i18n.getMessage("cursorSizeTitleText"));
  $('#cursor-size-normal-label').text(chrome.i18n.getMessage("cursorSizeNormalLabelText"));
  $('#cursor-size-large-label').text(chrome.i18n.getMessage("cursorSizeLargeLabelText"));
  $('#cursor-size-x-large-label').text(chrome.i18n.getMessage("cursorSizeXLargeLabelText"));
  $('#onscreenkeyboard-title').text(chrome.i18n.getMessage("onScreenKeyboardTitleText"));
  $('#onscreenkeyboard-label').text(chrome.i18n.getMessage("onScreenKeyboardLabelText"));
  $('#onscreenKeyboard-not-installed-warning').text(chrome.i18n.getMessage("onScreenKeyboardNotInstalledWarningText"));
  $('#install-onscreenkeyboard-button').text(chrome.i18n.getMessage("installOnScreenKeyboardButtonText"));
  $('#simplifier-title').text(chrome.i18n.getMessage("simplifierTitleText"));
  $('#simplifier-checkbox-label').text(chrome.i18n.getMessage("simplifierCheckBoxLabelText"));  
  $('#synomyms-en-title').text(chrome.i18n.getMessage("synonymsEnTitleText"));
  $('#synonyms-en-explanation').text(chrome.i18n.getMessage("synonymsEnExplanationText"));
  $('#synonyms-en-checkbox-label').text(chrome.i18n.getMessage("synonymsEnCheckboxLabelText"));
  
  // if there is a configuration stored locally, we will load this 
  // set of needs and preferences
  chrome.storage.local.get({'token' : "" , 'preferences': {} }, function(results) {
    setPreferencesForm({token: results['token'], preferences: results['preferences']});
  }); 

});

chrome.runtime.onMessage.addListener(
	function(req, sen, sendResponse) {
		if (req.action == "preferences downloaded") {
			if (req.status == "success") {
				window.location.reload();
			} else {
				$('#results').html("<span class='warning'>" + req.message + "</span>").show();
			}
		}
		/*else if(req.action == "signout")
		{
			signOutBtnClicked;
		}*/
	}
);

// Function to handle the token submission. It finally sends a message to
// the background page
function onTokenFormSubmit(e) {
  e.preventDefault();
  
  var token = $('#token-input').val();
  $('#token-input').val("");
  $('#results').html('<img src="/images/loading_icon_2_rev01.gif"> Loading').show();
  chrome.runtime.sendMessage({action: 'token submitted', token: token}, handleResponse);
}

// Actions to respond to the receipt of a set of needs and preferences 
// from the web
function handleResponse(response) {

  var status = response.status,
      isError = response.isError,
      errorMessage = response.errorMessage;

  if (status == 1) {
  	console.log("succesfully logged in");
  	chrome.storage.local.get({'token': "", 'preferences': {}}, function(results) {
  		window.location.reload();
  	});
  } else {
  	$('#results').html('<span class="warning">' + errorMessage + '</span>').show();
  }

}

// Function that initializes the popup
function setPreferencesForm(npsetObject) {

  if (npsetObject.hasOwnProperty('token') && npsetObject.hasOwnProperty('preferences')) {
    // The needs and preferences object has a property 'token' and a property 'preferences'
  
	  if (isEmpty(npsetObject['preferences']) && npsetObject['token'] == "") {
	    // The preferences object is empty and the token is an empty string
	  
	    console.log('set of needs and preferences not stored locally');
	    $('#preferences-container').hide();
  	  	$('#token-form-container').show();
	    $('#token-input').focus(); 
	    // chrome.tts.speak("Welcome to Cloud For All. Press TAB for options.");

	  } else {
	    // Either the token is a valid string or there are actual preferences 
	    console.log('set of needs and preferences stored locally');
	    $('#token-form-container').hide();
	    $('#preferences-container').show();
	    
	    if (npsetObject['token'] != "") {
	    	// The token is a valid string
		   	userToken = npsetObject['token'];
	      	$('#config-title').text(chrome.i18n.getMessage("configTitleTextWithToken") + npsetObject['token']);
		    // chrome.tts.speak( "Welcome to Cloud For All, " + npsetObject['token'] );
	    }
	  
	    if (isEmpty(npsetObject['preferences'])) {
	      // The preferences object is empty
	      console.log("Preferences object is empty");
		
	    } else {
	      // The preferences object is not empty
	      	localPreferences = npsetObject['preferences'];
		
		    // Initialize screenreader
	        chrome.management.get('kgejglhpjiefppelpmljglcjbhoiplfn', function(extInfo) {
	        	if (chrome.runtime.lastError) {
					console.log('Error in screen reader management: ' + chrome.runtime.lastError.message);
			  		$('#CV-installed').hide();
			  		$('#CV-not-installed').show();
	        	} else {
		        	console.log(extInfo.name + " is installed.");

					if (localPreferences.hasOwnProperty('screenReaderTTSEnabled')) {
					  if (localPreferences.screenReaderTTSEnabled) {
				        $('#screenreader-checkbox').prop('checked', true);
			          } else {
				        $('#screenreader-checkbox').prop('checked', false);
			          } 	
					}	
	        	}
		    });

	     
		    // Initialize high contrast
		    if (localPreferences.hasOwnProperty('highContrastEnabled')) {
		    	if (localPreferences.highContrastEnabled) {
		    		console.log("High Contrast is enabled");
		    		if (localPreferences.hasOwnProperty('highContrastTheme')) {
		    			switch (localPreferences.highContrastTheme) {
		    				case 'black-white':
		    					$('#high-contrast-black-white').prop('checked', true);
		    					$('html').attr('hc', 'bw');
		    					break;
		    				case 'white-black':
		    					$('#high-contrast-white-black').prop('checked', true);
		    					$('html').attr('hc', 'wb');
		    					break;
		    				case 'yellow-black':
		    					$('#high-contrast-yellow-black').prop('checked', true);
		    					$('html').attr('hc', 'yb');
		    					break;
		    				case 'black-yellow':
		    					$('#high-contrast-black-yellow').prop('checked', true);
		    					$('html').attr('hc', 'by');
		    					break;
		    				default:
		    					break;
		    			}
		    		// HighContrast is enabled but there is no highContrastTheme
		    		} else {
						$('#no-high-contrast').prop('checked', true);
		    			$('html').removeAttr('hc');
		    		}

		    	// if not highContrastEnabled
		    	} else {
		    		$('#no-high-contrast').prop('checked', true);
		    		$('html').removeAttr('hc');
		    	}
		    // there is no property highContrastEnabled
		    } else {
		    	$('#no-high-contrast').prop('checked', true);
		    	$('html').removeAttr('hc');
		    }

		    // Invert Colours
		    if (localPreferences.hasOwnProperty('invertColours')) {
		    	if (localPreferences.invertColours) {
		    		$('#invert-colours.checkbox').prop('checked', true);
		    		$('html').attr('ic', 'invert');
		    	} else {
		    		$('#invert-colours-checkbox').prop('checked', false);
		    		$('html').removeAttr('ic');
		    	}
		    } // end of if Invert Colours

		    // magnification
		    if (localPreferences.hasOwnProperty('magnifierEnabled')) {
		    	if (localPreferences.magnifierEnabled) {
		    		$('#zoom-enable-checkbox').prop('checked', true);
		    		$('#zoom-level').prop('disabled', false);
		    		if (localPreferences.hasOwnProperty('magnification')) {
		    			var zoomValue = localPreferences.magnification,
		    				popupWidth = 400 * zoomValue;
		    			$('#zoom-level').val(localPreferences.magnification);
		    			$('body').css("{ zoom : " + zoomValue + "; width: "+ popupWidth +"");
		    		}
		    	}
		    } else {
		    	$('#zoom-enable-checkbox').prop('checked', false);
		    	$('#zoom-level').prop('disabled', true);
		    } // End of magnification if

	
	      	if (localPreferences.hasOwnProperty('fontSize')) {
		    // There is a property font Size
	        	switch (localPreferences.fontSize) {
		        	case 'medium': 
		          		$('#font-size-normal').prop('checked', true);
			        	$('html').removeAttr('ts');
		          		break;
		        	case 'large': 
		          		$('#font-size-large').prop('checked', true); 
			        	$('html').attr('ts', 'large');
		          		break;
		        	case 'x-large': 
		          		$('#font-size-x-large').prop('checked', true);
			        	$('html').attr('ts', 'x-large');
		          	break;
		        	default:
		          		$('#textSizeNormal').prop('checked', true);
			        	$('html').removeAttr('ts');
	        	} 
	      	} // fontSize

	      	if (localPreferences.hasOwnProperty('fontFace')) {
	      		switch (localPreferences.fontFace) {
	      			case 'Arial':
	      				$('#font-face-Arial').prop('selected', true);
	      				break;
	      			case 'Verdana':
	      				$('#font-face-Verdana').prop('selected', true);
	      				break;
	      			case 'Courier':
	      				$('#font-face-Courier').prop('selected', true);
	      				break;
	      			case 'Comic Sans MS':
	      				$('#font-face-ComicSans').prop('selected', true);
	      				break;
	      			default:
	      		}
	      	}

	      	if (localPreferences.hasOwnProperty('cursorSize')) {
	      		switch (localPreferences.cursorSize) {
	      			case 'normal':
	      				$('#cursor-size-normal').prop('checked', true);
	      				break;
	      			case 'large':
	      				$('#cursor-size-large').prop('checked', true);
	      				break;
	      			case 'x-large':
	      				$('#cursor-size-x-large').prop('checked', true);
	      				break;
	      			default: 
	      				break;
	      		}
	      	} else {
				$('#cursor-size-normal').prop('checked', true);
	      	}

	      	chrome.management.get('pflmllfnnabikmfkkaddkoolinlfninn', function(extInfo) {
	      		if (chrome.runtime.lastError) {
	      			console.log(chrome.runtime.lastError.message);
	      			$("#onscreenkeyboard-installed").hide();
	      			$("#onscreenkeyboard-not-installed").show();
	      		} else {
	      			console.log("Chrome Virtual Keyboard is installed");
	      			if (localPreferences.hasOwnProperty('onScreenKeyboardEnabled')) {
	      				if (localPreferences.onScreenKeyboardEnabled) {
	      					$('#onscreenkeyboard-checkbox').prop('checked', true);
	      				} else {
	      					$('#onscreenkeyboard-checkbox').prop('checked', false);
	      				}
	      			}
	      		}
	      	});
		
		    // Initialize simplifier
		    if (localPreferences.hasOwnProperty('simplifier')) {
	        	if (localPreferences.simplifier) {
		        	$('#simplifier-checkbox').prop('checked', true);
		          	console.log("Simplification set to true in background");
		      	} else {
		        	$('#simplifier-checkbox').prop('checked', false);
		        	console.log("Simplification set to false in background");
		      	}
	      	} // end if simplifier

	      	if (localPreferences.hasOwnProperty('language')) {

	      		var subLocale = localPreferences.language.substring(0, 2);

	      		if (subLocale == "en") {
	      			$('#synomyms-en-div').show();
	      		}

	      		if (subLocale == "es") {
					$('#sinonimos-es-div').show();
	      		}
	      	}

	      	if (localPreferences.hasOwnProperty('synonymsEn')) {
	      		if (localPreferences.synonymsEn) {
	      			$('#synonyms-en-checkbox').prop('checked', true);
	      		} else {
					$('#synonyms-en-checkbox').prop('checked', false);
	      		}
	      	}

	      	if (localPreferences.hasOwnProperty('sinonimosEs')) {
	      		if (localPreferences.sinonimosEs) {
	      			$('#sinonimos-es-checkbox').prop('checked', true);
	      		} else {
	      			$('#sinonimos-es-checkbox').prop('checked', false);
	      		}
	      	}
		
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

function onC4aWebsiteLinkClick() {
	chrome.tabs.create({ url : 'http://cloud4all.info' });
}



function signOutBtnClicked(e) {
  e.preventDefault();
  chrome.storage.local.clear();
  
  setPreferencesForm({ token: "", preferences: {} }); 
  
  document.documentElement.removeAttribute('hc');
  document.documentElement.removeAttribute('ts');
  document.documentElement.removeAttribute('zoom');
  document.documentElement.removeAttribute('ic');
  
  chrome.management.get('kgejglhpjiefppelpmljglcjbhoiplfn', function(extInfo) {
  	if (chrome.runtime.lastError) {
  		console.log("ChromeVox is not installed");
  	} else {
  		if (extInfo.enabled) {
	  		chrome.management.setEnabled(extInfo.id, false, function() {
	    		console.log("ChromeVox has been deactivated"); 
	  		});
		}
  	}
	
  });
}

function installCVClicked(e) {
	e.preventDefault();
	chrome.tabs.create({ url : "https://chrome.google.com/webstore/detail/chromevox/kgejglhpjiefppelpmljglcjbhoiplfn" });
}

function onInstallOnScreenKeyboardButtonClicked(e) {
	e.preventDefault();
	chrome.tabs.create({ url : "https://chrome.google.com/webstore/detail/chrome-virtual-keyboard/pflmllfnnabikmfkkaddkoolinlfninn" });
}

function onScreenKeyboardCheckBoxClicked() {
	if (this.checked) {
		localPreferences.onScreenKeyboardEnabled = true;
		chrome.notifications.create("OnScreenKeyboarActivated", notification_OnScreenReaderActivated, function(notificationId) {
			console.log(notificationId + " is active");
		});
	} else {
		localPreferences.onScreenKeyboardEnabled = false;
	}
	chrome.storage.local.set({ preferences : localPreferences });
}

function screenReaderCBClicked() {
  if (this.checked == true) {
    localPreferences.screenReaderTTSEnabled = true;
  } else {
    localPreferences.screenReaderTTSEnabled = false;
  }
  chrome.storage.local.set({ preferences : localPreferences });
}

function zoomEnableCheckboxClicked() {
	if (this.checked) {
		localPreferences.magnifierEnabled = true;
		$('#zoom-level').prop('disabled', false);
	} else {
		localPreferences.magnifierEnabled = false;
		$('#zoom-level').prop('disabled', true);
	}
	chrome.storage.local.set({ preferences : localPreferences });
}

function onZoomChanged() {
	var zoomValue = $(this).val();
	localPreferences.magnification = parseFloat(zoomValue);
    chrome.storage.local.set({ preferences : localPreferences });
}

function fontSizeChanged() {
	localPreferences.fontSize = $(this).val();
	console.log($(this).val());
	chrome.storage.local.set({ preferences : localPreferences });
}

function fontFaceChanged() {
	localPreferences.fontFace = $("#font-face-select").val();
	chrome.storage.local.set({ preferences : localPreferences });
}

function cursorSizeChanged() {
	localPreferences.cursorSize = $(this).val();
	chrome.storage.local.set({ preferences : localPreferences });
}

function highContrastChanged() {
	console.log("High contrast has changed");
	var hcValue = ($(this).val());
	switch (hcValue) {
		case "none":
			localPreferences.highContrastEnabled = false;
			localPreferences.highContrastTheme = hcValue;
			document.documentElement.removeAttribute('hc');
			chrome.storage.local.set({ preferences: localPreferences });
			break;
		case "white-black":
			localPreferences.highContrastEnabled = true;
			localPreferences.highContrastTheme = hcValue;
			document.documentElement.setAttribute('hc', 'wb');
			chrome.storage.local.set({ preferences: localPreferences });
			break;
		case "black-white":
			localPreferences.highContrastEnabled = true;
			localPreferences.highContrastTheme = hcValue;
			document.documentElement.setAttribute('hc', 'bw');
			chrome.storage.local.set({ preferences: localPreferences });
			break;
		case "yellow-black":
			localPreferences.highContrastEnabled = true;
			localPreferences.highContrastTheme = hcValue;
			document.documentElement.setAttribute('hc', 'yb');
			chrome.storage.local.set({ preferences: localPreferences });
			break;
		case "black-yellow":
			localPreferences.highContrastEnabled = true;
			localPreferences.highContrastTheme = hcValue;
			document.documentElement.setAttribute('hc', 'by');
			chrome.storage.local.set({ preferences: localPreferences });
			break;
		default:
			localPreferences.highContrastEnabled = false;
			localPreferences.highContrastTheme = hcValue;
			document.documentElement.removeAttribute('hc');
			chrome.storage.local.set({ preferences: localPreferences });
	}
}

function invertRBClicked() {
	if (this.checked) {
		localPreferences['invertColours'] = true;
		chrome.storage.local.set({ token: userToken, preferences: localPreferences });
		document.documentElement.setAttribute('ic', 'invert');
	} else {
		localPreferences['invertColours'] = false;
		chrome.storage.local.set({ token: userToken, preferences: localPreferences });
		document.documentElement.removeAttribute('ic');
	}
}

function simplifierCheckBoxClicked() {
	if (this.checked) {
		localPreferences.simplifier = true;
		chrome.storage.local.set({ token : userToken, preferences : localPreferences });
		document.getElementById("simplifier-checkBox").setAttribute("aria-checked", "true"); 
		// preferencesPort.postMessage({ simplifier : true }); 
	} else {
	  	localPreferences.simplifier = false;
	  	chrome.storage.local.set({ token : userToken, preferences : localPreferences });
	  	document.getElementById("simplifier-checkBox").setAttribute("aria-checked", "false");
	  	chrome.tabs.reload();
	  	// preferencesPort.postMessage({ simplifier : false }); 
	}
}

function synonymsEnCheckboxClicked() {
	if (this.checked) {
		localPreferences.synonymsEn = true;
	} else {
		localPreferences.synonymsEn = false;
	}
	chrome.storage.local.set({ preferences : localPreferences });
}

function sinonimosEsCheckboxClicked() {
	if (this.checked) {
		localPreferences.sinonimosEs = true;
	} else {
		localPreferences.sinonimosEs = false;
	}
	chrome.storage.local.set({ preferences : localPreferences });
}
