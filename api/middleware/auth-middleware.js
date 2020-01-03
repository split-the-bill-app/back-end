const jwt = require('jsonwebtoken');
//const secret = require('../../data/secrets/secret.js');

var SECRET = "you will never guess";

module.exports = {
  restricted,
};

function restricted(req, res, next) {
  const token = req.headers.authorization;

  jwt.verify(token, secret.jwtSecret /*SECRET*/, (error, decodedToken) => {
    error
      ? res
          .status(401)
          .json({ warning: 'Authorization failed. Access denied!' })
      : ((req.decodedToken = decodedToken), next());
  });
}
