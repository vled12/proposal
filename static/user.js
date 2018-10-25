$.ajaxSetup ({
    // Disable caching of AJAX responses
    cache: false
});


const mme= new Map ([[ 'docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ],[ 'pdf', 'application/pdf' ]])
 
 $(document).ready(function () {
 	


	$('#product').on('change', function() {
		$( "#config" ).load("/static/"+this.value+".htm",
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
			    		{ "text" : "ГА","type":"system","children": [
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
 
	$("#print-preview").click(function(){
		var prtContent = document.getElementById("preview");
		var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
		WinPrint.document.write(prtContent.innerHTML);
		WinPrint.document.write(cssLinkTag)
		WinPrint.document.close();
		WinPrint.focus();
		WinPrint.print();
		WinPrint.close();
		
		$("#b-placeholder").load("https://cors.io/?https://ru.wikipedia.org/wiki/%D0%92%D0%B5%D1%80%D1%85%D0%BD%D0%B5%D0%B1%D0%B0%D0%BB%D0%BA%D0%B0%D1%80%D1%81%D0%BA%D0%B0%D1%8F_%D0%93%D0%AD%D0%A1?action=render");
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