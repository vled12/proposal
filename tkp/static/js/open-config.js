// Read configuration file
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
// Add listener
let openCfgButton = document.getElementById('open-cfg')
openCfgButton.addEventListener('change', readCfgFile, false);
// Deprecated
/*openCfgButton.onclick = function () {
    this.value = null;
};*/

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
