const handleError = (error) => {
  let message = "Ha ocurrido un error inesperado";
  let errors = {};

  if(error.name === "CastError") {
    message = "El ID obtenido no es válido";
    errors = undefined;
  }

  if (error.name === "ValidationError") {
    message = undefined;

    Object.keys(error.errors).forEach((key) => {
      errors[key] = error.errors[key].message;
    });
  }

  if (error.name === "MongoError" && error.code === 11000) {
    message = undefined;

    errors[Object.keys(error.keyValue)] = Object.keys(error.keyValue)+" ya registrado";
  }

  if (error.name === "Error") {
    errors = undefined;

    message = error.message;
  }

  if(error.code === 'ENOENT') {
    message = "¡No fue posible eliminar porque no se encontró la imagen a eliminar!";
    errors = undefined;
  }

  if(message === "Ha ocurrido un error inesperado"){
    console.log("====Ocorreu um Erro====");
    console.log(error);
  }

  return {
    success: false,
    message,
    errors
  };
};

module.exports = handleError;