var menuElements = CLOCKWORKRT.apps.getInstalledApps().map(function (x) { return { name: x.name, text: "Installed app", img: "ms-appdata:///local/installedApps/" + x.name + "/" + x.scope + "/" + x.tileIcon, color: x.themeColor, action: function () { CLOCKWORKRT.apps.launchApp(x.name); } } });

function displayMenuElements(menuElements) {
    if (menuElements.length > 0) {
        menuElements.forEach(function (element, i) {
            var elementDiv = document.createElement("div");
            elementDiv.classList.add("mainMenuEntry");
            elementDiv.style.animationDelay = (0.1 * i) + "s";
            elementDiv.style.backgroundColor = element.color;
            elementDiv.style.borderColor = element.color;
            elementDiv.innerHTML = `<img class="image" src="${element.img}" /><div class="detail">${element.name}</div>`;
            elementDiv.addEventListener("click", element.action)
            document.getElementById("mainMenu").appendChild(elementDiv);
        });
    } else {
        document.getElementById("mainMenu").innerHTML = '<h1 style="color:white;">No games have been deployed yet</h1>';
    }
}

window.addEventListener("load", function () {
    displayMenuElements(menuElements);
    document.getElementById("installSettings").addEventListener("click", function () {
        CLOCKWORKRT.apps.installAppFromURL('https://github.com/ClockworkDev/ClockworkRuntimeCoreApps/blob/master/Settings/Settings.cw?raw=true', CLOCKWORKRT.API.loadMenu);
    });
    document.getElementById("ipAddress").innerHTML = getIPaddress();
})



var datagramSocket = new Windows.Networking.Sockets.DatagramSocket();
datagramSocket.control.outboundUnicastHopLimit = 10;

datagramSocket.onmessagereceived = function (e) {
    var reader = e.getDataReader()
    var rawString = reader.readString(reader.unconsumedBufferLength);
    var commands = rawString.split("/");
    switch (commands[0]) {
        case "deployPackage":
            CLOCKWORKRT.apps.installAppFromURL("http://" + e.remoteAddress.canonicalName + ":" + commands[1] + "/deployPackage", function () {
                location = "menu.html";
            });
            break;
    }
};


var connectionProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
if (connectionProfile) {
    datagramSocket.bindServiceNameAsync("8775", connectionProfile.networkAdapter).done(function () {
        datagramSocket.joinMulticastGroup(new Windows.Networking.HostName("224.0.0.1"));
    }, function (e) {
        console.log(JSON.stringify(e));
    }, function (e) {
        console.log(JSON.stringify(e));
    });
}