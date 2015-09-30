'use strict';

//var bhl_url = "http://words.bighugelabs.com/api/2/d1cbb0c53ddabe240d726e3fc76b1491/";
var bhl_url = "http://words.bighugelabs.com/api/2/0791f67e8212761406e388ef91856024/";
var sel_x = 0, sel_y = 0;
var help_paragraph_en = $('<p></p>').addClass('help-paragraph').text("Click the mouse or any key to close");
var error_paragraph_en = $('<p></p>').text("Sorry, no synonyms found");

chrome.runtime.onMessage.addListener(
    function(req, sen, sendResponse) {
        if (req.action == "enable synonyms") {
            if (req.status == true) {
                $(document).bind('dblclick', onDoubleClickEn);
                console.log("Activating synonyms");
            } else {
                $(document).unbind('dblclick', onDoubleClickEn);
                console.log("Deactivating synonyms");
            }
        }
    }
);

function onDoubleClickEn(e) {
    var t = get_selection_en();

    if (t.length > 0) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", bhl_url + t + "/json", true);
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
					console.log("Words received: " + xhr.responseText);
                    showTooltipEn(xhr.responseText);
                }
            } else {
                if (xhr.status == 404) {
                    showErrorTooltipEn();
                }
            }
        };

        xhr.send();
    }
}

function get_selection_en() {
    var txt = '';

    if (window.getSelection) {

        txt = window.getSelection();
        var selection = txt.getRangeAt(0);
        sel_x = selection.getBoundingClientRect().left; 
        sel_y = selection.getBoundingClientRect().top; 

    } else if (document.getSelection) {

        txt = document.getSelection();
        var selection = txt.getRangeAt(0);
        sel_x = selection.getBoundingClientRect().left; 
        sel_y = selection.getBoundingClientRect().top; 

    } else if (document.selection) {

        txt = document.selection.createRange().text;

    }

    return $.trim(txt.toString());
}

function showTooltipEn(synonymsJSON) {

    var synonyms = JSON.parse(synonymsJSON);
    var tooltipDiv = $("<div class='tooltip'></div>");
    $(tooltipDiv).css("top", sel_y);
    $(tooltipDiv).css("left", sel_x);

    if (synonyms.hasOwnProperty("noun")) {
        if ((synonyms.noun.hasOwnProperty("syn")) && (synonyms.noun.syn.length > 0) ) {
            var synonymsList = synonyms.noun.syn.join(", ");
        }
        var title = $("<h1></h1>").text("Noun");
        var par = $("<p></p>").text(synonymsList);
        $(tooltipDiv).append(title);
        $(tooltipDiv).append(par);
    }

    if (synonyms.hasOwnProperty("verb")) {
        if ((synonyms.verb.hasOwnProperty("syn")) && (synonyms.verb.syn.length > 0) ) {
            var synonymsList = synonyms.verb.syn.join(", ");
        }
        var title = $("<h1></h1>").text("Verb");
        var par = $("<p></p>").text(synonymsList);
        $(tooltipDiv).append(title);
        $(tooltipDiv).append(par);
    }

    if (synonyms.hasOwnProperty("adjective")) {
        if ((synonyms.adjective.hasOwnProperty("syn")) && (synonyms.adjective.syn.length > 0) ) {
            var synonymsList = synonyms.adjective.syn.join(", ");
        }
        var title = $("<h1></h1>").text("Adjective");
        var par = $("<p></p>").text(synonymsList);
        $(tooltipDiv).append(title);
        $(tooltipDiv).append(par);
    }

    $(tooltipDiv).append(help_paragraph_en);

    $('body').append(tooltipDiv);
}

function showErrorTooltipEn() {
    var tooltipDiv = $("<div class='tooltip'></div>");
    $(tooltipDiv).css("top", sel_y);
    $(tooltipDiv).css("left", sel_x);
    $(tooltipDiv).append(error_paragraph_en);
    $(tooltipDiv).append(help_paragraph_en);
    $('body').append(tooltipDiv);
}

$(document).keyup(function(e) {
    $(".tooltip").remove();
});

$(document).mousedown(function(e) {
    $(".tooltip").remove();
});