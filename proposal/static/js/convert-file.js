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
    //var that = this;
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