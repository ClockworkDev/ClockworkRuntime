var toolbars;

function loadLevelEditor() {
    toolbars = Toolbar(windows);
    toolbars.hideToolbar("Levels");
    toolbars.hideToolbar("Edit");
    toolbars.hideToolbar("Properties");
    toolbars.hideToolbar("Level");
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
                    var objects = engineInstance.listObjects().map(function (x) {
                        return engineInstance.find(x);
                    }).filter(function (x) {
                        return x.getVar("#hypergapEditor") != true;
                    }).map(function (x) {
                        var vars = {};
                        var keys = x.getVarKeys();
                        keys.forEach(function (k) {
                            // if(k[0]=="#"){return;}
                            vars[k] = x.getVar(k);
                        });
                        // return "<object name='"+x.getVar("#name")+"' type='"+x.getVar("#preset")+"' x='"+x.getVar("#x")+"' y='"+x.getVar("#y")+"' z='"+(x.getVar("#z")||0)+"' vars='"+JSON.stringify(vars)+"'></object>";
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
                } }
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
                    toolbars.showSelect("presetSelect");
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
                type: "select", id: "presetSelect", options: [
                    { text: "---", value: "#---" }
                ], onchange: function (value) {
                    workspace.currentPreset = value;
                }
            },
            {
                type: "text", id: "xObj", tag: "X coordinate", onchange: function (value) {
                    var object = engineInstance.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("#x", value);
                        engineInstance.execute_event("refreshSelectBox", { x: value });
                    }
                }
            },
            {
                type: "text", id: "yObj", tag: "Y coordinate", onchange: function (value) {
                    var object = engineInstance.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("#y", value);
                        engineInstance.execute_event("refreshSelectBox", { y: value });
                    }
                }
            },
            {
                type: "text", id: "xCamera", tag: "X coordinate", onchange: function (value) {
                    engineInstance.execute_event("setCamera", { x: value });
                }
            },
            {
                type: "text", id: "yCamera", tag: "Y coordinate", onchange: function (value) {
                    engineInstance.execute_event("setCamera", { y: value });
                }
            }
        ]
    },
    {
        name: "Properties", children: [
            {
                type: "text", id: "properties.name", tag: "Name", onchange: function (value) {
                    var object = engineInstance.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("#name", value);
                        workspace.updateObjectList();
                    }
                }
            },
            { type: "label", "text": "Type:" },
            {
                type: "select", id: "properties.presetSelect", options: [
                    { text: "---", value: "#---" }
                ], onchange: function (value) {
                    var object = engineInstance.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("#preset", value);
                        object.setVar("#spritesheet", workspace.presetTable[value]);
                        object.execute_event("#setup");
                    }
                }
            },
            {
                type: "text", id: "properties.xObj", tag: "X coordinate", onchange: function (value) {
                    var object = engineInstance.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("#x", value);
                        engineInstance.execute_event("refreshSelectBox", { x: value });
                    }
                }
            },
            {
                type: "text", id: "properties.yObj", tag: "Y coordinate", onchange: function (value) {
                    var object = engineInstance.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("#y", value);
                        engineInstance.execute_event("refreshSelectBox", { y: value });
                    }
                }
            },
            {
                type: "text", id: "properties.zObj", tag: "Z coordinate", onchange: function (value) {
                    var object = engineInstance.getEngineVar("lastObject");
                    if (object) {
                        object.setVar("#z", value);
                    }
                }
            },
            {
                type: "map", id: "properties.map", onchange: function (key, value, oldkey) {
                    var object = engineInstance.getEngineVar("lastObject");
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
                    engineInstance.setEngineVar("lastObject", engineInstance.find(value));
                    workspace.updateProperties();
                    workspace.updateMoveToolbar();
                }
            }
        ]
    }
];

