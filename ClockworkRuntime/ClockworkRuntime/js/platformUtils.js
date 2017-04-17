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