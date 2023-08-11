initDeliveryTree = function () {
    $('#delivery').jstree({
        "core": {
            "animation": 0,
            //не раскрывать дерево
            "expand_selected_onload": false,
            "check_callback": true,
            "themes": {"stripes": true},
            'data': //typeof delivery !== "undefined" ? JSON.parse(delivery) : // Read from Cookies
            // Delivery tree restore is currently disabled to 4096 byte Cookie limit
            defaultDelivery
        },
        "types": {
            "#": {
                "max_depth": 4,
                "valid_children": ["root"]
            },
            "root": {
                "icon": "fa fa-leaf",
                "valid_children": ["system"]
            },
            "system": {
                "icon": "fa fa-briefcase",
                "valid_children": ["sub"]
            },
            "sub": {
                "icon": "fa fa-wrench",
                "valid_children": ["function"]
            },
            "function": {
                "icon": "fa fa-flash",
                //"valid_children" : []
            }
        },
        'checkbox': {
            three_state: false,
            //cascade: 'down',
            //tie_selection: false
        },
        "state": {
            "key": "state_delivery"
        },
        "plugins": [
            "contextmenu", "dnd",
            "types", "wholerow", "checkbox"//, "state"
        ],
        "contextmenu": {
            "items": function () {
                return {
                    "create": {
                        //"_disabled": false, (this.check("create_node", data.reference, {}, "last")),
                        "label": "Create",
                        "action": function (data) {
                            const inst = $.jstree.reference(data.reference)
                            const obj = inst.get_node(data.reference)
                            let newType;
                            let leave = false;
                            //Choose allowable child type
                            switch (inst.get_type(obj)) {
                                case "sub":
                                    newType = "function";
                                    break;
                                case "system":
                                    newType = "sub";
                                    break;
                                //no new systems
                                //case "root": newType = "system";break;
                                default:
                                    leave = true;
                            }

                            if (!leave) {
                                inst.create_node(obj, {"type": newType}, "last", function (new_node) {
                                    try {
                                        inst.edit(new_node);
                                    } catch (ex) {
                                        setTimeout(function () {
                                            inst.edit(new_node);
                                        }, 0);
                                    }
                                });
                            }
                        }
                    },
                    "rename": {
                        "label": "Rename",
                        "shortcut": 113,
                        "shortcut_label": 'F2',
                        "action": function (data) {
                            const inst = $.jstree.reference(data.reference)
                            const obj = inst.get_node(data.reference)
                            inst.edit(obj);
                        }
                    },
                    "remove": {
                        "label": "Delete",
                        "action": function (data) {
                            const inst = $.jstree.reference(data.reference)
                            const obj = inst.get_node(data.reference)
                            inst.delete_node(obj);
                        }
                    },
                    "setup": {
                        "separator_before": true,
                        "separator_after": false,
                        "label": "Setup",
                        "action": function (data) {
                            const inst = $.jstree.reference(data.reference)
                            const obj = inst.get_node(data.reference)
                            if (obj.type === "sub") {
                                $("#dialog_encl").dialog("open");
                            } else {
                                $(".dialog").each(function () {
                                    if ($(this).dialog("option", "title") === obj.text) {
                                        $(this).dialog("open");
                                    }
                                });
                            }
                        }
                    }
                };
            }
        },

    });
};