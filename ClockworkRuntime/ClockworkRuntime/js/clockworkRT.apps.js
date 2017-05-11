var CLOCKWORKRT = CLOCKWORKRT || {};

CLOCKWORKRT.apps = {};


zip.workerScriptsPath = "/js/";

CLOCKWORKRT.apps.installAppFromLocalFile = function (callback) {
    CLOCKWORKRT.ui.showLoader("Select a .cw file","");
    // Create the picker object and set options
    var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
    openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.list;
    openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
    // Users expect to have a filtered view of their folders depending on the scenario.
    // For example, when choosing a documents folder, restrict the filetypes to documents for your application.
    openPicker.fileTypeFilter.replaceAll([".cw"]);


    openPicker.pickSingleFileAsync().then(function (file) {
        if (file) {
            return file.openAsync(Windows.Storage.FileAccessMode.read);
        }
    }).done(function (fileBuf) {
        if (fileBuf) {
            var blob = MSApp.createBlobFromRandomAccessStream('application/zip', fileBuf);
            CLOCKWORKRT.apps.installAppFromBlob(blob, callback);
        } else {
            callback();
        }
    });
};


CLOCKWORKRT.apps.installAppFromURL = function (url, callback) {
    CLOCKWORKRT.ui.showLoader("Downloading the game package", "");
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            CLOCKWORKRT.apps.installAppFromBlob(this.response, callback);
        }
    }
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
};

CLOCKWORKRT.apps.installAppFromBlob = function (blob,callback) {
        zip.createReader(new zip.BlobReader(blob), function (reader) {

            // get all entries from the zip
            reader.getEntries(function (entries) {
                if (entries.length) {
                    //var contents = {};
                    //entries.forEach(function (x) {
                    //    x.getData(new zip.TextWriter(), function (text) {
                    //        contents[x.filename] = text;
                    //    })
                    //});

                    var nentries = entries.length;

                    function copyAppFiles(appname) {
                        var currentfile = 1;
                        entries.recursiveForEach(function (file, cb) {
                            CLOCKWORKRT.ui.showLoader("Copying game files", currentfile+"/"+nentries);
                            var localFolder = Windows.Storage.ApplicationData.current.localFolder;
                            var path = "installedApps/" + appname + "/" + file.filename;
                            var pathFolders = path.split("/");
                            var filename = pathFolders.pop();

                            navigatePath(localFolder, pathFolders, function (folder) {
                                if (file.directory) {
                                    currentfile++;
                                    if (currentfile > nentries) {
                                        CLOCKWORKRT.ui.hideLoader();
                                        callback();
                                    } else {
                                        cb();
                                    }
                                    return;
                                }
                                console.log("creating " + filename);
                                file.getData(new zip.BlobWriter(), function (blob) {
                                    folder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                                        // Open the returned file in order to copy the data 
                                        file.openAsync(Windows.Storage.FileAccessMode.readWrite).then(function (output) {

                                            // Get the IInputStream stream from the blob object 
                                            var input = blob.msDetachStream();

                                            // Copy the stream from the blob to the File stream 
                                            Windows.Storage.Streams.RandomAccessStream.copyAsync(input, output).then(function () {
                                                output.flushAsync().done(function () {
                                                    input.close();
                                                    output.close();
                                                    currentfile++;
                                                    if (currentfile > nentries) {
                                                        CLOCKWORKRT.ui.hideLoader();
                                                        callback();
                                                    } else {
                                                        cb();
                                                    }
                                                });
                                            });
                                        });
                                    });
                                });
                            });

                            
                        });
                    }

                    var manifest = entries.filter(function (x) { return x.filename == "manifest.json" });
                    if (manifest.length == 0) {
                        //TODO: ERROR, NO MANIFEST
                    }
                    manifest = manifest[0];
                    manifest.getData(new zip.TextWriter(), function (text) {
                        // text contains the entry data as a String
                        var manifestData = JSON.parse(text);
                        console.log(manifestData);
                        Promise.all(Object.keys(manifestData.dependencies).map(function (n,i) {
                            return new Promise(function (resolve, fail) {
                                CLOCKWORKRT.ui.showLoader("Downloading dependencies", i + "/" + Object.keys(manifestData.dependencies).length);
                                CLOCKWORKRT.apps.installDependency(n, manifestData.dependencies[n], resolve);
                            })
                        })).then(function () {
                            CLOCKWORKRT.apps.addInstalledApp(manifestData);
                            setTimeout(function () { copyAppFiles(manifestData.name); }, 100);
                        });
                        // close the zip reader
                        //reader.close(function () {
                        //    // onclose callback
                        //});

                    }, function (current, total) {
                        console.log(current,total);
                    });
                }
            });
        }, function (error) {
            // onerror callback
        });
}

CLOCKWORKRT.apps.getInstalledApps = function () {
    return JSON.parse(localStorage.installedApps || "[]");
}

CLOCKWORKRT.apps.addInstalledApp = function (app) {
    var apps = CLOCKWORKRT.apps.getInstalledApps();
    apps = apps.filter(function (x) { return x.name != app.name });
    apps.push(app);
    localStorage.installedApps = JSON.stringify(apps);
}

CLOCKWORKRT.apps.launchApp = function (name) {
    var manifest=CLOCKWORKRT.apps.getInstalledApps().filter(x=>x.name == name)[0];
    localStorage.currentAppName=manifest.name;
    localStorage.currentAppScope = manifest.scope;
    localStorage.currentAppManifest = JSON.stringify(manifest);
    localStorage.debugMode = false;
    window.location = "game.html";
}

CLOCKWORKRT.apps.debugApp = function (name, debugFrontend,levelEditor) {
    var manifest = CLOCKWORKRT.apps.getInstalledApps().filter(x=>x.name == name)[0];
    localStorage.currentAppName = manifest.name;
    localStorage.currentAppScope = manifest.scope;
    localStorage.currentAppManifest = JSON.stringify(manifest);
    localStorage.debugMode = true;
    localStorage.debugFrontend = debugFrontend;
    localStorage.levelEditor = levelEditor;
    window.location = "game.html";
}

CLOCKWORKRT.apps.reset = function (name) {
    localStorage.clear();
    var localFolder = Windows.Storage.ApplicationData.current.localFolder.getFoldersAsync().done(function (folders) {
        folders.forEach(function (f) {
            f.deleteAsync();
        });
    });
    CLOCKWORKRT.API.loadMenu();

    function emptyFolder(f) {
        Windows.Storage.ApplicationData.current.localFolder.getFoldersAsync().done(function (folders) {
            folders.forEach(function (f) {
                emptyFolder(f);
                f.deleteAsync()
            });
        });
        Windows.Storage.ApplicationData.current.localFolder.getFilesAsync().done(function (folders) {
            folders.forEach(function (f) {
                f.deleteAsync();
            });
        });
    }
}


CLOCKWORKRT.apps.installDependency = function (name, version, callback) {
    var uri = new Windows.Foundation.Uri(`ms-appdata:///local/installedDependencies/${name}/${version}.js`);
    var file = Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).done(function (file) {
        console.log(name + " is already installed");
        callback();
    }, function (x) {
        var localFolder = Windows.Storage.ApplicationData.current.localFolder;
        var path = `installedDependencies/${name}/${version}.js`
        var pathFolders = path.split("/");
        var filename = pathFolders.pop();
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                var packageContent = this.responseText;
                if (packageContent == "") {
                    CLOCKWORKRT.apps.installDependency(name, version, callback);
                } else {
                    navigatePath(localFolder, pathFolders, function (folder) {
                        folder.createFileAsync(filename, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
                            Windows.Storage.FileIO.writeTextAsync(file, packageContent).then(callback);
                        });
                    });
                }
            }
        };
        request.open('GET', `http://cwpm.azurewebsites.net/api/packages/${name}/${version}`, true);
        request.send();
    });
}

CLOCKWORKRT.apps.getDependency = function (name, version, callback) {
    var uri = new Windows.Foundation.Uri(`ms-appdata:///local/installedDependencies/${name}/${version}.js`);
    var file = Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).done(function (file) {
        Windows.Storage.FileIO.readTextAsync(file).done(function (x) {
            callback(x);
        });
    }, function (x) {
        console.log(x);
    });
}

Array.prototype.recursiveForEach = function (action, index) {
    var i = index || 0;
    if (i >= this.length) {
        return;
    }
    var that = this;
    action(this[i], function () { that.recursiveForEach(action, i + 1); });
}

//File system helper functions

function navigatePath(startFolder, path, callback) {
    if (path.length > 0) {
        var newName = path.shift();
        console.log("trying to navigate to " + newName);
        startFolder.createFolderQuery().getFoldersAsync().done(function (f) {
            var r = f.filter(function (x) { return x.name == newName; });
            if (r.length > 0) {
                console.log("navigated to" + newName);
                navigatePath(r[0], path, callback);
            } else {
                console.log("trying to create" + newName);
                startFolder.createFolderAsync(newName).done(
                    function (f) {
                        console.log("created" + newName);
                        navigatePath(f, path, callback)
                    }
                    );
            }
        });
    } else {
        callback(startFolder);
    }
}