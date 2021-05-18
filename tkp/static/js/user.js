$.ajaxSetup({
    // Disable caching of AJAX responses
    cache: false
});


const mme = new Map([['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], ['pdf', 'application/pdf']])

$(document).ready(function () {
    const productElement = $('#product')
    const configElement = $("#config")
    productElement.on('change', function () {
        configElement.load("static/mat/questionnaire/" + this.value + ".htm",
            function (response, status, xhr) {
                loadFormFromCookie(configElement);
                //Проверяем наличие сохраненного объема поставки. Не используем из-за размера
                //let delivery = Cookies.get('delivery');

                $(".dialog").dialog({
                    autoOpen: false,
                    width:600,
                    modal: true,
                    position: { my: "left top", at: "left top", of: $('#form') },
                    appendTo: "#form"
                });//.parent().css('z-index', '1000');

                initDeliveryTree();
            });
    })


    $("#get-preview, #get-docx, #get-pdf, #get-cfg, #get-template").click(function () {
        const params = configElement.serializeArray();
        const delivery = JSON.stringify($('#delivery').jstree(true).get_json('#', {flat: true}));
        params.push({name: "delivery", value: delivery})//add delivery tree data
        //Для отладки
        //console.log(params);

        saveFormToCookie(configElement);

        //Слишком большой размер
        //Cookies.set('delivery', $('#delivery').jstree(true).get_json('#', {flat: true}), {expires: 365});

        //Определяем команду
        let argv = this.id.split("-")

        const type = argv[1]
        if (argv[0] === "get") {
            if (type === "preview") {
                $("#preview").load('/get/preview', params);
            }

            if (type === "template") {
                // Rendering template
                const templateText = $("#TemplateText").val();
                params.push({name: "TemplateText", value: templateText})//add delivery tree data
                console.log(templateText)
                $("#preview").load('/get/template', params);
            }

            if (type === "docx" || type === "pdf" || type === "cfg") {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', '/get/' + type, true);
                xhr.responseType = 'blob';
                xhr.onload = function () {
                    // Only handle status code 200
                    if (xhr.status === 200) {


                        // Try to find out the filename from the content disposition `filename` value
                        //var disposition = request.getResponseHeader('content-disposition');
                        //var matches = /"([^"]*)"/.exec(disposition);
                        //var filename = (matches != null && matches[1] ? matches[1] : 'file.pdf');

                        // The actual download
                        let blob = new Blob([xhr.response], {type: mme[type]});
                        let link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        //link.download = 'result.' + type;
                        let extension = type
                        if (type === "cfg") {
                            extension = "json"
                        }
                        //Используем текущую дату в качестве имени
                        const today = new Date()
                        link.download = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + "." + extension
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

    // Template check mode
    $("#CheckTemplate").click(function (e) {
        if ($(this).is(':checked')){
            $("#template").show(100)
        } else {
            $("#template").hide(100)
        }
    });
    // Default state
    $("#template").hide(100);
    $("#CheckTemplate").checked = false;



    productElement.val('hpp').trigger('change');//Choose first one for start
});//


//Чтение конфигурационного файла
function readCfgFile(e) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        const contents = e.target.result;
        //displayContents(contents);
        //console.log(contents)
        loadFormFromFile($("#config"), contents)
    };
    reader.readAsText(file);
}

//Привязка команды загрузки конфигурации
let openCfgButton = document.getElementById('open-cfg')
openCfgButton.addEventListener('change', readCfgFile, false);
//Сброс входа (для возможности использовать повторно файл)
openCfgButton.onclick = function () {
    this.value = null;
};

loadFormFromFile = function (form, content) {
    //const name = $(form).attr('id');
    const data = content;
    if (typeof data === 'undefined') {
        return;
    }

    JSON.parse(data, function (key, value) {
        if (typeof (value) !== 'object') {
            const el = $(form).find('*[name="' + key + '"]');
            if (el.is('input')) {
                if (false) {
                    // code formatting stub
                } else if (el.attr('type') === 'number') {
                    el.val(ensureNumber(value));
                } else if (el.attr('type') === 'checkbox') {
                    if (el.val() === value) $(el).prop('checked', true);
                } else if (el.attr('type') === 'radio') {
                    $.each(el, function (_, elc) {
                        if (elc.value === value) $(elc).prop('checked', true);
                    });
                } else {
                    el.val(value);
                }
            } else if (el.is('select')) {
                el.val(value);
            } else if (el.is('textarea')) {
                el.val(value);
            }
        }
        if (key === 'delivery') {
            const deliveryElement = $('#delivery')
            deliveryElement.jstree(true).settings.core.data = JSON.parse(value)
            deliveryElement.jstree(true).refresh(false, true)
        }
    });
};


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

