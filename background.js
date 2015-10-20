'use strict';

var value,
	html = document.documentElement,
	uri = 'com.ilunion.cloud4chrome',
	//npserver = 'http://127.0.0.1:8081/',
	npserver = 'http://flowmanager.gpii.net/',
	suffix = '/settings/%7B"OS":%7B"id":"web"%7D,"solutions":[%7B"id":"com.ilunion.cloud4chrome"%7D]%7D',
	audio = new Audio("audio/beep-06.wav"),
	locale = "en-GB",
	cloudExtensionId = 'finocloegofdnndgmjfemdcfpapgcain',
	socketServer = 'http://localhost:8081/browserChannel',
	currentPref = {};


//var io = require("socket.io-client");
var socket;
var connect = false;

chrome.windows.onCreated.addListener(function() {
	// audio.play();
	chrome.storage.local.clear();
	chrome.storage.local.set({ "token" : "", "preferences" : {} });
	console.log("Start.");
	//-connectServer();
	//connect = true;
});

chrome.windows.onRemoved.addListener(function() 
{
	diconnectServer();
});

chrome.runtime.onStartup.addListener(function() {
	console.log("Start up");
	//connectServer();
});

// initialization when your extension is installed or upgraded	
chrome.runtime.onInstalled.addListener(function(details) {
	// audio.play();
	chrome.storage.local.clear();
	chrome.storage.local.set({ "token" : "", "preferences" : {} });
	console.log("Chrome extension installed.");
	//-connectServer();
});

chrome.runtime.onSuspend.addListener(function() {
  chrome.storage.local.clear();
}); 

// Receives a message from the popup with the token when the token form is submitted	
chrome.runtime.onMessage.addListener(
  function(request, sender, callback) {
  	
  	if (request.action == "token submitted") 
	{
  		requestPreferences(request.token);
  	}
	else if (request.action == "xhttp") 
	{
        var xhttp = new XMLHttpRequest();
        var method = request.method ? request.method.toUpperCase() : 'GET';

		xhttp.onreadystatechange = function() {
            if (xhttp.readyState == 4) {
                if (xhttp.status == 200) {
					console.log("Words received: " + xhttp.responseText);
                    callback(xhttp.responseText);
                }
            } else {
                if (xhr.status == 404) {
                    callback("error_404");
                }
            }
        };
        /*xhttp.onload = function() {
            callback(xhttp.responseText);
        };*/
        xhttp.onerror = function() {
            // Do whatever you want on error. Don't forget to invoke the
            // callback to clean up the communication port.
            callback();
        };
        xhttp.open(method, request.url, true);
        if (method == 'POST') {
            xhttp.setRequestHeader('Content-Type', request.format);
        }
        xhttp.send(request.data);
        return true; // prevents the callback from being called too early on return
    }
	
  }
);

function requestPreferences(token) {

	var xhr = new XMLHttpRequest();
	var url= npserver + token + suffix; 
	console.log(url);
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
					chrome.runtime.sendMessage({ action : "preferences downloaded", status : "error", message : "Error storing preferences locally" }); // @@l10n
				} else {
					console.log("Preferences saved locally");
					chrome.runtime.sendMessage({ action : "preferences downloaded", status : "success", message: "Preferences saved locally" }); // @@l10n
				}
			});

		} else {
		    var emptyNpSetMessage = chrome.i18n.getMessage('emptyNpSetMessage');
			chrome.runtime.sendMessage({ action : "preferences downloaded", status : "error", message : emptyNpSetMessage}); // @@l10n
		}

	// There has been an error processing preferences
	} catch (e) {
		chrome.runtime.sendMessage({ action : "preferences downloaded", status : "error", message : "Error processing preferences"}); // @@l10n
	}
}

// New window has been activated
chrome.tabs.onActivated.addListener(function(activeInfo) {
	//-connectServer();
	console.log(" Entra en chrome.tabs.onActivated.addListener");
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
	//-connectServer();
	console.log(" Entra en chrome.tabs.onUpdated.addListener");
	if (changeInfo.status == 'complete') {
		console.log(" Entra en chrome.tabs.onUpdated.addListener - complete");
		chrome.storage.local.get({'token' : "", "preferences" : {} }, function(results) {
			console.log(" Entra en chrome.tabs.onUpdated.addListener - complete - results: " + JSON.stringify(results));
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
		if (oldPrefs !== undefined) {
			var simplifierIsOn = oldPrefs.simplifier || false;


			// Deactivate ChromeVox
			chrome.management.get('kgejglhpjiefppelpmljglcjbhoiplfn', function(extInfo) {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError.message);
				} else {
					chrome.management.setEnabled(extInfo.id, false, function() {
						console.log("ChromeVox deactivated");
					});
				}
			});

			// Deactivate Chrome Virtual Keyboard
			chrome.management.get('pflmllfnnabikmfkkaddkoolinlfninn', function(extInfo) {
				if (chrome.runtime.lastError) {
					console.log(chrome.runtime.lastError.message);
				} else {
					chrome.management.setEnabled(extInfo.id, false, function() {
						console.log("Chrome Virtual Keyboard deactivated");
					});
				}
			});

			//chrome.tabs.reload();

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
			}else {
					
						chrome.management.setEnabled(extInfo.id, false, function() {
							console.log("ChromeVox deactivated in background");
						});
					
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
						//chrome.tabs.executeScript( {code: "document.documentElement.setAttribute('hc','bw'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('hc'); }); document.documentElement.setAttribute('hc', 'bw'); "}, function() {
						chrome.tabs.executeScript( {code: "document.documentElement.setAttribute('hc','bw'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('hc', 'bw'); }); document.documentElement.setAttribute('hc', 'bw'); "}, function() {
							if (chrome.runtime.lastError) { console.log("Error in setting attribute hc = bw: " + chrome.runtime.lastError.message ); }
						});
						break;
					case 'white-black':
						chrome.tabs.executeScript( { code : "document.documentElement.setAttribute('hc','wb'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('hc', 'wb'); }); document.documentElement.setAttribute('hc', 'wb');" }, function() {
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
	}  else {
		// high contrast is not enabled
		chrome.tabs.executeScript({code: "document.documentElement.removeAttribute('hc'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('hc'); });" }, function() {
			if (chrome.runtime.lastError) { console.log("Error in removing attribute hc" + chrome.runtime.lastError.message ); }
		});
	}// End High Contrast


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
	} else {
		chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("ic");' }, function() {
			if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message); }
		});
	}

	// MAGNIFICATION
	if (/*preferences.hasOwnProperty('magnifierEnabled')*/ true) {
		if (/*preferences.magnifierEnabled*/ true) {
		// magnifier is enabled
			if (preferences.hasOwnProperty('magnification')) {
			// magnifier is enabled and there is a value for magnification
				//chrome.tabs.executeScript({ code : "$('html').css('zoom', " + preferences.magnification +  ");" , runAt: "document_end" }, function() {
				chrome.tabs.getAllInWindow(null, function(tabs){
					for (var i = 0; i < tabs.length; i++) {
						console.log("Tab: " + tabs[i].id);
						
						chrome.tabs.executeScript(tabs[i].id, { code : "var bwidth = document.body.clientWidth; " + 
															"var bheight = document.body.clientHeight; " +
															"var newCoef = " + preferences.magnification + "; " +
															"var translx = (((bwidth * newCoef) - bwidth) / 2) / newCoef; " +
															"var transly = (((bheight * newCoef) - bheight) / 2) / newCoef; " + 
															"$('html').css('transform', 'scale(' + newCoef + ') translate(' + translx + 'px, ' + transly + 'px)');" , runAt: "document_end" }, function() {
							if (chrome.runtime.lastError) { console.log("Error: " + chrome.runtime.lastError.message); }
						});
						
					}
				});
			} else {
			// magnifier is enabled but there is no value for magnification
				//chrome.tabs.executeScript({ code : "$('html').css('zoom', 1);"}, function() {
				chrome.tabs.executeScript({ code : "$('html').css('transform', 'scale(1) translate(0px, 0px);"}, function() {
					if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message); }
				});
			}
		} /*else {
		// magnifier is not enabled
			chrome.tabs.executeScript({ code : "$('html').css('zoom', 1);"}, function() {
				if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
			});
		}
	} else {
		chrome.tabs.executeScript({ code : "$('html').css('zoom', 1);" }, function() {
			if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
		});*/
	}

	//LINE SPACE
	if (preferences.hasOwnProperty('lineHeight')) {
	// magnifier is enabled and there is a value for magnification
		chrome.tabs.executeScript({ code : "$('html').css('lineHeight', " + preferences.lineHeight +  ");" +
			"$('p').css('lineHeight', " + preferences.lineHeight +  ");" +
			"$('span').css('lineHeight', " + preferences.lineHeight +  ");" +
			"$('a').css('lineHeight', " + preferences.lineHeight +  ");" +
			"$('input').css('lineHeight', " + preferences.lineHeight +  ");" +
			"$('label').css('lineHeight', " + preferences.lineHeight +  ");" , runAt: "document_end" }, function() {
				if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message); }
		});

	} else {
	// magnifier is enabled but there is no value for magnification
		chrome.tabs.executeScript({ code : "$('html').css('lineHeight', 1);" +
			"$('p').css('lineHeight', 1.3);" +
			"$('span').css('lineHeight', 1.3);" +
			"$('a').css('lineHeight', 1.3);" +
			"$('input').css('lineHeight', 1.3);" +
			"$('label').css('lineHeight', 1.3);"}, function() {
				if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message); }
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
	
	//CURSOR SIZE
	if (preferences.hasOwnProperty('cursorSize')) {
		switch (preferences.cursorSize) {
			case "normal": 
				chrome.tabs.insertCSS({ code : 'html, div, a, a span, a img, select, button, input, img, label[for], ul, li, h1, h2, h3, p, span, iframe html { cursor : auto !important; }' }, function() {
					if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
				});
				/*chrome.tabs.executeScript({ code: "document.documentElement.removeAttribute('cs'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('cs'); });" }, function() {
					if (chrome.runtime.lastError) { console.log("Error in adding attribute cs = medium: " + chrome.runtime.lastError.message ); }
				});*/
				break;
			case "large":
				chrome.tabs.insertCSS({ code : 'html, div, img, ul, li, h1, h2, h3, p, span, iframe html { cursor : url('+ chrome.extension.getURL('images') +'/arrow_icon_large.png), auto !important; } a, a span, a img, select, button, input, label[for] { cursor : url('+ chrome.extension.getURL('images') +'/hand_icon_large.png), auto !important; }'}, function() {
					if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
				}); 
				/*chrome.tabs.executeScript({ code: "document.documentElement.setAttribute('cs','large'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('cs', 'large'); });" }, function() {
					if (chrome.runtime.lastError) { console.log("Error in adding attribute cs = large: " + chrome.runtime.lastError.message ); }
				});*/
				break;
			case "x-large":
				chrome.tabs.insertCSS({ code : 'html, div, img, ul, li, h1, h2, h3, p, span, iframe html { cursor : url('+ chrome.extension.getURL('images') +'/arrow_icon_x_large.png), auto !important; } a, a span, a img, select, button, input, label[for], iframe { cursor : url('+ chrome.extension.getURL('images') +'/hand_icon_x_large.png), auto !important; }'}, function() {
					if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
				});
				/*chrome.tabs.executeScript({ code: "document.documentElement.setAttribute('cs','x-large'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('cs', 'x-large'); });" }, function() {
					if (chrome.runtime.lastError) { console.log("Error in adding attribute cs = x-large: " + chrome.runtime.lastError.message ); }
				});*/
				break;
			default:
				chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("cs");' }, function() {
					if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
				});
		}
	} else {
		chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("cs");' }, function() {
			if (chrome.runtime.lastError) { console.log(chrome.runtime.lastError.message ); }
		});
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
						});
					}
				} else {
					if (extInfo.enabled) {
						chrome.management.setEnabled(extInfo.id, false, function() {
							console.log("Chrome Virtual Keyboard has been deactivated");
						});
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
	else
	{
		chrome.tabs.query({ active : true, currentWindow : true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { action : "enable synonyms", status : false }, function(response) {
			});
		});
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

console.log("Socket.io connection ....");

if (socket == null) {
    console.log("### Connecting for the first time");
    connectToGPII();
}

setInterval(function () {
    if (!connect || socket == null || !socket.socket.connected) {
        connect = false;
        connectToGPII();
    }
}, 10000);

function connectToGPII () {
    socket = io.connect(socketServer, {'force new connection': true});
    socketListeners();
}

function socketListeners () {
	socket.on('connect', function (data) {
		console.log('Socket connected: ');
		console.log("### Sending uri");
		socket.send(uri);
		connect = true;
	});
	
	socket.on("connectionSucceeded", function (settings) {
		chrome.runtime.sendMessage({action: 'socketConnected'});
		processSettings(settings);
	});

	socket.on("onBrowserSettingsChanged", function(settings){
		console.log("onBrowserSettingsChanged: " + JSON.stringify(settings));
		processSettings(settings);
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
	
	socket.socket.on('disconnect', function (request){
		console.log('Disconnect: ' + request);
		connect = false;
	});
	
	socket.on('error', function (err){
		console.log('Connection Error. ' + err);
		connect = false;
	});
}

function processSettings(settings)
{
	if(currentPref != settings)
	{
		currentPref = settings;
		console.log("## Received the following settings: " + JSON.stringify(settings));
		var preferences = '{"' + uri + '":' + JSON.stringify(settings) + '}';
		if(settings == null) preferences = '{"' + uri + '": {}}';
		console.log("## Received the following preferences: " + JSON.stringify(preferences));
		//processPreferences({ token : 'system', payloadJSON: preferences });
		processPreferences({ token : '', payloadJSON: preferences });
		if(currentPref == {}) reloadTabs();
	}
}

function diconnectServer()
{
	console.log("Disconnected ....");
	
	//connectServer();
	/*if(socket !== null && socket.socket.connected)
	{
		console.log("removing....");
		//socket.socket.disconnect();
	}*/
		
	//signOut();
}

function signOut() {
  chrome.storage.local.clear();
  
  //processPreferences({ token: "", payloadJSON: {"com.ilunion.cloud4chrome": {}} }); 
  
}

function reloadTabs()
{
	console.log("Reloading Tabs ...");
	chrome.tabs.getAllInWindow(function(tabs){
		console.log("Tabs size: " + tabs.length);
		for (var i = 0; i < tabs.length; i++) // loop over the tabs
		{
			console.log("Tab - " + i + ": " + tabs[i].id);
			 // reload tab
			chrome.tabs.reload(tabs[i].id);
		}
	});
}