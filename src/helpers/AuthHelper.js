const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const RequestHelper = require("./RequestHelper");
const EncryptionHelper = require("./EncryptionHelper");
const ResponseHelper = require("./ResponseHelper");
const { ErrorMap, UserTypes } = require("../constants");

class AuthHelper {
  constructor(options = {}) {
    this.jwtSecret =
      options.jwtSecret || process.env.JWT_SECRET || "your-secret-key";
    this.jwtExpiresIn = options.jwtExpiresIn || "1d";
    this.saltRounds = options.saltRounds || 8;
    this.encryptionHelper = new EncryptionHelper(options);
  }

  // Generate JWT token
  generateToken(payload) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn });
  }

  generateUserToken(user) {
    let data = {
      _id: user._id,
      type: user.type,
      email: user.email,
    };

    return this.generateToken(data);
  }
  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  // Extract token from request header using RequestHelper
  extractTokenFromHeader(req) {
    const requestHelper = new RequestHelper(req);
    return requestHelper.getBearerToken();
  }

  // Hash password with additional encryption
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(password, salt);
  }

  // Compare password with hash using enhanced security
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  // Create authentication middleware
  authenticate() {
    return async (req, res, next) => {
      const responseHelper = new ResponseHelper(res);
      try {
        const token = this.extractTokenFromHeader(req);

        if (!token) {
          return responseHelper.error(ErrorMap.JWT_MISSING).send();
        }

        const decoded = this.verifyToken(token);
        req.user = decoded;
        next();
      } catch (error) {
        return responseHelper.error(ErrorMap.JWT_INVALID).send();
      }
    };
  }

  // Refresh token
  refreshToken(oldToken) {
    try {
      const decoded = this.verifyToken(oldToken);
      delete decoded.iat;
      delete decoded.exp;
      return this.generateToken(decoded);
    } catch (error) {
      throw new Error("Invalid token for refresh");
    }
  }

  blacklistToken(token) {}
}

module.exports = AuthHelper;

/* Usage Examples:

// Initialize AuthHelper
const authHelper = new AuthHelper({
  jwtSecret: 'your-secret-key',
  jwtExpiresIn: '1d',
  saltRounds: 12
});

// User Authentication Flow
// 1. Hash password during user registration
const hashedPassword = await authHelper.hashPassword('userPassword123');

// 2. Compare password during login
const isMatch = await authHelper.comparePassword('userPassword123', hashedPassword);

// 3. Generate JWT token after successful login
const token = authHelper.generateToken({ userId: '123', role: 'admin' });

// 4. Verify token
const decoded = authHelper.verifyToken(token);

// Using Middleware
// 1. Protect routes with authentication
app.get('/protected', authHelper.authenticate(), (req, res) => {
  // Access authenticated user via req.user
  res.json({ user: req.user });
});

// 2. Add role-based authorization
app.get('/admin-only', 
  authHelper.authenticate(), 
  authHelper.authorize('admin'), 
  (req, res) => {
    res.json({ message: 'Admin access granted' });
});

// Token Management
// 1. Extract token from request
const token = authHelper.extractTokenFromHeader(req);

// 2. Refresh expired token
const newToken = authHelper.refreshToken(oldToken);
*/
