'use strict';

var value,
	html = document.documentElement,
	uri = 'org.chrome.cloud4chrome',
	//npserver = 'http://127.0.0.1:8081/',
	npserver = 'http://preferences.gpii.net/',
	suffix = '/settings/%7B"OS":%7B"id":"web"%7D,"solutions":[%7B"id":"org.chrome.cloud4chrome"%7D]%7D',
	audio = new Audio("audio/beep-06.wav"),
	locale = "en-GB",
	cloudExtensionId = 'finocloegofdnndgmjfemdcfpapgcain',
	socketServer = 'http://localhost:8081/browserChannel';


//var io = require("socket.io-client");
var socket;

chrome.windows.onCreated.addListener(function() {
	// audio.play();
	connectServer();
});

chrome.windows.onRemoved.addListener(function() {

	diconnectServer();
});

chrome.runtime.onStartup.addListener(function() {
	console.log("Start up");
	//connectServer();
});

// initialization when your extension is installed or upgraded	
chrome.runtime.onInstalled.addListener(function(details) {
	// audio.play();
	chrome.storage.local.set({ "token" : "", "preferences" : {} });
	console.log("Chrome extension installed.");
	connectServer();
});

chrome.runtime.onSuspend.addListener(function() {
  chrome.storage.local.clear();
}); 

// Receives a message from the popup with the token when the token form is submitted	
chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
  	
  	if (message.action == "token submitted") {
  		requestPreferences(message.token);
  	}
	
  }
);

/*chrome.runtime.onMessageExternal.addListener(
  function(message, sender, sendResponse) {
    if (message.action == "preferences received") {
  		//console.log("LLega el mensaje: " + message.preferences);
		processPreferences({ token : message.token, payloadJSON: message.preferences });
		chrome.tabs.reload();
  	}
  });*/

function requestPreferences(token) {

	var xhr = new XMLHttpRequest();
	var url= npserver + token + suffix; 

	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {

			if (this.status == 200) {

				processPreferences({ token : token, payloadJSON: this.response });

				chrome.tabs.reload();

			// Got a different response (403, 404, 500)
			} else {

				console.log("Error downloading preferences");
				chrome.runtime.sendMessage({ action : "preferences downloaded", status: "error", message:xhr.statusText });
			
			}
		}
	};

	xhr.send(); 
}

function processPreferences(userPreferencesDownloaded) {

	try {
		var token = userPreferencesDownloaded.token, 
			payload = JSON.parse(userPreferencesDownloaded.payloadJSON);
					console.log("-- Preferences: " + userPreferencesDownloaded.payloadJSON);

		if (!(isEmpty(payload)) && (payload.hasOwnProperty(uri))) {

			payload[uri].language = chrome.i18n.getUILanguage();
			chrome.storage.local.set({ token : token, preferences : payload[uri]}, function() {
				if (chrome.runtime.lastError) {
					console.log("Error storing preferences locally: " + chrome.runtime.lastError.message);
					chrome.runtime.sendMessage({ action : "preferences downloaded", status : "error", message : "Error storing preferences locally" });
				} else {
					console.log("Preferences saved locally");
					chrome.runtime.sendMessage({ action : "preferences downloaded", status : "success", message: "Preferences saved locally" });
				}
			});

		} else {
			chrome.runtime.sendMessage({ action : "preferences downloaded", status : "error", message : "Preferences set is empty"});	
		}

	// There has been an error processing preferences
	} catch (e) {
		chrome.runtime.sendMessage({ action : "preferences downloaded", status : "error", message : "Error processing preferences"});
	}
}

// New window has been activated
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.storage.local.get({ 'token' : "", 'preferences' : {} }, function(results) {
		if (!(chrome.runtime.lastError)) {
			if (!(isEmpty(results['preferences']))) {
				setPreferences(results['preferences']);
			}
		}
	});
});


// Window has been updated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete') {
		chrome.storage.local.get({'token' : "", "preferences" : {} }, function(results) {
			if (!(chrome.runtime.lastError)) {
				if (!(isEmpty(results['preferences']))) {
					setPreferences(results['preferences']);
				}
			}
		});
	}
});


// Preferences have changed
chrome.storage.onChanged.addListener(function(changes, local) {
	console.log("changes detected in background: " + changes);
	var newPrefs = changes.preferences.newValue,
	    oldPrefs = changes.preferences.oldValue;

	if (!(isEmpty(newPrefs))) {
		setPreferences(newPrefs);
	} else {
		if (oldPrefs != undefined) {
			var simplifierIsOn = oldPrefs.simplifier || false;


			// Deactivate ChromeVox
			chrome.management.get('kgejglhpjiefppelpmljglcjbhoiplfn', function(extInfo) {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError.message);
				} else {
					chrome.management.setEnabled(extInfo.id, false, function() {
						console.log("ChromeVox deactivated");
					})
				}
			});

			// Deactivate Chrome Virtual Keyboard
			chrome.management.get('pflmllfnnabikmfkkaddkoolinlfninn', function(extInfo) {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError.message);
				} else {
					chrome.management.setEnabled(extInfo.id, false, function() {
						console.log("Chrome Virtual Keyboard deactivated");
					})
				}
			});

			chrome.tabs.reload();

		}
	}
});

function setPreferences(preferences) {

	// SCREEN READER ENABLED
	chrome.management.get('kgejglhpjiefppelpmljglcjbhoiplfn', function(extInfo) {
		if (chrome.runtime.lastError) {
			console.log(chrome.runtime.lastError.message);
		} else {
			if (preferences.hasOwnProperty('screenReaderTTSEnabled')) {
				if (preferences.screenReaderTTSEnabled) {
					if (!extInfo.enabled) {
						chrome.management.setEnabled(extInfo.id, true, function() {
							console.log("ChromeVox activated in background");
						});
					}
				} else {
					if (extInfo.enabled) {
						chrome.management.setEnabled(extInfo.id, false, function() {
							console.log("ChromeVox deactivated in background");
						});
					}
				}
			}
		
		}
	}); 

	// HIGH CONTRAST
	if (preferences.hasOwnProperty('highContrastEnabled')) {
		if (preferences['highContrastEnabled']) {
		// high contrast is enabled
			if (preferences.hasOwnProperty('highContrastTheme')) {
			console.log('-- Contrast: ' + preferences['highContrastTheme']);
			// high contrast is enabled and there is a high contrast
				switch (preferences['highContrastTheme']) {
					case 'black-white':
						chrome.tabs.executeScript( {code: "document.documentElement.setAttribute('hc','bw'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('hc'); }); document.documentElement.setAttribute('hc', 'bw'); "}, function() {
							if (chrome.runtime.lastError) { console.log("Error in setting attribute hc = bw: " + chrome.runtime.lastError.message ); }
						});
						break;
					case 'white-black':
						chrome.tabs.executeScript( { code : "document.documentElement.setAttribute('hc','wb'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('hc', 'wb'); });" }, function() {
							if (chrome.runtime.lastError) { console.log("Error in setting attribute hc = wb: " + chrome.runtime.lastError.message ); }
						}); 
			 			break;
					case 'yellow-black':
						chrome.tabs.executeScript({code: "document.documentElement.setAttribute('hc','yb'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('hc', 'yb'); });" }, function() {
							if (chrome.runtime.lastError) { console.log("Error in setting attribute hc = yb: " + chrome.runtime.lastError.message ); }
						}); 
						break;
					case 'black-yellow':
						chrome.tabs.executeScript({code: "document.documentElement.setAttribute('hc','by'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('hc', 'by'); });" }, function() {
							if (chrome.runtime.lastError) { console.log("Error in setting attribute hc = by: " + chrome.runtime.lastError.message ); }
						});
						break;
					default:
						chrome.tabs.executeScript({code: "document.documentElement.removeAttribute('hc'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('hc'); });" }, function() {
							if (chrome.runtime.lastError) { console.log("Error in removing attribute hc: " + chrome.runtime.lastError.message ); }
						});
						
				}
			}

		} else {
			// high contrast is not enabled
			chrome.tabs.executeScript({code: "document.documentElement.removeAttribute('hc'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('hc'); });" }, function() {
				if (chrome.runtime.lastError) { console.log("Error in removing attribute hc" + chrome.runtime.lastError.message ); }
			});
		}
	} // End High Contrast


	//INVERT COLOURS
	if (preferences.hasOwnProperty('invertColours')) {
		if (preferences['invertColours']) {
			console.log("inverting colours");
			chrome.tabs.executeScript({ code : 'document.documentElement.setAttribute("ic", "invert");' }, function() {
				if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message); }
			});
		} else {
			chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("ic");' }, function() {
				if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message); }
			});
		}
	}

	// MAGNIFICATION
	if (preferences.hasOwnProperty('magnifierEnabled')) {
		if (preferences.magnifierEnabled) {
		// magnifier is enabled
			if (preferences.hasOwnProperty('magnification')) {
			// magnifier is enabled and there is a value for magnification
				chrome.tabs.executeScript({ code : "$('html').css('zoom', " + preferences.magnification +  ");" , runAt: "document_end" }, function() {
					if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message); }
				});

			} else {
			// magnifier is enabled but there is no value for magnification
				chrome.tabs.executeScript({ code : "$('html').css('zoom', 1);"}, function() {
					if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message); }
				});
			}
		} else {
		// magnifier is not enabled
			chrome.tabs.executeScript({ code : "$('html').css('zoom', 1);"}, function() {
				if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
			});
		}
	} else {
		chrome.tabs.executeScript({ code : "$('html').css('zoom', 1);" }, function() {
			if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
		});
	}



	// FONT SIZE
	if (preferences.hasOwnProperty('fontSize')) {
		switch (preferences.fontSize) {
			case 'normal':
				chrome.tabs.executeScript({ code: "document.documentElement.removeAttribute('ts'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('ts', 'medium'); });" }, function() {
					if (chrome.runtime.lastError) { console.log("Error in adding attribute ts = medium: " + chrome.runtime.lastError.message ); }
				});
				//setfontsize('medium');
				//if (chrome.runtime.lastError) { console.log("Error in adding attribute ts = medium: " + chrome.runtime.lastError.message ); }
			  	break;
			case 'large': 
				/*chrome.tabs.executeScript({ code: "document.documentElement.setAttribute('ts','large'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('ts', 'large'); });" }, function() {
					if (chrome.runtime.lastError) { console.log("Error in adding attribute ts = large: " + chrome.runtime.lastError.message ); }
				});*/
				setfontsize('large');
				if (chrome.runtime.lastError) { console.log("Error in adding attribute ts = large: " + chrome.runtime.lastError.message );}
				break;
			case 'x-large':
				/*chrome.tabs.executeScript({ code: "document.documentElement.setAttribute('ts','x-large'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('ts', 'x-large'); });" }, function() {
					if (chrome.runtime.lastError) { console.log("Error in adding attribute ts = x-large: " + chrome.runtime.lastError.message ); }
				});*/
				setfontsize('x-large');
				if (chrome.runtime.lastError) { console.log("Error in adding attribute ts = x-large: " + chrome.runtime.lastError.message );}
				break;
			default:
				chrome.tabs.executeScript({ code: "document.documentElement.removeAttribute('ts'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('ts'); });" }, function() {
					if (chrome.runtime.lastError) { console.log("Error in removing attribute ts" + chrome.runtime.lastError.message ); }
				});
		}
	} else {
		chrome.tabs.executeScript( {code: "document.documentElement.removeAttribute('ts'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('ts'); });" }, function() {
			if (chrome.runtime.lastError) { console.log("Error in removing attribute ts" + chrome.runtime.lastError.message ); }
		}); 
	}

	// FONT FACE
	if (preferences.hasOwnProperty('fontFace')) {
		var fontFace = preferences.fontFace;
		chrome.tabs.executeScript({ code : "document.documentElement.setAttribute('ff', '" + fontFace + "'); " }, function() {
			if (chrome.runtime.lastError) { console.log("Error changing font face: " + chrome.runtime.lastError.message); }
		});
	}
	
	if (preferences.hasOwnProperty('cursorSize')) {
		switch (preferences.cursorSize) {
			case "normal": 
				chrome.tabs.insertCSS({ code : 'html, a { cursor : auto; }' }, function() {
					if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
				});
				break;
			case "large":
				chrome.tabs.insertCSS({ code : 'html { cursor : url('+ chrome.extension.getURL('images') +'/arrow_icon_large.png), auto; } a { cursor : url('+ chrome.extension.getURL('images') +'/hand_icon_large.png), auto !important; }'}, function() {
					if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
				}); 
				break;
			case "x-large":
				chrome.tabs.insertCSS({ code : 'html { cursor : url('+ chrome.extension.getURL('images') +'/arrow_icon_x_large.png), auto; } a { cursor : url('+ chrome.extension.getURL('images') +'/hand_icon_x_large.png), auto !important; }'}, function() {
					if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
				}); 
				break;
			default:
				chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("cs");' }, function() {
					if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
				});
		}
	}

	if (preferences.hasOwnProperty('onScreenKeyboardEnabled')) {
		chrome.management.get('pflmllfnnabikmfkkaddkoolinlfninn', function(extInfo) {
			if (chrome.runtime.lastError) {
				console.log(chrome.runtime.lastError);
			} else {
				if (preferences.onScreenKeyboardEnabled) {
					if (!extInfo.enabled) {
						chrome.management.setEnabled(extInfo.id, true, function() {
							console.log("Chrome Virtual Keyboard activated");
						})
					}
				} else {
					if (extInfo.enabled) {
						chrome.management.setEnabled(extInfo.id, false, function() {
							console.log("Chrome Virtual Keyboard has been deactivated");
						})
					}
				}
			}
		});
	}
	// SIMPLIFIER
	/*if (preferences.hasOwnProperty('simplifier')) {
		if (preferences['simplifier']) {
			chrome.tabs.executeScript({ file : "js/simplifier.js" });
		}
	}*/

	// SYNONYMS
	if (preferences.hasOwnProperty('synonymsEn')) {
		if (preferences.synonymsEn) {
			chrome.tabs.query({ active : true, currentWindow : true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { action : "enable synonyms", status : true }, function(response) {
				});
			});
		} else {
			chrome.tabs.query({ active : true, currentWindow : true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { action : "enable synonyms", status : false }, function(response) {
				});
			});
		}
	}

	// SINONIMOS
	if (preferences.hasOwnProperty('sinonimosEs')) {
		if (preferences.sinonimosEs) {
			chrome.tabs.query({ active : true, currentWindow : true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { action : "habilitar sinonimos", status : true }, function(response) {
				});
			});
		} else {
			chrome.tabs.query({ active : true, currentWindow : true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { action : "habilitar sinonimos", status : false }, function(response) {
				});
			});
		}
	}

}

function setfontsize(fact)
{
	chrome.tabs.getAllInWindow(null, function(tabs){
		for (var i = 0; i < tabs.length; i++) {
			console.log("Tab: " + tabs[i].id);
			chrome.tabs.sendRequest(tabs[i].id, {action: "setFontSize", type: fact}, function(source) {
                //console.log("Source: " + source);
            });
		}
	});
}

function installCV() {
	console.log("Inside installCV");
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.update(tabs[0].id, {url: "https://chrome.google.com/webstore/detail/chromevox/kgejglhpjiefppelpmljglcjbhoiplfn?hl=en"});
		self.close();
	}); 
}

function isEmpty(obj) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key))
      return false;
  }
  return true;
}	

//SOCKET.IO SERVER
/*var socket = io.connect('http://localhost:8000', function(){
	socketListeners();
});*/


function connectServer()
{
	console.log("windows.onCreated....");
	//if(socket == null) socket = io.connect('http://localhost:8000');
	if(socket == null)
	{
		console.log("### Connecting");
		socket = io.connect(socketServer);
	}
	
	if(socket != null && socket.socket.connected)
	{
		console.log("--- Connected ---");
		socketListeners();
	}
	else
	{
		socketListeners();
		console.log("--- Disconnected ---");
		socket.socket.reconnect();
		//socket.socket.connect();
	}
	//socket.emit('getpreferences', 'Cloud4chrome');
}

function socketListeners()
{
	socket.on('connect', function(data){
		console.log('Socket connected: ');
		console.log("### Sending uri");
		socket.send(uri);
	});
	
	socket.on("connectionSucceeded", function (settings) {
		console.log("## Received the following settings: " + JSON.stringify(settings));
		var preferences = '{"' + uri + '":' + JSON.stringify(settings) + '}';
		console.log("## Received the following preferences: " + preferences);
		processPreferences({ token : 'system', payloadJSON: preferences });
		chrome.tabs.reload();
	});

	socket.on('applyPref', function(preferences){
		console.log('Preferences received: ' + preferences);
		var settings = '{"' + uri + '":' + preferences + '}';
		console.log('Preferences received: ' + settings);
		processPreferences({ token : 'system', payloadJSON: settings });
		//processPreferences({ token : 'system', payloadJSON: preferences });
		chrome.tabs.reload();
		//socket.socket.disconnect();
	});
	
	socket.on('onBrowserSettingsChanged', function(settings){
		console.log('Preferences received: ' + preferences);
		var preferences = '{"' + uri + '":' + JSON.stringify(settings) + '}';
		processPreferences({ token : 'system', payloadJSON: preferences });
		chrome.tabs.reload();
	});
	
	socket.on('getPref', function(request){
		console.log('Get preferences');
		chrome.storage.local.get({ 'token' : "", 'preferences' : {} }, function(results) {
			if (!(chrome.runtime.lastError)) {
				if (!(isEmpty(results['preferences']))) {
					var prefe = '{"' + uri + '":' + JSON.stringify(results['preferences']) + '}';
					console.log('--- Get preferences: ' + prefe);
					socket.emit('getpreferences', prefe);
				}
			}
		}); 
	});
	
	/*socket.on('disconnect', function(request){
		console.log('Disconnect: ' + request);
		signOut();
		chrome.tabs.reload();
	});*/
}

function diconnectServer()
{
	console.log("windows.onRemoved....");
	if(socket != null && socket.socket.connected)
	{
		console.log("windows.onRemoved....");
		socket.socket.disconnect();
		//socket.disconnect();
	}
		
	signOut();
}

function signOut() {
  chrome.storage.local.clear();
  
  processPreferences({ token: "", preferences: {} }); 
  /*
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
	
  });*/
}