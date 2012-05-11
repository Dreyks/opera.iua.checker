// ==UserScript==
// @include http://*.i.ua/*
// @include http://i.ua/*
// ==/UserScript==
window.addEventListener('load', function(event) {
	var toSend = {};
	if (document.title)
	{
		var numMsg = document.title.match(/\[([0-9]+)\]$/);
		if (numMsg)
			toSend.num = numMsg[1];
	}
	if (window.location.href.match(/^http:\/\/mbox[0-9]?\.i\.ua\//))
  	{
		toSend.requestNeeded = true;
	}
	opera.extension.postMessage(toSend);}
, false);