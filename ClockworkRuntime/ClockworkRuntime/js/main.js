// Your code here!
Windows.UI.WebUI.WebUIApplication.addEventListener('activated', function (args) {
    if (args.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
        switch (args.uri.path) {
            case "/deployPackage":
                CLOCKWORKRT.apps.installAppFromURL("http://" + args.uri.host + ":" + args.uri.port+"/deployPackage", function () {
                    location = "menu.html";
                });
                break;
            case "/debug":
                var appName = args.uri.queryParsed.filter(x=>x.name == "app")[0].value;
                var levelEditorEnabled = args.uri.queryParsed.filter(x => x.name == "levelEditor")[0].value;
                console.log(args.uri.absoluteCanonicalUri);
                CLOCKWORKRT.apps.debugApp(appName, "http://" + args.uri.host + ":" + args.uri.port, levelEditorEnabled);
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