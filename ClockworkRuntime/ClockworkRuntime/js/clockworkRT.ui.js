var CLOCKWORKRT = CLOCKWORKRT || {};

CLOCKWORKRT.ui = {};

CLOCKWORKRT.ui.showLoader = function (msg, progress) {
    if (!document.getElementById("clockworkLoader")) {
        var elementDiv = document.createElement("div");
        elementDiv.id = "clockworkLoader";
        elementDiv.innerHTML = `<div id="loadingMessage"></div><div id="loadingProgress"></div>`;
        document.body.appendChild(elementDiv);
    }
    document.getElementById("clockworkLoader").style.display = "block";
    document.getElementById("loadingMessage").innerHTML = msg;
    document.getElementById("loadingProgress").innerHTML = progress;
}

CLOCKWORKRT.ui.hideLoader = function () {
    if (document.getElementById("clockworkLoader")) {
        document.getElementById("clockworkLoader").style.display = "none";
    }
}