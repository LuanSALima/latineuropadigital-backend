function ValidationError() {
	this.name = "ValidationError";
}
ValidationError.prototype = Error.prototype;

module.exports.validateImage = (file) => {
	if(!file){
		throw new Error("Es necesario registrar una imagen");
	}

	if(!file.image) {
    	throw new Error("La imagen no se encontró en el nombre 'imagen'");
    }

    if(file.image.size > 3145728) {
    	throw new Error("El archivo es demasiado grande. El máximo es 3 MB");
    }

    const validMimetypes = ["image/jpeg", "image/png"];

	if(validMimetypes.indexOf((file.image).mimetype) === -1){
        throw new Error("El archivo debe ser una imagen .jpg/.jpeg/.png");
    }
}