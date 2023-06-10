/* 
 * Save Form To Cookie
 * (cc) Paul Philippov, themactep@gmail.com
 * 
 * This is rather a proof of concept than a production-ready solution.
 * It does not handle all kinds of fields.
 * You might want to extend it to suit your needs.
 *
 * Requirements:
 * 
 * - jQuery: https://github.com/jquery/jquery
 * - JavaScript Cookie: https://github.com/js-cookie/js-cookie
 *
 * Usage:
 *
 * <script src="jquery.js"></script>
 * <script src="js.cookie.js"></script>
 * <script>
 * $(function () {
 *     var myForm = $('#formid');
 *     loadFormFromCookie(myForm);
 *     myForm.submit(function() {
 *         saveFormToCookie(this);
 *     });
 * });
 * </script>
 */

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

saveFormToCookie = function (form) {
    var name = $(form).attr('id');
    var data = $(form).serializeJSON();
    Cookies.set(name, data, {expires: 365, samesite: "strict"});
};


loadFormFromCookie = function (form) {
    var name = $(form).attr('id');
    const data = Cookies.get(name);
    if (typeof data === 'undefined') {
        return;
    }

    JSON.parse(data, function (key, value) {
        if ((typeof (value) !== 'object') && key != 'product') {
            var el = $(form).find('*[name="' + key + '"]');
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
    });
};
