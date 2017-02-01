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

function displayMenuElements(menuElements) {
    menuElements.forEach(function (element, i) {
        var elementDiv = document.createElement("div");
        elementDiv.classList.add( "mainMenuEntry");
        elementDiv.style.animationDelay = (0.1*i)+"s";
        elementDiv.innerHTML = `<img class="image" src="${element.img}" /><div class="detail">${element.name}</div>`;
        elementDiv.addEventListener("click", function () {
            CLOCKWORKRT.ui.showLoader("Cargando", element.name);
            setTimeout(function () { CLOCKWORKRT.ui.hideLoader() }, 2000);
        })
        document.getElementById("mainMenu").appendChild(elementDiv);
    });
}

window.addEventListener("load", function () {
    displayMenuElements(menuElements);
    console.log("hey",CLOCKWORKRT.apps.getInstalledApps());
})