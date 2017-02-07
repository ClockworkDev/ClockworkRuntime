var menuElements = [{
    name: "App 1",
    img: "https://github.com/arcadiogarcia/Hypergap/raw/master/Sample%20games/HelloWorld/gameFiles/tileIcon.png"
}, {
    name: "App 2",
    img: "https://github.com/arcadiogarcia/Hypergap/raw/master/Sample%20games/HelloWorld/gameFiles/tileIcon.png"
}, {
    name: "App 3",
    img: "https://github.com/arcadiogarcia/Hypergap/raw/master/Sample%20games/HelloWorld/gameFiles/tileIcon.png"
}, {
    name: "App 4",
    img: "https://github.com/arcadiogarcia/Hypergap/raw/master/Sample%20games/HelloWorld/gameFiles/tileIcon.png"
}, {
    name: "App 5",
    img: "https://github.com/arcadiogarcia/Hypergap/raw/master/Sample%20games/HelloWorld/gameFiles/tileIcon.png"
}, {
    name: "App 6",
    img: "https://github.com/arcadiogarcia/Hypergap/raw/master/Sample%20games/HelloWorld/gameFiles/tileIcon.png"
}
];
var menuElements = CLOCKWORKRT.apps.getInstalledApps().map(function (x) { return { name: x.name, text: "Installed app", img: "ms-appdata:///local/installedApps/" + x.name + "/" + x.scope + "/" + x.tileIcon, color: x.themeColor, action: function () { CLOCKWORKRT.apps.launchApp(x.name); } } });

function displayMenuElements(menuElements) {
    menuElements.forEach(function (element, i) {
        var elementDiv = document.createElement("div");
        elementDiv.classList.add( "mainMenuEntry");
        elementDiv.style.animationDelay = (0.1 * i) + "s";
        elementDiv.style.backgroundColor = element.color;
        elementDiv.innerHTML = `<img class="image" src="${element.img}" /><div class="detail">${element.name}</div>`;
        elementDiv.addEventListener("click", element.action)
        document.getElementById("mainMenu").appendChild(elementDiv);
    });
}

window.addEventListener("load", function () {
    displayMenuElements(menuElements);
    console.log("hey",CLOCKWORKRT.apps.getInstalledApps());
})