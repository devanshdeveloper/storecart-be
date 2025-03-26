const crypto = require('crypto');

class EncryptionHelper {
  constructor(options = {}) {
    this.algorithm = options.algorithm || 'aes-256-gcm';
    this.secretKey = options.secretKey || process.env.ENCRYPTION_KEY || crypto.randomBytes(32);
    this.ivLength = 16;
    this.saltLength = 64;
    this.tagLength = 16;
  }

  // Generate random bytes
  generateRandomBytes(length) {
    return crypto.randomBytes(length);
  }

  // Generate key from password using PBKDF2
  async generateKey(password, salt) {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 32, 'sha512', (err, key) => {
        if (err) reject(err);
        resolve(key);
      });
    });
  }

  // Encrypt data
  async encrypt(data) {
    try {
      const iv = this.generateRandomBytes(this.ivLength);
      const salt = this.generateRandomBytes(this.saltLength);
      const key = await this.generateKey(this.secretKey, salt);

      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      const encrypted = Buffer.concat([
        cipher.update(typeof data === 'string' ? data : JSON.stringify(data), 'utf8'),
        cipher.final()
      ]);

      const tag = cipher.getAuthTag();

      return {
        encrypted: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        salt: salt.toString('base64'),
        tag: tag.toString('base64')
      };
    } catch (error) {
      throw new Error('Encryption failed: ' + error.message);
    }
  }

  // Decrypt data
  async decrypt(encryptedData) {
    try {
      const { encrypted, iv, salt, tag } = encryptedData;
      const key = await this.generateKey(
        this.secretKey,
        Buffer.from(salt, 'base64')
      );

      const decipher = crypto.createDecipheriv(
        this.algorithm,
        key,
        Buffer.from(iv, 'base64')
      );

      decipher.setAuthTag(Buffer.from(tag, 'base64'));

      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encrypted, 'base64')),
        decipher.final()
      ]);

      const decryptedText = decrypted.toString('utf8');
      try {
        return JSON.parse(decryptedText);
      } catch {
        return decryptedText;
      }
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message);
    }
  }

  // Hash data
  hash(data, algorithm = 'sha256') {
    return crypto
      .createHash(algorithm)
      .update(data)
      .digest('hex');
  }

  // Generate secure random string
  generateSecureString(length = 32) {
    return crypto
      .randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  // Compare hash
  compareHash(data, hash, algorithm = 'sha256') {
    return this.hash(data, algorithm) === hash;
  }
}

module.exports = EncryptionHelper;

/* Usage Examples:

// Initialize EncryptionHelper
const encryptionHelper = new EncryptionHelper({
  algorithm: 'aes-256-gcm',
  secretKey: process.env.ENCRYPTION_KEY // or provide your own secret key
});

// Data Encryption
// 1. Encrypt sensitive data
const data = { userId: 123, email: 'user@example.com' };
const encrypted = await encryptionHelper.encrypt(data);
// encrypted = { encrypted: 'base64...', iv: 'base64...', salt: 'base64...', tag: 'base64...' }

// 2. Decrypt data
const decrypted = await encryptionHelper.decrypt(encrypted);
// decrypted = { userId: 123, email: 'user@example.com' }

// Hashing Operations
// 1. Create a hash of data
const hash = encryptionHelper.hash('sensitive-data');

// 2. Compare hash
const isMatch = encryptionHelper.compareHash('sensitive-data', hash);

// Utility Functions
// 1. Generate random bytes
const randomBytes = encryptionHelper.generateRandomBytes(32);

// 2. Generate secure random string
const secureString = encryptionHelper.generateSecureString(32);

// 3. Generate key from password
const salt = encryptionHelper.generateRandomBytes(64);
const key = await encryptionHelper.generateKey('password', salt);
*/