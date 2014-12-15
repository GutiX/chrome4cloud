var lastFact = 1,
	currentFact = 1;


chrome.extension.onRequest.addListener(function(request, sender, callback) {
    if (request.action == "getSource") 
	{
        callback(document.getElementsByTagName('html')[0].innerHTML);
    }
	else if (request.action == "setFontSize") 
	{
		if(request.type == "medium")
		{
			callback(request.type);
		}
		else
		{
			setFontSize(request.type);
		}
    }
});

function setFontSize(size)
{
	var clases = [];
	currentFact = 1;
	if(size == 'large'){currentFact = 2;}else if(size == 'x-large'){currentFact = 4;}
	
	if(size == 'medium'){
		document.documentElement.removeAttribute('ts');
	}else{
		document.documentElement.setAttribute('ts', size); 
	}
	
	[].forEach.call(document.querySelectorAll('body *'), function(node) { 
		var className = node.className.trim();
		if(className != '' && $("." + className).css('display') != null && $("." + className).css('display') != "none" && node.nodeName != "IMG")
		{
			node.setAttribute('ts', size); 		
			//console.log(node.id + " - " + node.className)
			/*if($.inArray(className, clases) == -1 && $("." + className).css('letter-spacing') != null)
			{
				console.log(node.nodeName + ' - ' + className + ' letter-spacing');
				//$("." + className).css('letter-spacing', none);
			}*/
			/*if($.inArray(className, clases) == -1 && $("." + className).css('height') != null)  { 		
				clases.push(className);
				var height = $("." + className).css("height");
				var newHeight = getNewHeight(height, size);
				//$("." + className).css("cssText", "height: " + newHeight + " !important");
				$("." + className).css("height", newHeight);
				console.log(node.nodeName + ' - ' + className + ' Height: ' + height + ' - ' + newHeight + ' +++ ' + node.offsetHeight);
			}*/
		}
		else if(node.nodeName != "p" || node.nodeName != "a")
		{
			node.setAttribute('ts', size);
		}
		else if(className != '')
		{
			console.log(node.nodeName + ' - ' + className + ' Height: ' + node.offsetHeight + " ----- False");
		}
	});
	
	lastFact = currentFact;
}

function getNewHeight(height, size)
{
	var heightValue = 0;
	
	var index = height.indexOf("px");
	if(height.indexOf("px") != -1){
		var strHeight = height.substring(0, index);
		heightValue = (parseInt(strHeight) / lastFact) * currentFact;
		heightValue = heightValue + "px";
	}
	return heightValue;
}