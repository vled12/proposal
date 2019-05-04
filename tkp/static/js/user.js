$.ajaxSetup ({
    // Disable caching of AJAX responses
    cache: false
});


const mme= new Map ([[ 'docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ],[ 'pdf', 'application/pdf' ]])
 
 $(document).ready(function () {
 	


	$('#product').on('change', function() {
		$( "#config" ).load("static/mat/questionnaire/"+this.value+".htm",
			function(response, status, xhr){
			//console.log(response);
			loadFormFromCookie($("#config"));
			var delivery=0;//Cookies.get('delivery');
			console.log(delivery);
		    $(".dialog").dialog({
		      autoOpen: false,
		      modal: true,
		      appendTo: "#form"
		    }).parent().css('z-index', '1000');;
			$(function () {
	 		$('#delivery').jstree({
			  "core" : {
			    "animation" : 0,
			    "check_callback" :true,/*: function (op, node, par, pos, more) {
                          // disable operations for disabled nodes            
                          if (this.get_node(par).state.disabled)
                              return false;
 
                          if (op == "rename_node") {
                              rename_node(this.get_node(node), "&quot;"); 
                              //alert(pos);
                              //pos = pos.replace("\"", "'");
                              //alert(pos);
                          }
                          // disable all the context menu operations for the disabled items                         
                          if (this.get_node(par).parent == null) {
                              if (op == "rename_node" || op == "delete_node" || op == "move_node")
                                  return false;
                          }
                      }, //check callback*/ 
			    "themes" : { "stripes" : true },
			    'data' :  delivery ? JSON.parse(delivery) : 
			    	[{
				    "id": "ga",
				    "text": "САУ ГА",
				    "icon": "fa fa-briefcase",
				    "li_attr": {
				        "id": "ga"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "ga_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": true,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "#",
				    "type": "system"
				}, {
				    "id": "j1_5",
				    "text": "ПТК ТА-ТИСУ-ВО Шкаф ТА",
				    "icon": "fa fa-wrench",
				    "li_attr": {
				        "id": "j1_5"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_5_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": true,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "ga",
				    "type": "sub"
				}, {
				    "id": "j1_20",
				    "text": "СИГН",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_20"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_20_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_5",
				    "type": "function"
				}, {
				    "id": "j1_6",
				    "text": "ТА",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_6"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_6_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_5",
				    "type": "function"
				}, {
				    "id": "j1_7",
				    "text": "ПТК ТА-ТИСУ-ВО Шкаф УСО",
				    "icon": "fa fa-wrench",
				    "li_attr": {
				        "id": "j1_7"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_7_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "ga",
				    "type": "sub"
				}, {
				    "id": "j1_8",
				    "text": "ИЗМ",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_8"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_8_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_7",
				    "type": "function"
				}, {
				    "id": "j1_9",
				    "text": "ТК",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_9"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_9_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_7",
				    "type": "function"
				}, {
				    "id": "j1_10",
				    "text": "ПТК ТА-ТИСУ-ВО Шкаф УСО ТИСУ",
				    "icon": "fa fa-wrench",
				    "li_attr": {
				        "id": "j1_10"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_10_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": true,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "ga",
				    "type": "sub"
				}, {
				    "id": "j1_29",
				    "text": "ТК",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_29"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_29_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_10",
				    "type": "function"
				}, {
				    "id": "j1_17",
				    "text": "ПТК Енисей ВК",
				    "icon": "fa fa-wrench",
				    "li_attr": {
				        "id": "j1_17"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_17_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": true,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "ga",
				    "type": "sub"
				}, {
				    "id": "j1_18",
				    "text": "ВК",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_18"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_18_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_17",
				    "type": "function"
				}, {
				    "id": "j1_26",
				    "text": "Шкаф защиты ошиновки",
				    "icon": "fa fa-wrench",
				    "li_attr": {
				        "id": "j1_26"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_26_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": true,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "ga",
				    "type": "sub"
				}, {
				    "id": "j1_27",
				    "text": "ШЗО",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_27"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_27_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_26",
				    "type": "function"
				}, {
				    "id": "j1_25",
				    "text": "Шкаф защиты трансформатора",
				    "icon": "fa fa-wrench",
				    "li_attr": {
				        "id": "j1_25"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_25_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": true,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "ga",
				    "type": "sub"
				}, {
				    "id": "j1_28",
				    "text": "ШЗТ",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_28"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_28_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_25",
				    "type": "function"
				}, {
				    "id": "j1_21",
				    "text": "Шкаф защиты генератора",
				    "icon": "fa fa-wrench",
				    "li_attr": {
				        "id": "j1_21"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_21_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": true,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "ga",
				    "type": "sub"
				}, {
				    "id": "j1_24",
				    "text": "ШЗГ",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_24"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_24_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_21",
				    "type": "function"
				}, {
				    "id": "j1_2",
				    "text": "ПТК ЭГР-МНУ Шкаф ЭГР-МНУ",
				    "icon": "fa fa-wrench",
				    "li_attr": {
				        "id": "j1_2"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_2_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "ga",
				    "type": "sub"
				}, {
				    "id": "j1_3",
				    "text": "ЭГР",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_3"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_3_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_2",
				    "type": "function"
				}, {
				    "id": "j1_4",
				    "text": "МНУ",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_4"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_4_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_2",
				    "type": "function"
				}, {
				    "id": "j1_12",
				    "text": "ШИС",
				    "icon": "fa fa-wrench",
				    "li_attr": {
				        "id": "j1_12"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_12_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": true,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "ga",
				    "type": "sub"
				}, {
				    "id": "j1_16",
				    "text": "ЭИ",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_16"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_16_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_12",
				    "type": "function"
				}, {
				    "id": "j1_13",
				    "text": "ЭС",
				    "icon": "fa fa-flash",
				    "li_attr": {
				        "id": "j1_13"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_13_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": true,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "j1_12",
				    "type": "function"
				}, {
				    "id": "j1_14",
				    "text": "ОС",
				    "icon": "fa fa-briefcase",
				    "li_attr": {
				        "id": "j1_14"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_14_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": false,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "#",
				    "type": "system"
				}, {
				    "id": "j1_15",
				    "text": "ВУ",
				    "icon": "fa fa-briefcase",
				    "li_attr": {
				        "id": "j1_15"
				    },
				    "a_attr": {
				        "href": "#",
				        "id": "j1_15_anchor"
				    },
				    "state": {
				        "loaded": true,
				        "opened": false,
				        "selected": false,
				        "disabled": false
				    },
				    "data": {},
				    "parent": "#",
				    "type": "system"
				}]
			  },
			  "types" : {
			    "#" : {
			     "max_depth" : 3,
			      "valid_children" : ["root"]
			    },
			    "system" : {
			      "icon" : "fa fa-briefcase",
			      //"valid_children" : ["sub"]
			    },
			    "sub" : {
			    	"icon" : "fa fa-wrench",
			      //"valid_children" : ["function"]
			    },
			    "function" : {
			      "icon" : "fa fa-flash",
			      //"valid_children" : []
			    }
			  },
			  "checkbox" :{
				  "three_state" :true//,
				  //"whole_node": false,
			  },
			  "state" : { "key" : "state_delivery" },
			  "plugins" : [
			    "contextmenu", "dnd",
			    "state", "types", "wholerow", "checkbox"
			  ],
			"contextmenu":{         
		    "items": function($node) {
		        var tree = $("#tree").jstree(true);
		        return {
				"create" : {
					"separator_before"	: false,
					"separator_after"	: true,
					"_disabled"			: false, //(this.check("create_node", data.reference, {}, "last")),
					"label"				: "Create",
					"action"			: function (data) {
						var inst = $.jstree.reference(data.reference),
							obj = inst.get_node(data.reference);
						inst.create_node(obj, {}, "last", function (new_node) {
							try {
								inst.edit(new_node);
							} catch (ex) {
								setTimeout(function () { inst.edit(new_node); },0);
							}
						});
					}
				},
				"rename" : {
					"separator_before"	: false,
					"separator_after"	: false,
					"_disabled"			: false, //(this.check("rename_node", data.reference, this.get_parent(data.reference), "")),
					"label"				: "Rename",
					/*!
					"shortcut"			: 113,
					"shortcut_label"	: 'F2',
					"icon"				: "glyphicon glyphicon-leaf",
					*/
					"action"			: function (data) {
						var inst = $.jstree.reference(data.reference),
							obj = inst.get_node(data.reference);
						inst.edit(obj);
					}
				},
				"remove" : {
					"separator_before"	: false,
					"icon"				: false,
					"separator_after"	: false,
					"_disabled"			: false, //(this.check("delete_node", data.reference, this.get_parent(data.reference), "")),
					"label"				: "Delete",
					"action"			: function (data) {
						var inst = $.jstree.reference(data.reference),
							obj = inst.get_node(data.reference);
						if(inst.is_selected(obj)) {
							inst.delete_node(inst.get_selected());
						}
						else {
							inst.delete_node(obj);
						}
					}
				},
				"ccp" : {
					"separator_before"	: true,
					"icon"				: false,
					"separator_after"	: false,
					"label"				: "Edit",
					"action"			: false,
					"submenu" : {
						"cut" : {
							"separator_before"	: false,
							"separator_after"	: false,
							"label"				: "Cut",
							"action"			: function (data) {
								var inst = $.jstree.reference(data.reference),
									obj = inst.get_node(data.reference);
								if(inst.is_selected(obj)) {
									inst.cut(inst.get_top_selected());
								}
								else {
									inst.cut(obj);
								}
							}
						},
						"copy" : {
							"separator_before"	: false,
							"icon"				: false,
							"separator_after"	: false,
							"label"				: "Copy",
							"action"			: function (data) {
								var inst = $.jstree.reference(data.reference),
									obj = inst.get_node(data.reference);
								if(inst.is_selected(obj)) {
									inst.copy(inst.get_top_selected());
								}
								else {
									inst.copy(obj);
								}
							}
						},
						"paste" : {
							"separator_before"	: false,
							"icon"				: false,
							"_disabled"			: function (data) {
								return !$.jstree.reference(data.reference).can_paste();
							},
							"separator_after"	: false,
							"label"				: "Paste",
							"action"			: function (data) {
								var inst = $.jstree.reference(data.reference),
									obj = inst.get_node(data.reference);
								inst.paste(obj);
							}
						}
					}
				},
		            "Popup": {
		                "separator_before": true,
		                "separator_after": false,
		                "label": "Setup",
		                "action": function (data) {
		                	var inst = $.jstree.reference(data.reference),
							obj = inst.get_node(data.reference);
							
		                    $(".dialog").each(function (index,item) {
		                    	if ($(this).dialog("option","title")==obj.text) 
		                    		{$(this).dialog("open");}
		                    });
		                }
			            }
			        };
			    }  
			},

			});
	 	});

			});
		

	})
 
 
	$("#get-preview,#get-docx,#get-pdf").click(function(){
		var params=$("#config").serializeArray();
		var delivery=JSON.stringify($('#delivery').jstree(true).get_json('#', {flat:true}));
		params.push({name:"delivery",value:delivery})//add delivery tree data
		saveFormToCookie($("#config"));
		Cookies.set('delivery', delivery, {expires: 365});
		var type =this.id.slice(4);
		console.log(params);
		
		if (type=="preview") {
			$("#preview").load('/get/preview',params,
				function(response, status, xhr){
				//console.log(response);
				});
		};
	
  
		if (type=="docx" || type=="pdf"){
			var request = new XMLHttpRequest();
			request.open('POST', '/get/'+type, true);
			request.responseType = 'blob';
			request.onload = function() {
				// Only handle status code 200
				if(request.status === 200) {
				// Try to find out the filename from the content disposition `filename` value
				//var disposition = request.getResponseHeader('content-disposition');
				//var matches = /"([^"]*)"/.exec(disposition);
				//var filename = (matches != null && matches[1] ? matches[1] : 'file.pdf');

				// The actual download				
				var blob = new Blob([request.response], { type: mme[type] });
				var link = document.createElement('a');
				link.href = window.URL.createObjectURL(blob);
				link.download = 'result.'+type;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			  }
			  // some error handling should be done here...
			};
			request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			request.send($.param(params,true));
		};
	});


	$('#product').val('hpp').trigger('change');//Choose first one for start
 });