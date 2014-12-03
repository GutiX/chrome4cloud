/*'use strict';

var url = "https://store.apicultur.com/api/sinonimosporpalabra/1.0.0/";
var access_token = "nPG0CABN9NGflaWFpExDMd9y1UUa";
var sel_x = 0, sel_y = 0;
var help_paragraph = $('<p></p>').addClass('help-paragraph').text("Pulsa el ratón o cualquier tecla para cerrar");
var error_paragraph = $('<p></p>').text("Oops, no hemos encontrado sinónimos de la palabra");


chrome.runtime.onMessage.addListener(
    function(req, sen, sendResponse) {
        if (req.action == "habilitar sinonimos") {
            if (req.status == true) {
                $(document).bind('dblclick', onDoubleClickEs);
                console.log("Activando sinonimos");
            } else {
                $(document).unbind('dblclick', onDoubleClickEs);
                console.log("Desactivando sinonimos");
            }
        }
    }
);

function onDoubleClickEs(e) {

    console.log("double clicking");

    var t = get_selection();

    if (t.length > 0) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url + t, true);
        xhr.setRequestHeader('Content-Type','application/json');
        xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    showTooltip(xhr.responseText);
                    console.log()
                }
            } else {
                showErrorTooltip();
            }
        };

        xhr.send();
    }
}

function get_selection() {
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

function showTooltip(synonymsJSON) {

    var synonyms = JSON.parse(synonymsJSON),
        synonyms_array = [],
        nsyn = synonyms.length,
        tooltipDiv = $("<div class='tooltip'></div>");

    $(tooltipDiv).css("top", sel_y);
    $(tooltipDiv).css("left", sel_x);

    if (nsyn > 0) {
        for (var i = 0; i < nsyn; i++) {
            synonyms_array.push(synonyms[i]["valor"]);
        }
    }

    console.log(synonyms_array);

    var par = $("<p></p>").text(synonyms_array.join(", "));
    $(tooltipDiv).append(par);
    $(tooltipDiv).append(help_paragraph);

    $('body').append(tooltipDiv);
}

function showErrorTooltip() {
    var tooltipDiv = $("<div class='tooltip'></div>");
    $(tooltipDiv).css("top", sel_y);
    $(tooltipDiv).css("left", sel_x);
    $(tooltipDiv).append(error_paragraph);
    $(tooltipDiv).append(help_paragraph);
    $('body').append(tooltipDiv);
}

$(document).keyup(function(e) {
    $(".tooltip").remove();
});

$(document).mousedown(function(e) {
    $(".tooltip").remove();
});*/