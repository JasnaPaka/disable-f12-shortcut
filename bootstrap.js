/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Cc = Components.classes;
const Cu = Components.utils;
const Ci = Components.interfaces;

Components.utils.import("resource://gre/modules/Services.jsm");

function toggleF12ForWindow(aWindow, disabledValue) {
	let F12key = aWindow.document.getElementById("key_devToolboxMenuItemF12");
	if (F12key) {
		F12key.setAttribute("disabled", disabledValue);
		return;
	}

	let tryDelay = 5, tryNum = 0, tryMax = 100000;
	let timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);

	let delayCheck = function() {
		tryNum += tryDelay;
		if (tryNum >= tryMax) {
			timer = null;
			return;
		}
		timer.init(timerObserver, tryDelay, timer.TYPE_ONE_SHOT);
		if (tryDelay < 500 && (tryDelay *= 2) > 500) tryDelay = 500;
	};

	let timerObserver = {
		observe: function() {
			timer.cancel();
			F12key = aWindow.document.getElementById("key_devToolboxMenuItemF12");
			if (F12key) {
				F12key.setAttribute("disabled", disabledValue);
				timer = null;
			} else delayCheck();
		}
	};

	delayCheck();
}

function installF12Listener(start) {
	let wm = Services.wm,
		windows = wm.getEnumerator("navigator:browser");
	while (windows.hasMoreElements()) toggleF12ForWindow(windows.getNext(), start);
	wm[start ? "addListener" : "removeListener"](F12WindowListener);
}

var F12WindowListener = {
	onOpenWindow: function(aWindow) {
		let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
		domWindow.addEventListener("load", function onLoad() {
			domWindow.removeEventListener("load", onLoad, false);
			if (domWindow.document.documentElement.getAttribute("windowtype") !== "navigator:browser") return;
			toggleF12ForWindow(domWindow, true);
		}, false);
	},
	onCloseWindow: function(aWindow) {},
	onWindowTitleChange: function(aWindow, aTitle) {}
};

function startup(data, reason) {
	installF12Listener(true);
}

function shutdown(data, reason) {
	if (reason === APP_SHUTDOWN) return;
	installF12Listener(false);
}

function install(data, reason) {}

function uninstall(data, reason) {}
