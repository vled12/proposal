$.ajaxSetup({
    // Disable caching of AJAX responses
    cache: false
});


const mme = new Map([['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], ['pdf', 'application/pdf']])

$(document).ready(function () {
    var myCodeMirror = CodeMirror.fromTextArea(document.getElementById('TemplateText'), {
        mode:  "jinja2",
        lineNumbers: true,
        tabSize: 2,
        lineWrapping: true,
    });

    // Initial product configuration
    const productElement = $('#product')
    const configElement = $("#config")
    productElement.on('change', function () {
        configElement.load("static/mat/questionnaire/" + this.value + ".htm",
            function (response, status, xhr) {
                loadFormFromCookie(configElement);
                // Delivery tree restore is currently disabled to 4096 byte Cookie limit
                //let delivery = Cookies.get('delivery');

                //Pop-up windows for detailed configuration
                $(".dialog").dialog({
                    autoOpen: false,
                    width:600,
                    modal: true,
                    position: { my: "left top", at: "left top", of: $('#form') },
                    appendTo: "#form"
                });//.parent().css('z-index', '1000');

                initDeliveryTree();

                // Automatically fill "Title" attribute with configuration tags
                // Required just for developers
                $('#form').find("input, select, textarea").each(function() {
                    $(this).attr("title","Name: "+ $(this).attr("name"))
                    // For select objects add options list
                    if ($(this).is("select")) {
                        let options = []
                        $(this).children().each(function () {
                            options.push($(this).attr("value"))
                        })
                        $(this).attr("title", $(this).attr("title") + "\n" + "Values: "+ options)
                    }
                });
            });
    })

    // Handling the query
    $("#get-preview, #get-docx, #get-pdf, #get-cfg, #get-template").click(function () {
        const params = configElement.serializeArray();// Form parameters
        const delivery = JSON.stringify($('#delivery').jstree(true).get_json('#', {flat: true}));
        // Add Delivery tree data
        params.push({name: "delivery", value: delivery})
        saveFormToCookie(configElement);

        // Delivery tree save is currently disabled to 4096 byte Cookie limit
        //Cookies.set('delivery', $('#delivery').jstree(true).get_json('#', {flat: true}), {expires: 365});

        // Recognize the action
        const argv = this.id.split("-")
        const action = argv[0]
        const type = argv[1]

        // Handle depends on type
        if (action === "get") {
            if (type === "preview") {
                $("#preview").load('/get/preview', params);
            }

            if (type === "template") {
                myCodeMirror.save();
                const templateText = $("#TemplateText").val();
                // Add Delivery tree data
                params.push({name: "TemplateText", value: templateText})
                $("#preview").load('/get/template', params);
            }

            if (type === "docx" || type === "pdf" || type === "cfg") {
                const xhr = new XMLHttpRequest();
                // Send the file request
                xhr.open('POST', '/get/' + type, true);
                xhr.responseType = 'blob';
                xhr.onload = function () {
                    // Only handle status code 200
                    if (xhr.status === 200) {
                        // The actual download
                        let blob = new Blob([xhr.response], {type: mme[type]});
                        let link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);

                        // Match the extension
                        let extension = type
                        if (type === "cfg") {
                            extension = "json"
                        }

                        // Form filename
                        const today = new Date()
                        link.download = today.getFullYear() + '-' +  (today.getMonth() + 1) + '-' + today.getDate() + "." + extension

                        // Click imitation
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    // some error handling should be done here...
                }
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                xhr.send($.param(params, true));
            }
        }
    });

    // Template editor
    // Appearance
    $("#CheckTemplate").click(function (e) {
        if ($(this).is(':checked')){
            $("#template").show(100)
        } else {
            $("#template").hide(100)
        }
    });
    // Default state
    $("#template").hide(100);
    $("#CheckTemplate").prop("checked", false);

    //Line numeration for certain objects
	$(function() {
	  // Target all classed with ".lined"
	  $(".lined").linedtextarea(
		{selectedLine: 1}
	  );
	});

	//Choose first product at start
	const firstProduct = productElement.children().first().val()
    productElement.val(firstProduct).trigger('change');
});//



//Загрузка документа для его модификации

var Upload = function (file) {
    this.file = file;
};

Upload.prototype.getType = function () {
    return this.file.type;
};
Upload.prototype.getSize = function () {
    return this.file.size;
};
Upload.prototype.getName = function () {
    return this.file.name;
};


Upload.prototype.doUpload = function () {
    var that = this;
    var formData = new FormData();

    // add assoc key values, this will be posts values
    formData.append("file", this.file, this.getName());
    formData.append("upload_file", true);
    filename = this.file.name

    let request = new XMLHttpRequest();
    request.open('POST', 'convert-file', true)
    request.responseType = 'blob';
    request.onload = function (e) {
        // The actual download
        let blob = new Blob([request.response], {type: mme['docx']});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = "ИЗМ. " + filename//"file.docx"
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    request.send(formData)

};

//Change id to your id
$("#convert-file").on("change", function (e) {
    var file = $(this)[0].files[0];
    var upload = new Upload(file);

    // maby check size or type here with upload.getSize() and upload.getType()

    // execute upload
    upload.doUpload();
});


// Modal window
var modal = document.getElementById("convert-modal");
var btn = document.getElementById("open-convert-dialog");
var span = document.getElementById("convert-modal-close");

// When the user clicks on the button, open the modal
btn.onclick = function() {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


/* Deprecated
// Tab insertion in TemplateText
let shiftDown;
let templateTextArea = document.getElementById('TemplateText')
templateTextArea.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
        shiftDown = true;
    }
});

templateTextArea.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
        shiftDown = false;
    }
});

templateTextArea.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;

        if (shiftDown) {
            if (this.value[start - 1] === '\t') {
                let endstr = this.value.substring(end)
                this.value = this.value.substring(0, start - 1) + endstr;
                this.selectionStart =
                    this.selectionEnd = start - 1;
            }
        }   else {
            // set textarea value to: text before caret + tab + text after caret
            this.value = this.value.substring(0, start) +
                "\t" + this.value.substring(end);
            // put caret at right position again
            this.selectionStart =
                this.selectionEnd = start + 1;
        }
    }
});
*/

