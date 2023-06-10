// Read configuration file

//Originally by (cc) Paul Philippov, themactep@gmail.com
(function ($) {
    $.fn.serializeJSON = function () {
        var json = {};
        jQuery.map($(this).serializeArray(), function (n, _) {
            json[n['name']] = n['value'];
        });
        // Include non-checked inputs
        jQuery.map($(this).find('input[type=checkbox]:not(:checked)'), function (n, _) {
            json[n.name] = "off";
        });
        return json;
    };
})(jQuery);

ensureNumber = function (n) {
    n = parseInt(n, 10);
    if (isNaN(n) || n <= 0) {
        n = 0;
    }
    return n;
};
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
        loadForm($("#config"), contents)
    };
    reader.readAsText(file);
}
// Add listener
let openCfgButton = document.getElementById('open-cfg')
openCfgButton.addEventListener('change', readCfgFile, false);
// Deprecated
/*openCfgButton.onclick = function () {
    this.value = null;
};*/

loadForm = function (form, content) {
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
                    if (value == 'on') $(el).prop('checked', true);
                    if (value == 'off') $(el).prop('checked', false);
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
