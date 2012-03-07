// ==UserScript==
// @include http://*.i.ua/*
// ==/UserScript==
var hasFocus = false;
window.addEventListener('focus', function(event){hasFocus = true;})
window.addEventListener('blur', function(event){hasFocus = false;})
window.addEventListener('load', function(event) {
	var toSend = {};
	if (document.title)
	{
		var numMsg = document.title.match(/\[([0-9]+)\]$/);
		if (numMsg)
			toSend.num = numMsg;
	}
	if (window.location.href.match(/^http:\/\/mbox[0-9]?\.i\.ua\//))
  	{
		toSend.requestNeeded = true;
	}
	opera.extension.postMessage(toSend);}
, false);
opera.extension.onmessage = function(event){
	var inbox = event.data.inbox;
	if (inbox && -1 !== window.location.href.indexOf(inbox))
	{
		opera.postError('tab found, trying to focus');
		window.focus();
		setTimeout(function()
		{
			if (!hasFocus)
			{
				opera.postError('window.focus() failed, falling back to close/open tab');
				event.source.postMessage({'forceCreate': true})
			}
		}, 200);
	}
}