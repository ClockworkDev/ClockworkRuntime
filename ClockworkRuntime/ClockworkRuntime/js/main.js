// Your code here!
Windows.UI.WebUI.WebUIApplication.addEventListener('activated', function (args) {
    if (args.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
        switch (args.uri.path) {
            case "/deployPackage":
                CLOCKWORKRT.apps.installAppFromURL("http://" + args.uri.host + ":" + args.uri.port+"/deployPackage", function () {
                    location = "menu.html";
                });
                break;
            default:
                //Command not found
                break;
        }
        localStorage.last = args.uri.host+ "  - "+args.uri.path;
    } else {
        location = "menu.html";
    }
});