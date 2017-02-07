var CLOCKWORKRT = CLOCKWORKRT || {};

CLOCKWORKRT.API = {};

CLOCKWORKRT.API.appPath = function () {
	return "ms-appdata:///local/installedApps/" + localStorage.currentAppName + "/" + localStorage.currentAppScope;
}

CLOCKWORKRT.API.getManifest = function () {
	return JSON.parse(localStorage.currentAppManifest);
}

CLOCKWORKRT.API.loadMenu = function () {
	//HYPERGAP.CONTROLLER.close();
	location = "menu.html";
}