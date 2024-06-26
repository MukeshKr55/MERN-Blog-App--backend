const jwt = require('jsonwebtoken')
const HttpError = require('../models/errorModel')

const authMiddleware = async (req, res, next) => {
  // Extract 'Authorization' header from request
  const Authorization = req.headers.Authorization || req.headers.authorization

  if (Authorization && Authorization.startsWith('Bearer')) {
    // Extract JWT token from 'Authorization' header
    const token = Authorization.split(' ')[1]

    // Verify JWT token using secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // If token verification fails, return Unauthorized error
        return next(new HttpError('Unauthorized. Invalid token', 403))
      }

      // Attach decoded user information to request object
      req.user = decoded

      // Call the next middleware or route handler
      next()
    })
  } else {
    // If 'Authorization' header is missing or invalid, return Unauthorized error
    return next(new HttpError('Unauthorized. No token', 402))
  }
}

module.exports = authMiddleware
