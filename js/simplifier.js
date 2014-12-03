/*var simpleContainer = document.createElement("div");
	
simpleContainer.setAttribute("id", "simpleContainer");

var nodes = document.querySelectorAll("h1, h2, h3, p, blockquote");		
var max = nodes.length;
		
//document.body.setAttribute("simp", "true");
	
		
document.documentElement.innerHTML = "";
document.body.setAttribute("simp", "true");
document.body.appendChild(simpleContainer);

var divArticle = document.createElement("div");
divArticle.setAttribute("class", "article");
for (var i = 0; i < max; i++) {
  if (nodes[i].nodeName == "H1") {
    if ((divArticle.childElementCount > 0) && (divArticle.querySelectorAll("h1, h2").length > 0) && (divArticle.querySelectorAll("p").length > 0)) {
      document.getElementById("simpleContainer").appendChild(divArticle.cloneNode(true));
    }
    divArticle.innerHTML = "";
    divArticle.appendChild(nodes[i]);
  } else if (nodes[i].nodeName == "H2") {
    if ((divArticle.childElementCount > 0) && (divArticle.querySelectorAll("h2").length > 0) && (divArticle.querySelectorAll("p").length > 0)) {
	  document.getElementById("simpleContainer").appendChild(divArticle.cloneNode(true));
	  divArticle.innerHTML = "";
   	}
	divArticle.appendChild(nodes[i]);
	} else {
	  divArticle.appendChild(nodes[i]);
	}
 }
    
if ((divArticle.childElementCount > 0) && (divArticle.querySelectorAll("h1, h2").length > 0) && (divArticle.querySelectorAll("p").length > 0)) {
  document.getElementById("simpleContainer").appendChild(divArticle);
}*/