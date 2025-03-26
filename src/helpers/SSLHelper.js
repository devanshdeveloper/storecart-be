const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const logger = require("./LogHelper");

class SSLHelper {
  static SSL_DIR = path.join(process.cwd(), "ssl");
  static CERT_PATH = path.join(this.SSL_DIR, "cert.pem");
  static KEY_PATH = path.join(this.SSL_DIR, "key.pem");

  static checkOpenSSL() {
    try {
      execSync("openssl version", { stdio: "pipe" });
      logger.debug("OpenSSL check successful");
      return true;
    } catch (error) {
      logger.warn("OpenSSL is not installed or not accessible");
      return false;
    }
  }

  static async installOpenSSL() {
    const platform = process.platform;
    let installInstructions = "";

    switch (platform) {
      case "win32":
        installInstructions =
          "Download from https://slproweb.com/products/Win32OpenSSL.html";
        break;
      case "darwin":
        installInstructions = "Install using: brew install openssl";
        break;
      case "linux":
        installInstructions = "Install using: sudo apt-get install openssl";
        break;
      default:
        installInstructions = "Please install OpenSSL for your platform";
    }

    logger.error(`OpenSSL installation required - ${installInstructions}`);
  }

  static ensureSSLDir() {
    if (!fs.existsSync(this.SSL_DIR)) {
      logger.info(`Creating SSL directory at ${this.SSL_DIR}`);
      fs.mkdirSync(this.SSL_DIR, { recursive: true });
    }
  }

  static generateCertificates() {
    this.ensureSSLDir();

    if (!this.checkOpenSSL()) {
      return this.installOpenSSL();
    }

    const rootCAKey = path.join(this.SSL_DIR, "rootCA.key");
    const rootCACert = path.join(this.SSL_DIR, "rootCA.crt");

    // Generate Root CA private key
    execSync(`openssl genrsa -out "${rootCAKey}" 4096`, { stdio: "pipe" });

    // Generate Root CA certificate
    execSync(
      `openssl req -x509 -new -nodes -key "${rootCAKey}" -sha256 -days 1024 -out "${rootCACert}" ` +
        `-subj "/C=US/ST=State/L=City/O=Local Development/CN=Local Root CA"`,
      { stdio: "pipe" }
    );

    // Generate server private key
    execSync(`openssl genrsa -out "${this.KEY_PATH}" 2048`, { stdio: "pipe" });

    // Generate CSR
    const csrPath = path.join(this.SSL_DIR, "server.csr");
    execSync(
      `openssl req -new -key "${this.KEY_PATH}" -out "${csrPath}" ` +
        `-subj "/C=US/ST=State/L=City/O=Local Development/CN=localhost"`,
      { stdio: "pipe" }
    );

    // Create config file for SAN
    const configPath = path.join(this.SSL_DIR, "san.cnf");
    const configContent = [
      "[req]",
      "default_bits = 2048",
      "distinguished_name = req_distinguished_name",
      "req_extensions = v3_req",
      "x509_extensions = v3_req",
      "[req_distinguished_name]",
      "[v3_req]",
      "basicConstraints = CA:FALSE",
      "keyUsage = nonRepudiation, digitalSignature, keyEncipherment",
      "extendedKeyUsage = serverAuth",
      "subjectAltName = @alt_names",
      "[alt_names]",
      "DNS.1 = localhost",
      "IP.1 = 127.0.0.1",
    ].join("\n");
    fs.writeFileSync(configPath, configContent);

    // Sign the CSR with Root CA
    execSync(
      `openssl x509 -req -in "${csrPath}" -CA "${rootCACert}" -CAkey "${rootCAKey}" ` +
        `-CAcreateserial -out "${this.CERT_PATH}" -days 365 -sha256 ` +
        `-extfile "${configPath}" -extensions v3_req`,
      { stdio: "pipe" }
    );

    // Clean up temporary files
    fs.unlinkSync(csrPath);
    fs.unlinkSync(configPath);

    logger.info("SSL certificates generated successfully", {
      certPath: this.CERT_PATH,
      keyPath: this.KEY_PATH,
      rootCACert,
    });

    // Provide platform-specific instructions for importing the Root CA certificate
    const platformInstructions = {
      win32:
        'Windows: Double-click the Root CA certificate file, select "Install Certificate", choose "Local Machine", and place it in "Trusted Root Certification Authorities".',
      darwin:
        'macOS: Double-click the Root CA certificate file. In Keychain Access, find the certificate under "login", and set its trust settings to "Always Trust".',
      linux:
        "Linux: Import the Root CA certificate into your browser settings under Authorities/Certificates, or use system certificate manager.",
    };

    const instruction =
      platformInstructions[process.platform] ||
      "Import the Root CA certificate into your browser's trusted certificates store.";

    logger.info("SSL certificates generated successfully", {
      certPath: this.CERT_PATH,
      keyPath: this.KEY_PATH,
      rootCACert,
    });

    logger.info(
      `Important: To trust this certificate, follow these steps:\n` +
        `1. Locate the Root CA certificate at: ${rootCACert}\n` +
        `2. ${instruction}\n` +
        `3. Restart your browser to apply the changes.`
    );

    return {
      cert: this.CERT_PATH,
      key: this.KEY_PATH,
      ca: rootCACert,
    };
  }

  static getSSLConfig() {
    if (!fs.existsSync(this.CERT_PATH) || !fs.existsSync(this.KEY_PATH)) {
      logger.info("SSL certificates not found, generating new ones");
      this.generateCertificates();
    }

    return {
      cert: fs.readFileSync(this.CERT_PATH),
      key: fs.readFileSync(this.KEY_PATH),
    };
  }
}

module.exports = SSLHelper;
