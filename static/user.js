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
			$(function () {
	 		$('#delivery').jstree({
			  "core" : {
			    "animation" : 0,
			    "check_callback" : true,
			    "themes" : { "stripes" : true },
			    'data' :  delivery ? JSON.parse(delivery) : 
			    	[
			    		{ "text" : "ГА","id":"ga","type":"system","children": [
				            { "text" : "Шкаф ПТК ЭГР","type":"sub","children": [
					            { "text" : "ЭГР","type":"function" }
					         	]},
				            { "text" : "Шкаф ПТК АУГ","type":"sub"}
				         ]},
			    		{ "text" : "ОС","type":"system"},
			    		{ "text" : "ВУ","type":"system"}
			    	]
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
				  "three_state" :false,
				  "whole_node": false,
			  },
			  "state" : { "key" : "state_delivery" },
			  "plugins" : [
			    "contextmenu", "dnd",
			    "state", "types", "wholerow", "checkbox"
			  ]
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