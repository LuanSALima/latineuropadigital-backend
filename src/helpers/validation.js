function ValidationError() {
	this.name = "ValidationError";
}
ValidationError.prototype = Error.prototype;

module.exports.validateImage = (file) => {
	if(!file){
		throw new Error("É necessário cadastrar uma imagem");
	}

	if(!file.image) {
    	throw new Error("Não foi encontrada a imagem no name 'image'");
    }

    const validMimetypes = ["image/jpeg", "image/png"];

	if(validMimetypes.indexOf((file.image).mimetype) === -1){
        throw new Error("O arquivo tem que ser uma imagem .jpg/.jpeg/.png");
    }
}