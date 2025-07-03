export function getUserFromToken(req) {
  const token = req.headers['access-token'];

  if (!token) {
    return null
  }

  // Simulação de validação de token
  const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
  
 return JSON.parse(decodedToken);
}

export function generateToken(usuario) {
  const token = Buffer.from(JSON.stringify(usuario)).toString('base64');
  return token;
}