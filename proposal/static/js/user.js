const mme = new Map([['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], ['pdf', 'application/pdf']])

$(function () {
    const myCodeMirror = CodeMirror.fromTextArea(document.getElementById('TemplateText'), {
        mode: "jinja2",
        lineNumbers: true,
        tabSize: 2,
        lineWrapping: true,
    });

    // Initial product configuration
    const productElement = document.getElementById('product')
    const configElement = document.getElementById('config')
    const questionnaireElement = document.getElementById('questionnaire')
    $(productElement).on('change', function () {
        Cookies.set("product", $(this).val(), {expires: 365, samesite: "strict"});
        $(questionnaireElement).load("static/mat/questionnaire/" + this.value,
            function () {

                //Disable until fixing several products issue
                //loadFormFromCookie($(productElement).val(), $(configElement));
                loadForm($(configElement), Cookies.get($(productElement).val()))
                // Delivery tree restore is currently disabled to 4096 byte Cookie limit
                //let delivery = Cookies.get('delivery');

                //Dynamically load default delivery depending on product
                $.getScript("static/mat/text/" + $(productElement).val() + '/defaultDelivery.js', function () {
                    initDeliveryTree();
                });

                const form = $('#form')
                //Pop-up windows for detailed configuration
                $(".dialog").dialog({
                    autoOpen: false,
                    width: 600,
                    modal: true,
                    position: {my: "left top", at: "left top", of: form},
                    appendTo: "#form"
                });//.parent().css('z-index', '1000');


                // Automatically fill "Title" attribute with configuration tags
                // Required for development purposes
                const elements = $("input, select, textarea")
                form.find(elements).each(function () {
                    $(this).attr("title", "Name: " + $(this).attr("name"))
                    // For select objects add options list
                    if ($(this).is("select")) {
                        let options = []
                        $(this).children().each(function () {
                            options.push($(this).attr("value"))
                        })
                        $(this).attr("title", $(this).attr("title") + "\n" + "Values: " + options)
                    }
                });
            });
    });


    // Handling the query
    function query(action, type) {
        //const params = $(configElement).serializeArray();// Form parameters
        const params = $(configElement).serializeJSON();
        Cookies.set($(productElement).val(), params, {expires: 365, samesite: "strict"});

        const deliveryElement = document.getElementById('delivery')
        //Check if exists
        if ($(deliveryElement).length) {
            // Add Delivery tree data
            params["delivery"] = JSON.stringify($(deliveryElement).jstree(true).get_json('#', {flat: true}));
        }

        // Handle depends on type
        if (action === "get") {
            if (type === "preview") {
                $("#preview").load('/get/preview', params, function (response, status, xhr) {
                    //Handle server errors to show WERKZEUG debug log
                    if (xhr.status === 500) {
                        const tab = window.open('about:blank', '_blank');
                        tab.document.write(xhr.responseText);
                        tab.document.close();
                    }
                });
            }

            if (type === "template") {
                myCodeMirror.save();
                params["TemplateText"] = $("#TemplateText").val()
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
                        if (type === "cfg") extension = "json";

                        // Form filename
                        let today = new Date()
                        const offset = today.getTimezoneOffset()
                        today = new Date(today.getTime() - (offset * 60 * 1000))
                        const ISO_date = today.toISOString().split('T')[0]
                        let title = $("#contract_title").val()

                        link.download = ISO_date + (title ? " " + title : "") + "." + extension

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
    }

    $("#get-preview, #get-docx, #get-pdf, #get-cfg, #get-template").on({
        click: function () {
            const argv = this.id.split("-")
            query(argv[0], argv[1])
        }
    });

    addEventListener('keydown', (e) => {
        if (e.key === 'F8') query("get", "preview")
        if (e.key === 'F9') query("get", "template")
    });

    // Template editor
    // Appearance
    const showTemplateElement = document.getElementById('ShowTemplate')
    const templateElement = document.getElementById('template')
    $(showTemplateElement).on({
        click: function () {
            if ($(this).is(':checked')) {
                $(templateElement).show(100)
            } else {
                $(templateElement).hide(100)
            }
        }
    });
    // Default state
    $(templateElement).hide(100);
    $(showTemplateElement).prop("checked", false);

    //Line numeration for certain objects
    $(function () {
        // Target all classed with ".lined"
        $(".lined").linedtextarea(
            {selectedLine: 1}
        );
    });

    //Load product from cookies
    const selectedProduct = Cookies.get('product');
    if (selectedProduct) {
        $(productElement).val(selectedProduct);
        $(productElement).val(selectedProduct).trigger('change')
    }
});//


jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        //async: true
    });
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

