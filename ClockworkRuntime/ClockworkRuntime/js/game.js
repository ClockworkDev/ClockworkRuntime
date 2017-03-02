var CLOCKWORKCONFIG;

(function () {
    window.onload = function () {

        Object.defineProperty(Array.prototype, 'recursiveForEach', {
            enumerable: false,
            value: function (action, index, cb) {
                var i = index || 0;
                if (i >= this.length) {
                    return cb();
                }
                var that = this;
                return action(this[i], function () { that.recursiveForEach(action, i + 1, cb); });
            }
        });

        var manifest = CLOCKWORKRT.API.getManifest();


        document.body.style["background-color"] = manifest.backgroundColor || "black";

        //List of components, only two operations are allowed: push and read
        CLOCKWORKRT.components = (function () {
            var list = [];
            return {
                push: function (x) {
                    //Array
                    if (x && x.length > 0) {
                        x.forEach(x=> list.push(x));
                    }
                    //Element
                    if (x && x.length == undefined) {
                        list.push(x);
                    }
                },
                get: function () {
                    return list;
                }
            };
        })();

        //List of components, only two operations are allowed: push and read
        CLOCKWORKRT.collisions = (function () {
            var list = [];
            return {
                push: function (x) {
                    //Array
                    if (x && x.length > 0) {
                        x.forEach(x=> list.push(x));
                    }
                    //Element
                    if (x && x.length == undefined) {
                        list.push(x);
                    }
                },
                get: function () {
                    return list;
                }
            };
        })();

        CLOCKWORKCONFIG = {
            enginefps: manifest.enginefps,
            animationfps: manifest.animationfps,
            screenbuffer_width: manifest.screenResolution ? manifest.screenResolution.w : 0,
            screenbuffer_height: manifest.screenResolution ? manifest.screenResolution.h : 0
        };

        Object.keys(manifest.dependencies).recursiveForEach(function (name, cb) {
            CLOCKWORKRT.apps.getDependency(name, manifest.dependencies[name], function (x) {
                eval(x);
                cb();
            });
        }, 0, loadComponents);

        function loadComponents() {
            //If the capability is not defined, block access to internal RT API
            if (!(manifest.capabilities && manifest.capabilities.indexOf("ClockworkRuntimeInternal") >= 0)) {
                CLOCKWORKRT.apps = undefined;
            }
            manifest.components.recursiveForEach(function (file, cb) {
                var uri = new Windows.Foundation.Uri(CLOCKWORKRT.API.appPath() + "/" + file);
                var file = Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).done(function (file) {
                    Windows.Storage.FileIO.readTextAsync(file).done(function (x) {
                        eval(x); //Dirty AF
                        cb();
                    });
                }, function (x) {
                    console.log(x);
                });

                //script.type = 'text/javascript';
                //script.src = HYPERGAP.API.appPath() + "/" + x;
                //document.body.appendChild(script);
            }, 0, readyToGo);
        }

        function readyToGo() {
            switch (manifest.renderer) {
                case "HTML":
                    document.body.removeChild(document.getElementById("canvas"));
                    var container = document.createElement("div");
                    container.classList.add("fullScreen")
                    document.body.appendChild(container);
                    setUpEngine(container, noAnimation());
                    break;
                default:
                    document.getElementById("canvas").style.width = window.innerWidth;
                    document.getElementById("canvas").style.height = window.innerHeight;
                    document.getElementById("canvas").width = window.innerWidth;
                    document.getElementById("canvas").height = window.innerHeight;
                    setUpAnimation(function (animLib) { setUpEngine(document.getElementById("canvas"), animLib); });
                    break;
            }
        }


        function setUpAnimation(callback) {
            var canvasAnimation = new Spritesheet();
            canvasAnimation.setUp(document.getElementById("canvas"), CLOCKWORKCONFIG.animationfps);
            canvasAnimation.setBufferSize(CLOCKWORKCONFIG.screenbuffer_width, CLOCKWORKCONFIG.screenbuffer_height);
            canvasAnimation.setRenderMode(function (contextinput, contextoutput) {
                contextoutput.clearRect(0, 0, contextoutput.canvas.width, contextoutput.canvas.height);
                //All the width available will be used, the aspect ratio will be the same and the image will be centered vertically
                if (contextoutput.canvas.width / contextinput.canvas.width < contextoutput.canvas.height / contextinput.canvas.height) {
                    var xpos = 0;
                    var ypos = (contextoutput.canvas.height - contextinput.canvas.height * contextoutput.canvas.width / contextinput.canvas.width) / 2;
                    var width = contextoutput.canvas.width;
                    var height = (contextinput.canvas.height * contextoutput.canvas.width / contextinput.canvas.width);
                } else {
                    var xpos = (contextoutput.canvas.width - contextinput.canvas.width * contextoutput.canvas.height / contextinput.canvas.height) / 2;
                    var ypos = 0;
                    var width = (contextinput.canvas.width * contextoutput.canvas.height / contextinput.canvas.height);
                    var height = contextoutput.canvas.height;
                }
                contextoutput.drawImage(contextinput.canvas, xpos, ypos, width, height);
            });
            canvasAnimation.setFullScreen();
            canvasAnimation.setWorkingFolder("ms-appdata:///local/installedApps/" + manifest.name + "/" + manifest.scope);
            manifest.spritesheets.recursiveForEach(function (file, cb) {
                var uri = new Windows.Foundation.Uri(CLOCKWORKRT.API.appPath() + "/" + file);
                var file = Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).done(function (file) {
                    Windows.Storage.FileIO.readTextAsync(file).done(function (x) {
                        canvasAnimation.loadSpritesheetJSONObject(JSON.parse(x));
                        cb();
                    });
                }, function (x) {
                    console.log(x);
                });
            }, 0, (function (c) { return function () { callback(c) }; })(canvasAnimation));
        }


        function setUpEngine(container, animLib) {
            var engineInstance = new Clockwork();
            CLOCKWORKCONFIG.engine = engineInstance;
            engineInstance.setAnimationEngine(animLib);
            //manifest.dependencies.collisions.map(x=> HYPERGAP.LIBRARIES.getIncludedCollisions()[x]).filter(x=>x).forEach(engineInstance.registerCollision);
            //manifest.dependencies.presets.map(x=> HYPERGAP.LIBRARIES.getIncludedPresets()[x]).filter(x=>x).forEach(engineInstance.loadPresets);
            //engineInstance.loadPresets(HYPERGAP.presets.getPresets());
            CLOCKWORKRT.collisions.get().map(engineInstance.registerCollision);
            engineInstance.loadComponents(CLOCKWORKRT.components.get());
            manifest.levels.map(x=>CLOCKWORKRT.API.appPath() + "/" + x).recursiveForEach(function (x, cb) {
                var uri = new Windows.Foundation.Uri(x);
                var file = Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).done(function (file) {
                    Windows.Storage.FileIO.readTextAsync(file).done(function (x) {
                        engineInstance.loadLevelsFromJSONobject(JSON.parse(x), cb);
                    });
                }, function (x) {
                    console.log(x);
                });
            }, 0, function () {
                if (localStorage.debugMode) {
                    var socket = io(localStorage.debugFrontend);
                    socket.on('setBreakpoints', function (data) {
                        engineInstance.setBreakpoints(data);
                    });
                    engineInstance.setBreakpointHandler(function (bp, vars) {
                        socket.emit('breakpointHit', {
                            bp: bp,
                            vars:vars
                        });
                    });
                }
                engineInstance.start(CLOCKWORKCONFIG.enginefps, container);
                //var semaphorelength = 0;
                //if (HYPERGAP.CONTROLLER.sendMessage) {
                //    if (manifest.controllerAssets) {
                //        semaphorelength = manifest.controllerAssets.spritesheets.length + manifest.controllerAssets.presets.length + manifest.controllerAssets.levels.length;
                //        manifest.controllerAssets.spritesheets.map(x=>"ms-appdata:///local/installedApps/" + manifest.name + "/" + manifest.scope + "/" + x).forEach(function (x) {
                //            loadFileText(x, function (text) {
                //                HYPERGAP.CONTROLLER.sendMessageToNewControllers("RegisterSpritesheet~" + text);
                //                semaphorelength--;
                //                evalSemaphore();
                //            });
                //        });
                //        manifest.controllerAssets.presets.map(x=>"ms-appdata:///local/installedApps/" + manifest.name + "/" + manifest.scope + "/" + x).forEach(function (x) {
                //            loadFileText(x, function (text) {
                //                HYPERGAP.CONTROLLER.sendMessageToNewControllers("RegisterPreset~" + text);
                //                semaphorelength--;
                //                evalSemaphore();
                //            });
                //        });
                //        manifest.controllerAssets.levels.map(x=>"ms-appdata:///local/installedApps/" + manifest.name + "/" + manifest.scope + "/" + x).forEach(function (x) {
                //            loadFileText(x, function (text) {
                //                HYPERGAP.CONTROLLER.sendMessageToNewControllers("RegisterLevels~" + text);
                //                semaphorelength--;
                //                evalSemaphore();
                //            });
                //        });
                //    }
                //}
                evalSemaphore();
                function evalSemaphore() {
                    //if (semaphorelength == 0) {
                    //    HYPERGAP.CONTROLLER.sendMessageToNewControllers("LoadLevel~" + (manifest.controller || "HyperGapMenu"));
                    //}
                }
            });
        }


        function loadFileText(url, callback) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    callback(xmlhttp.responseText);
                }
            };
            xmlhttp.open("GET", url, true);
            xmlhttp.send();
        }

    };
})();
