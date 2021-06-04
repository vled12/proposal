initDeliveryTree = function () {
    $('#delivery').jstree({
        "core": {
            "animation": 0,
            //не раскрывать дерево
            "expand_selected_onload": false,
            "check_callback": true,
            "themes": {"stripes": true},
            'data': //typeof delivery !== "undefined" ? JSON.parse(delivery) : //read from Cookies (disabled of the size)
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
                            $(".dialog").each(function () {
                                if ($(this).dialog("option", "title") === obj.text) {
                                    $(this).dialog("open");
                                }
                            });
                        }
                    }
                };
            }
        },

    });
};


const defaultDelivery =
    [
        {"id": "root", "text": "Поставка", "parent": "#", "type": "root", "state": {"selected": true, "opened": false}},


        {"id": "ga", "text": "[4] САУ ГА", "parent": "root", "type": "system", "state": {"selected": true}},
        {"id": "os", "text": "ОС", "parent": "root", "type": "system", "state": {"selected": true}},
        {"id": "gts", "text": "ГТС", "parent": "root", "type": "system", "state": {"selected": true}},
        {"id": "vu", "text": "ВУ", "parent": "root", "type": "system", "state": {"selected": true}},
        {"id": "aux", "text": "Доп.", "parent": "root", "type": "system", "state": {"selected": true}},
        {"id": "hydraulics", "text": "Гидромеханика", "parent": "root", "type": "system", "state": {"selected": true}},

        {
            "id": "j1_5", "text": "ПТК ТА-ТИСУ-ВО Шкаф ТА", "parent": "ga", "type": "sub", "state": {"selected": true}
        }, {
        "id": "j1_20", "text": "СИГН", "parent": "j1_5", "type": "function", "state": {"selected": true}
    }, {
        "id": "j1_6", "text": "ТА", "parent": "j1_5", "type": "function", "state": {"selected": true}
    }, {
        "id": "j1_7", "text": "ПТК ТА-ТИСУ-ВО Шкаф УСО", "parent": "ga", "type": "sub", "state": {"selected": true}
    }, {
        "id": "j1_8", "text": "ИЗМ", "parent": "j1_7", "type": "function", "state": {"selected": true}
    }, {
        "id": "j1_9", "text": "ТК", "parent": "j1_7", "type": "function", "state": {"selected": true}
    }, {
        "id": "j1_10",
        "text": "ПТК ТА-ТИСУ-ВО Шкаф УСО ТИСУ",
        "parent": "ga",
        "type": "sub",
        "state": {"selected": true}
    }, {
        "id": "j1_29", "text": "ТК", "parent": "j1_10", "type": "function", "state": {"selected": true}
    }, {
        "id": "j1_17", "text": "ПТК Енисей ВК", "parent": "ga", "type": "sub", "state": {"selected": true}
    }, {
        "id": "j1_18", "text": "ВК", "parent": "j1_17", "type": "function", "state": {"selected": true}
    }, {
        "id": "j1_26", "text": "Шкаф защиты ошиновки", "parent": "ga", "type": "sub", "state": {"selected": true}
    }, {
        "id": "j1_27", "text": "ШЗО", "parent": "j1_26", "type": "function", "state": {"selected": true}
    }, {
        "id": "j1_25", "text": "Шкаф защиты трансформатора", "parent": "ga", "type": "sub", "state": {"selected": true}
    }, {
        "id": "j1_28", "text": "ШЗТ", "parent": "j1_25", "type": "function", "state": {"selected": true}
    }, {
        "id": "j1_21", "text": "Шкаф защиты генератора", "parent": "ga", "type": "sub", "state": {"selected": true}
    }, {
        "id": "j1_24", "text": "ШЗГ", "parent": "j1_21", "type": "function", "state": {"selected": true}
    }, {
        "id": "j1_2", "text": "ПТК ЭГР-МНУ Шкаф ЭГР-МНУ", "parent": "ga", "type": "sub", "state": {"selected": true}
    }, {
        "id": "j1_3", "text": "ЭГР", "parent": "j1_2", "type": "function", "state": {"selected": true}
    }, {
        "id": "j1_4", "text": "МНУ", "parent": "j1_2", "type": "function", "state": {"selected": true}
    }, {
        "id": "j1_12", "text": "ШИС", "parent": "ga", "type": "sub", "state": {"selected": true}
    }, {
        "id": "j1_16", "text": "ЭИ", "parent": "j1_12", "type": "function", "state": {"selected": true}
    }, {
        "id": "j1_13", "text": "ЭС", "parent": "j1_12", "type": "function", "state": {"selected": true}
    },

    {
        "id": "gts_1", "text": "ПТК ГТС", "parent": "gts", "type": "sub", "state": {"selected": true}
    }, {
        "id": "gts_2", "text": "АРЗ", "parent": "gts_1", "type": "function", "state": {"selected": true}
    }, {
        "id": "gts_3", "text": "ПЗ", "parent": "gts_1", "type": "function", "state": {"selected": true}
    }, {
        "id": "gts_4", "text": "ВОДОСБРОС", "parent": "gts_1", "type": "function", "state": {"selected": true}
    }, {
        "id": "gts_5", "text": "ИЗМ_СУР", "parent": "gts_1", "type": "function", "state": {"selected": true}
    }, {
        "id": "gts_6", "text": "ИЗМ_УР", "parent": "gts_1", "type": "function", "state": {"selected": true}
    },

        {
            "id": "j2_1", "text": "ПТК БД", "parent": "vu", "type": "sub", "state": {"selected": true}
        }, {
        "id": "j2_2", "text": "БД", "parent": "j2_1", "type": "function", "state": {"selected": true}
    }, {
        "id": "j2_3", "text": "КО", "parent": "j2_1", "type": "function", "state": {"selected": true}
    },

        {
            "id": "j2_4",
            "text": "АРМ оперативного персонала",
            "parent": "vu",
            "type": "sub"
            , "state": {"selected": true}
        }, {
        "id": "j2_5", "text": "АРМ", "parent": "j2_4", "type": "function", "state": {"selected": true}
    },
        {
            "id": "j2_6", "text": "АРМ ремонтного персонала", "parent": "vu", "type": "sub", "state": {"selected": true}
        }, {
        "id": "j2_7", "text": "АРМ", "parent": "j2_6", "type": "function", "state": {"selected": true}
    },
        {
            "id": "j2_8",
            "text": "АРМ административного персонала",
            "parent": "vu",
            "type": "sub", "state": {"selected": true}
        }, {
        "id": "j2_9", "text": "АРМ", "parent": "j2_8", "type": "function", "state": {"selected": true}
    },
        {
            "id": "j2_8a", "text": "Мнемощит", "parent": "vu", "type": "sub", "state": {"selected": true}
        }, {
        "id": "j2_9a", "text": "АРМ", "parent": "j2_8a", "type": "function", "state": {"selected": true}
    },
        {
            "id": "j2_8b", "text": "Пульт-стол", "parent": "vu", "type": "sub", "state": {"selected": true}
        }, {
        "id": "j2_9b", "text": "СТОЛ", "parent": "j2_8b", "type": "function", "state": {"selected": true}
    },

        {
            "id": "j2_10", "text": "ПТК ГРАРМ", "parent": "vu", "type": "sub", "state": {"selected": true}
        }, {
        "id": "j2_11", "text": "ГРАМ", "parent": "j2_10", "type": "function", "state": {"selected": true}
    }, {
        "id": "j2_12", "text": "ГРНРМ", "parent": "j2_10", "type": "function", "state": {"selected": true}
    },

        {
            "id": "j2_13", "text": "ПТК РУСА", "parent": "vu", "type": "sub", "state": {"selected": true}
        }, {
        "id": "j2_14", "text": "РУСА", "parent": "j2_13", "type": "function", "state": {"selected": true}
    },

        {
            "id": "j2_15", "text": "ПТК ТМ", "parent": "vu", "type": "sub", "state": {"selected": true}
        }, {
        "id": "j2_16", "text": "ТМ", "parent": "j2_15", "type": "function", "state": {"selected": true}
    },

        {
            "id": "j2_17", "text": "Видеонаблюдение", "parent": "vu", "type": "sub", "state": {"selected": true}
        }, {
        "id": "j2_18", "text": "CCTV", "parent": "j2_17", "type": "function", "state": {"selected": true}
    },

        {
            "id": "j2_19", "text": "ПТК СОЕВ", "parent": "vu", "type": "sub", "state": {"selected": true}
        }, {
        "id": "j2_20", "text": "СОЕВ", "parent": "j2_19", "type": "function", "state": {"selected": true}
    },
        {
            "id": "aux1_1", "text": "ЗИП", "parent": "aux", "type": "sub", "state": {"selected": true}
        },
        {
            "id": "aux2_1", "text": "НК", "parent": "aux", "type": "sub", "state": {"selected": true}
        },
        {
            "id": "j3_1", "text": "ГМК", "parent": "hydraulics", "type": "sub", "state": {"selected": true}
        }
    ]