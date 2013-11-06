/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Cc = Components.classes;
const Cu = Components.utils;
const Ci = Components.interfaces;

Components.utils.import("resource://gre/modules/Services.jsm");

function jpToggleF12ForWindow(window, disabledValue) {
	let F12key = window.document.getElementById("key_devToolboxMenuItemF12");
	F12key.setAttribute("disabled", disabledValue);
}

var jpF12WindowListener = {
	onOpenWindow: function(aWindow) {
	
		let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).
			getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
  
	  domWindow.addEventListener("load", function onLoad() {
      domWindow.removeEventListener("load", onLoad, false);
      jpToggleF12ForWindow(domWindow, true);	
    }, false);	
	},
 
	onCloseWindow: function(aWindow) {},
	onWindowTitleChange: function(aWindow, aTitle) {}
};

function startup(data, reason) {
	let wm = Services.wm;
	let windows = wm.getEnumerator("navigator:browser");
	
	while (windows.hasMoreElements()) {
		let window = windows.getNext();
		jpToggleF12ForWindow(window, true);
	}
	
	wm.addListener(jpF12WindowListener);
}

function shutdown(data, reason) {
	let wm = Services.wm;
	let windows = wm.getEnumerator("navigator:browser");
	
	while (windows.hasMoreElements()) {
		let window = windows.getNext();
		jpToggleF12ForWindow(window, false);
	}
	
	wm.removeListener(jpF12WindowListener);
}

function install(data, reason) {}

function uninstall(data, reason) {}