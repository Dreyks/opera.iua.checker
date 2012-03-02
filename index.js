var iuaMboxURL = "http://mbox2.i.ua/";
var requestTimerId;
var unreadCount = -1;
var iuaCheckURL = "http://chk.i.ua/?request=check_mail";
var requestFailureCount = 0;
var requestTimeout = 1000 * 2;
var pollIntervalMin = 1000 * 60 * 0.5;
var pollIntervalMax = 1000 * 60 * 1;

function formTabUrl(url)
{
	var randPos = url.indexOf('_rand=');
	if (randPos == -1)
		return url + (url.indexOf('?') == -1 ? '?' : '&') + "_rand="+Math.random();
	else
	{
		var randEnd = url.indexOf('&', randPos);
		if (randEnd == -1)
			randEnd = url.length;
		return url.substr(0, randPos) +  '_rand=' + Math.random() + url.substr(randEnd);
	}
}

function receivePost(e)
{
	var sent = e.data;
	if (sent.num)
		updateUnreadCount(num);
	else if (sent.requestNeeded)
		startRequest();
}

function goToInbox()
{
	opera.extension.tabs.create({url: formTabUrl(iuaMboxURL), focused: true});
}

function getInboxCount(onSuccess, onError) {
	var xhr = new XMLHttpRequest();
	var abortTimerId = window.setTimeout(function() {
		xhr.abort();
	}, requestTimeout);

	function handleSuccess(count) {
		requestFailureCount = 0;
		window.clearTimeout(abortTimerId);
		if (onSuccess)
			onSuccess(count);
	}

	var invokedErrorCallback = false;
	function handleError() {
		++requestFailureCount;
		window.clearTimeout(abortTimerId);
		if (onError && !invokedErrorCallback)
			onError();
		invokedErrorCallback = true;
	}

	try {
		xhr.onreadystatechange = function(){
			if (xhr.readyState != 4)
				return;

			if (xhr.responseXML) {
				//console.log('success');
				var xmlDoc = xhr.responseXML;
				var fullCountSet = xmlDoc.evaluate("/response/unseen", xmlDoc, null, XPathResult.ANY_TYPE, null);
				var fullCountNode = fullCountSet.iterateNext();
				if (fullCountNode) {
					handleSuccess(fullCountNode.textContent);
					return;
				} else {
					opera.PostError('check node error');
				}
			}

			handleError();
		}

		xhr.onerror = function(error) {
			handleError();
		}

		xhr.open("GET", iuaCheckURL, true);
		xhr.send(null);
	} catch(e) {
		//console.error(chrome.i18n.getMessage("iuacheck_exception", e));
		handleError();
	}
}
function updateUnreadCount(count) {
	if (unreadCount != count) {
		unreadCount = count;
		//animateFlip();
		theButton.icon = "icons/checkerIUA_19.png";
		theButton.badge.textContent = (0 != count) ? count : '';
		theButton.badge.backgroundColor = [234,57,140,255];
	}
}

function showLoggedOut() {
	unreadCount = -1;
	theButton.icon = "icons/checkerIUA_19_logout.png";
	theButton.badge.textContent = "?";
	theButton.badge.backgroundColor = [234,57,140,255];
}

function startRequest() {
	getInboxCount(
			function(count) {
				//loadingAnimation.stop();
				updateUnreadCount(count);
				scheduleRequest();
			},
			function() {
				//loadingAnimation.stop();
				showLoggedOut();
				scheduleRequest();
			}
	);
}

function scheduleRequest() {
	if (requestTimerId) {
		window.clearTimeout(requestTimerId);
	}
	var randomness = Math.random() * 2;
	var exponent = Math.pow(2, requestFailureCount);
	var multiplier = Math.max(randomness * exponent, 1);
	var delay = Math.min(multiplier * pollIntervalMin, pollIntervalMax);
	delay = Math.round(delay);

	requestTimerId = window.setTimeout(startRequest, delay);
}