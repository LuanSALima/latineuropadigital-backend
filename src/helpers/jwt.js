const jwt = require("jsonwebtoken"); /*Método para geração do token de autenticação*/

//Método para gerar o token jwt, necessário passar o id
module.exports.generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_HASH, {
      expiresIn: 86400, /*(1 dia)Tempo em segundo para o expiramento do token*/
    });
}

module.exports.checkToken = (request) => {
  try{
    //Busca o token nos headers da requisição
    const token = request.headers.authorization;

    //Se não possuir o token no header
    if (!token) {
      throw new Error("No token provided");
    }

    //Caso todas as verificações acima estiverem corretas, executa a função do jsonwebtoken
    jwt.verify(token, process.env.JWT_HASH, (err, decoded) => {
      if (err) throw new Error("Token invalid");

      if(!decoded.id || !decoded.role) {
        throw new Error("Invalid Token");
      }

      request.user = {
        id: decoded.id,
        role: decoded.role
      };
      
    });

    return true;
  } catch (error) {
    return false;
  }
  
}

module.exports.middleware = (request, response, next) => {
  try {
    
    //Busca o token nos headers da requisição
    const token = request.headers.authorization;

    //Se não possuir o token no header
    if (!token) {
      throw new Error("No token provided");
    }

    //Caso todas as verificações acima estiverem corretas, executa a função do jsonwebtoken
    jwt.verify(token, process.env.JWT_HASH, (err, decoded) => {
      if (err) throw new Error("Token invalid");

      //Adicionando o id do usuário na requisição
      request.userId = decoded.id;

      //Adicionando o role do usuário na requisição
      request.userRole = decoded.role;

      //Indica que é possível avançar na requisição, ou seja, este middleware permite que a requisição acesse o controller
      return next();
    });
  } catch (error) {
    return response.status(400).json({
      success: false,
      message: error.message
    });
  }
};