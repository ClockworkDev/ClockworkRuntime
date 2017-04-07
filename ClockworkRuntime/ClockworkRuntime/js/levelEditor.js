var toolbars;
var workspace = {};


function loadLevelEditor(engine) {
    workspace.engine = engine;
    toolbars = Toolbar(windows);
    toolbars.hideToolbar("Levels");
    toolbars.hideToolbar("Edit");
    toolbars.hideToolbar("Properties");
    toolbars.hideToolbar("Level");
    engine.var["_#workspace"] = workspace;
    //Set components list
    var options = CLOCKWORKRT.components.get().map(function (x) { return { text: x.name, value: x.name }; });

    toolbars.setSelectOptions("componentSelect", options);
    toolbars.setSelectOptions("properties.componentSelect", options);
    workspace.currentComponent = options[0].value;
}

var windows = [
    {
        name: "Tools", children: [
            {
                type: "button", text: "Editor", id: "levelEditor", enabled: true, onclick: function () {
                    toolbars.hideToolbar("Tools");
                    toolbars.showToolbar("Levels");
                    toolbars.showToolbar("Edit");
                    toolbars.showToolbar("Properties");
                    toolbars.showToolbar("Level");
                    var currentLevelObjects = workspace.engine.listObjects().map(function (object) {
                        var vars = Object.getOwnPropertyNames(object.var).filter(function (key) {
                            if (key[0] == "#") {
                                return false;
                            }
                            switch (key) {
                                case "$x":
                                case "$y":
                                case "$z":
                                case "$state":
                                    return false;
                                default:
                                    return true;
                            }
                        }).reduce(function (vars, key) {
                            vars[key] = object.var[key];
                            return vars;
                        }, {});
                        vars["#type"] = object.type;
                        vars["#spritesheet"] = object.sprite;
                        vars["#state"] = object.var.$state;
                        return { //Get the relevant ifnormation for each object and generate a JSON level
                            name: object.var["#name"],
                            type: "#levelEditorObject",
                            isstatic: object.isstatic,
                            x: object.var.$x,
                            y: object.var.$y,
                            z: object.var.$z,
                            vars: vars
                        }
                    });
                    var defaultObjects = [
                        {
                            name: "bg",
                            type: "bg",
                            x: 0,
                            y: 0,
                            z: -Infinity,
                            vars: { "#levelEditor": true }
                        },
                        {
                            name: "infinityCanvas",
                            type: "infinityCanvas",
                            x: 0,
                            y: 0,
                            z: -Infinity,
                            isstatic: true,
                            vars: { "#levelEditor": true }
                        },
                        {
                            name: "mouse",
                            type: "mouse",
                            x: 0,
                            y: 0,
                            z: 0,
                            vars: { "#levelEditor": true }
                        },
                        {
                            name: "select",
                            type: "selectBox",
                            x: 0,
                            y: 0,
                            z: 0,
                            vars: { "#levelEditor": true }
                        }];
                    var currentLevel = {
                        id: "#levelEditor", objects: defaultObjects.concat(currentLevelObjects)
                    };
                    workspace.engine.loadLevelsFromJSONobject([currentLevel]);
                    workspace.engine.loadLevelByID("#levelEditor");
                    workspace.updateObjectList();
                    hideEditAdvanced();
                }
            }
        ]
    },
    {
        name: "Levels", children: [
            { type: "label", "text": "Select level file:" },
            {
                type: "select", id: "levelFiles", options: [
                    { text: "---", value: "#---" }
                ], onchange: function (x) {
                    workspace.setLevelFile(x);
                    switch (x) {
                        case "#New":
                            toolbars.setSelectOptions("levelSelect", [{ text: "---", value: "#---" }]);
                            toolbars.showDialog({ type: "prompt", text: "Please introduce a name for the level" }, function (result) {

                            });
                            break;
                        case "#---":
                            toolbars.setSelectOptions("levelSelect", [{ text: "---", value: "#---" }]);
                            break;
                        default:
                            vscodeConnection.getLevels(x, function (levels) {
                                var options = [
                                    { text: "---", value: "#---" },
                                    { text: "Create new level", value: "#New" },
                                ];
                                levels.forEach(function (x) {
                                    options.push({ text: x, value: x });
                                })
                                toolbars.setSelectOptions("levelSelect", options);
                                levelSelectChange(options[0].value);
                            });
                            break;
                    }
                }
            },
            { type: "label", "text": "Select level:" },
            {
                type: "select", id: "levelSelect", options: [
                    { text: "---", value: "#---" }
                ], onchange: function (x) { }
            },
            {
                type: "button", text: "Save", id: "Save", enabled: false,
                onclick: function () {
                    var objects = workspace.engine.listObjects().map(function (x) {
                        return workspace.engine.find(x);
                    }).filter(function (x) {
                        return x.getVar("#levelEditor") != true;
                    }).map(function (x) {
                        var vars = {};
                        var keys = x.getVarKeys();
                        keys.forEach(function (k) {
                            // if(k[0]=="#"){return;}
                            vars[k] = x.getVar(k);
                        });
                        // return "<object name='"+x.getVar("#name")+"' type='"+x.getVar("#preset")+"' x='"+x.getVar("$x")+"' y='"+x.getVar("$y")+"' z='"+(x.getVar("$z")||0)+"' vars='"+JSON.stringify(vars)+"'></object>";
                        return vars;
                    });
                    vscodeConnection.saveLevel(workspace.getLevelFile(), workspace.getLevel(), JSON.stringify(objects), function () {

                    });
                }
            },
            { type: "button", text: "Undo", id: "Undo", enabled: false },
            { type: "button", text: "Redo", id: "Redo", enabled: false },
            {
                type: "button", text: "Exit", id: "Exit", enabled: true, onclick: function () {
                    toolbars.showToolbar("Tools");
                    toolbars.hideToolbar("Levels");
                    toolbars.hideToolbar("Edit");
                    toolbars.hideToolbar("Properties");
                    toolbars.hideToolbar("Level");
                }
            }
        ]
    },
    {
        name: "Edit", children: [
            {
                type: "button", text: "Select", id: "Select", enabled: false, onclick: function () {
                    workspace.currentTool = "select";
                    hideEditAdvanced();
                }
            },
            {
                type: "button", text: "New", id: "New", enabled: false, onclick: function () {
                    workspace.currentTool = "new";
                    hideEditAdvanced()
                    toolbars.showSelect("componentSelect");
                    toolbars.showLine("editLine");
                }
            },
            { type: "button", text: "Copy", id: "Copy", enabled: false },
            {
                type: "button", text: "Delete", id: "Delete", enabled: false, onclick: function () {
                    workspace.currentTool = "delete";
                    hideEditAdvanced()
                }
            },
            {
                type: "button", text: "Move", id: "Move", enabled: false, onclick: function () {
                    workspace.currentTool = "move";
                    hideEditAdvanced();
                    toolbars.showLine("editLine");
                    toolbars.showText("xObj");
                    toolbars.showText("yObj");
                    workspace.updateMoveToolbar();
                }
            },
            {
                type: "button", text: "Move view", id: "CameraMove", enabled: false, onclick: function () {
                    workspace.currentTool = "moveCamera";
                    hideEditAdvanced();
                    toolbars.showLine("editLine");
                    toolbars.showText("xCamera");
                    toolbars.showText("yCamera");
                }
            },
            { type: "line", id: "editLine" },
            {
                type: "select", id: "componentSelect", options: [
                    { text: "---", value: "#---" }
                ], onchange: function (value) {
                    workspace.currentPreset = value;
                }
            },
            {
                type: "text", id: "xObj", tag: "X coordinate", onchange: function (value) {
                    var object = workspace.engine.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("$x", value);
                        workspace.engine.execute_event("refreshSelectBox", { x: value });
                    }
                }
            },
            {
                type: "text", id: "yObj", tag: "Y coordinate", onchange: function (value) {
                    var object = workspace.engine.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("$y", value);
                        workspace.engine.execute_event("refreshSelectBox", { y: value });
                    }
                }
            },
            {
                type: "text", id: "xCamera", tag: "X coordinate", onchange: function (value) {
                    workspace.engine.execute_event("setCamera", { x: value });
                }
            },
            {
                type: "text", id: "yCamera", tag: "Y coordinate", onchange: function (value) {
                    workspace.engine.execute_event("setCamera", { y: value });
                }
            }
        ]
    },
    {
        name: "Properties", children: [
            {
                type: "text", id: "properties.name", tag: "Name", onchange: function (value) {
                    var object = workspace.engine.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("#name", value);
                        workspace.updateObjectList();
                    }
                }
            },
            { type: "label", "text": "Type:" },
            {
                type: "select", id: "properties.componentSelect", options: [
                    { text: "---", value: "#---" }
                ], onchange: function (value) {
                    var object = workspace.engine.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("#preset", value);
                        object.setVar("#spritesheet", workspace.presetTable[value]);
                        object.execute_event("#setup");
                    }
                }
            },
            {
                type: "text", id: "properties.xObj", tag: "X coordinate", onchange: function (value) {
                    var object = workspace.engine.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("$x", value);
                        workspace.engine.execute_event("refreshSelectBox", { x: value });
                    }
                }
            },
            {
                type: "text", id: "properties.yObj", tag: "Y coordinate", onchange: function (value) {
                    var object = workspace.engine.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("$y", value);
                        workspace.engine.execute_event("refreshSelectBox", { y: value });
                    }
                }
            },
            {
                type: "text", id: "properties.zObj", tag: "Z coordinate", onchange: function (value) {
                    var object = workspace.engine.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("$z", value);
                    }
                }
            },
            {
                type: "map", id: "properties.map", onchange: function (key, value, oldkey) {
                    var object = workspace.engine.getEngineVar("lastObject");
                    if (object) {
                        object.setVar(oldkey, undefined);
                        object.setVar(key, value);
                    }
                }
            }
        ]
    },
    {
        name: "Level", children: [
            { type: "label", "text": "Objects:" },
            {
                type: "select", id: "level.objects", options: [
                ], onchange: function (value) {
                    workspace.engine.setEngineVar("lastObject", workspace.engine.find(value));
                    workspace.updateProperties();
                    workspace.updateMoveToolbar();
                }
            }
        ]
    }
];

workspace.updateMoveToolbar = function () {
    var object = workspace.engine.getEngineVar("lastObject");
    if (object) {
        toolbars.setTextValue("xObj", object.getVar("$x"));
        toolbars.setTextValue("yObj", object.getVar("$y"));
    }
}



workspace.updateProperties = function () {
    var object = workspace.engine.getEngineVar("lastObject");
    if (object) {
        toolbars.setTextValue("properties.xObj", object.getVar("$x"));
        toolbars.setTextValue("properties.yObj", object.getVar("$y"));
        toolbars.setTextValue("properties.zObj", object.getVar("$z"));
        toolbars.setTextValue("properties.name", object.getVar("#name"));
        toolbars.setSelectValue("properties.componentSelect", object.getVar("#type"));
        var keys = object.getVarKeys();
        toolbars.clearMap("properties.map");
        keys.filter(function (k) {
            return !(k[0] == "#") && k != "$x" && k != "$y" && k != "$z";
        }).forEach(function (k) {
            var value = object.getVar(k);
            toolbars.addMapEntry("properties.map", function (key, value, oldkey) {
                var object = workspace.engine.getEngineVar("lastObject");
                if (object) {
                    object.setVar(oldkey, undefined);
                    object.setVar(key, value);
                }
            }, k, value);
        });
    }
}



workspace.updateObjectList = function () {
    var options = workspace.engine.listObjects().filter(function (x) {
        return x.var["#levelEditor"] != true;
    }).map(function (x) {
        return { text: x.var["#name"], value: x.var["#name"] };
    })
    toolbars.setSelectOptions("level.objects", options);
    toolbars.setSelectSize("level.objects", options.length);
}

function hideEditAdvanced() {
    toolbars.hideSelect("componentSelect");
    toolbars.hideLine("editLine");
    toolbars.hideText("xCamera");
    toolbars.hideText("yCamera");
    toolbars.hideText("xObj");
    toolbars.hideText("yObj");
}