var levelEditorComponents = [
    {
        name: "#levelEditorObject",
        sprite: "#genericObject",
        events: [
            {
                name: "#setup", code: function (event) {
                    if (this.var["#spritesheet"]) {
                        this.engine.getAnimationEngine().setSpritesheet(this.spriteholder, this.var["#spritesheet"]);
                    }
                    if (this.var["$state"]) {
                        this.var.$state = this.var["$state"];
                    }
                    this.var["#editor.moving"] = false;
                    this.var["#boundingBox"] = this.engine.getAnimationEngine().getSpriteBox(this.var["#spritesheet"] || "#genericObject");
                    this.setCollider("hitbox", this.var["#boundingBox"]);
                }
            }, {
                name: "#collide", code: function (event) {
                    if (this.engine.getObject(event.object).instanceOf("mouse") && event.shape2id == 1) {
                        this.engine.var.selectedArray.push(this);
                        this.engine.var.mouse = event.object;
                    }
                    if (this.engine.getObject(event.object).instanceOf("mouse") && event.shape2id == 0) {
                        if (this.var["#editor.moving"] == true) {
                            //this.var.$x = this.engine.getObject(event.object).var.$x - this.var["#editor.mx"];
                            //this.var.$y = this.engine.getObject(event.object).var.$y - this.var["#editor.my"];
                            //this.engine.do.showSelectBox({ type: "select", x: this.var.$x, y: this.var.$y, w: this.var["#boundingBox"].w, h: this.var["#boundingBox"].h, z: this.var.$z - 1 });
                            //this.engine.var["_#workspace"].updateMoveToolbar();
                        } else {
                            //if (this.engine.var["_#workspace"].currentTool == "delete") {
                            //    this.engine.do.showSelectBox({ type: "delete", x: this.var.$x, y: this.var.$y, w: this.var["#boundingBox"].w, h: this.var["#boundingBox"].h, z: this.var.$z + 1 });
                            //} else {
                            //    this.engine.do.showSelectBox({ type: "hover", x: this.var.$x, y: this.var.$y, w: this.var["#boundingBox"].w, h: this.var["#boundingBox"].h, z: this.var.$z - 1 });
                            //}
                        }
                    }
                }
            }],
        collision: {
            "box": [
                { "#tag": "hitbox", "x": 0, "y": 0, "w": 100, "h": 100 }
            ]
        }
    },
    {
        name: "bg",
        sprite: "bg"
    },
    {
        name: "infinityCanvas",
        events: [{
            name: "#collide", code: function (event) {
                if (this.engine.getObject(event.object).instanceOf("mouse") && event.shape2id == 1) {
                    if (this.engine.var["_#workspace"].currentTool == "new") {
                        //var type = this.engine.var["_#workspace"].currentPreset;
                        //var spritesheet = this.engine.var["_#workspace"].presetTable[type] || "objectWithNoSpritesheet";
                        //var that = this;
                        //setTimeout(function () {
                        //    var boundingBox = that.engine.getAnimationEngine().getSpriteBox(spritesheet);
                        //    that.engine.addObjectLive("something", "object", that.engine.getObject(event.object).getVar("$x"), that.engine.getObject(event.object).getVar("$y"), 0, false, false, { "#preset": type, "#spritesheet": spritesheet, "#boundingBox": boundingBox });
                        //    that.engine.var["_#workspace"].updateObjectList();
                        //}, 0);
                    }
                    if (this.engine.var["_#workspace"].currentTool == "moveCamera" && this.getVar("#editor.moving") != true) {
                        this.setVar("#editor.moving", true);
                        this.setVar("mouse", this.engine.getObject(event.object));
                        var camera = this.engine.getAnimationEngine().getCamera();
                        this.setVar("#editor.mx", camera.x + this.engine.getObject(event.object).getVar("$x"));
                        this.setVar("#editor.my", camera.y + this.engine.getObject(event.object).getVar("$y"));
                    }
                }
            }
        },
        {
            name: "#loop", code: function (event) {
                if (this.engine.var["_#workspace"].currentTool == "moveCamera" && this.getVar("#editor.moving") == true) {
                    var mouse = this.getVar("mouse");
                    this.engine.getAnimationEngine().setCamera(-mouse.getVar("$x") + this.getVar("#editor.mx"), -mouse.getVar("$y") + this.getVar("#editor.my"));
                    toolbars.setTextValue("xCamera", -mouse.getVar("$x") + this.getVar("#editor.mx"));
                    toolbars.setTextValue("yCamera", -mouse.getVar("$y") + this.getVar("#editor.my"));
                }

            }
        },
        {
            name: "mouseup", code: function (event) {
                if (this.engine.var["_#workspace"].currentTool == "moveCamera" && this.getVar("#editor.moving") == true) {
                    this.setVar("#editor.moving", false);
                }
            }
        },
        {
            name: "setCamera", code: function (event) {
                var camera = this.engine.getAnimationEngine().getCamera();
                this.engine.getAnimationEngine().setCamera(event.x || camera.x, event.y || camera.y);
            }
        }],
        collision: {
            "box": [
                { "x": 0, "y": 0, "w": 9999999, "h": 9999999 }
            ]
        }
    },
    {
        name: "selectBox",
        sprite: "selectBox",
        events: [{
            name: "showSelectBox", code: function (event) {
                switch (event.type) {
                    case "hover":
                        this.setVar("$x", event.x | 0);
                        this.setVar("$y", event.y | 0);
                        this.setVar("$w", event.w);
                        this.setVar("$h", event.h);
                        this.setVar("$state", "hover");
                        break;
                    case "delete":
                        this.setVar("$x", event.x | 0);
                        this.setVar("$y", event.y | 0);
                        this.setVar("$w", event.w);
                        this.setVar("$h", event.h);
                        this.setVar("$state", "delete");
                        break;
                    case "select":
                        this.setVar("$x", event.x | 0);
                        this.setVar("$y", event.y | 0);
                        this.setVar("$w", event.w);
                        this.setVar("$h", event.h);
                        this.setVar("$state", "select");
                        break;
                }
            }
        },
        {
            name: "refreshSelectBox", code: function (event) {
                if (event.x) {
                    this.setVar("$x", event.x);
                }
                if (event.y) {
                    this.setVar("$y", event.y);
                }
            }
        },
        {
            name: "hideSelectBox", code: function (event) {
                this.setVar("$state", "hide");
            }
        },
        {
            name: "#loop", code: function (event) {
                var selectedArray = this.engine.getEngineVar("selectedArray");
                if (selectedArray && selectedArray.length > 0) {
                    selectedArray.sort(function (a, b) {
                        return b.getVar("$z") - a.getVar("$z");
                    });
                    var that = selectedArray[0];
                    var mouse = this.engine.getEngineVar("mouse");
                    if (this.engine.var["_#workspace"].currentTool == "move" && that.getVar("#editor.moving") == false) {
                        this.engine.setEngineVar("lastObject", that);
                        this.engine.var["_#workspace"].updateProperties();
                        that.setVar("#editor.moving", true);
                        that.setVar("#editor.mx", this.engine.getObject(mouse).getVar("$x") - that.getVar("$x"));
                        that.setVar("#editor.my", this.engine.getObject(mouse).getVar("$y") - that.getVar("$y"));
                        this.engine.execute_event("showSelectBox", { type: "select", x: that.getVar("$x"), y: that.getVar("$y"), w: that.getVar("#boundingBox").w, h: that.getVar("#boundingBox").h, z: that.getVar("$z") - 1 });
                    } else {
                        that.setVar("#editor.moving", false);
                        this.engine.execute_event("hideSelectBox");
                    }
                    if (this.engine.var["_#workspace"].currentTool == "delete") {
                        this.engine.deleteObjectLive(that);
                        this.engine.var["_#workspace"].updateObjectList();
                    }
                    if (this.engine.var["_#workspace"].currentTool == "select") {
                        this.engine.var.lastObject = that;
                        this.engine.var["_#workspace"].updateProperties();
                    }

                }
                this.engine.setEngineVar("selectedArray", []);

            }
        }]
    }

];