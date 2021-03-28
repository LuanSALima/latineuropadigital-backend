const handleError = (error) => {
  let message = "Ocorreu um erro inesperado";
  let errors = {};

  if(error.name === "CastError") {
    message = "ID buscado é inválido";
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

    errors[Object.keys(error.keyValue)] = Object.keys(error.keyValue)+" já cadastrado";
  }

  if (error.name === "Error") {
    errors = undefined;

    message = error.message;
  }

  if(error.code === 'ENOENT') {
    message = "Não foi possível excluir pois não foi encontrada a imagem que será deletada!";
    errors = undefined;
  }

  if(message === "Ocorreu um erro inesperado"){
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