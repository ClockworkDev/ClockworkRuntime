//These are functions used my multiplatform runtime code that depend on platform-specific APIs


function loadTextFile(url, callback) {
    var uri = new Windows.Foundation.Uri(url);
    var file = Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).done(function (file) {
        Windows.Storage.FileIO.readTextAsync(file).done(function (x) {
            callback(x);
        });
    }, function (x) {
        console.log(x);
    });
}

function getIPaddress() {
    var icp = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();

    if (!icp || !icp.networkAdapter) {
        return "No IP detected";
    }

    var hostNames = Windows.Networking.Connectivity.NetworkInformation.getHostNames().filter(function (hn) {
        return hn.ipInformation&& hn.ipInformation.networkAdapter && hn.ipInformation.networkAdapter.networkAdapterId == icp.networkAdapter.networkAdapterId;
    });
    if (hostNames.length == 0) {
        return "No IP detected";
    }

    return hostNames[0].canonicalName;
}

