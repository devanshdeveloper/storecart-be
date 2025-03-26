const multer = require("multer");
const path = require("path");

class FileUploadHelper {
  constructor() {
    this.defaultConfig = {
      maxSize: 5 * 1024 * 1024, // 5MB default
      allowedImageTypes: ["image/jpeg", "image/png", "image/gif"],
      allowedDocumentTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    };
  }

  /**
   * Configure multer for image uploads
   * @param {Object} options - Custom configuration options
   * @param {number} options.maxSize - Maximum file size in bytes
   * @param {string[]} options.allowedTypes - Array of allowed mime types
   * @returns {Object} Configured multer middleware
   */
  configureImageUpload(options = {}) {
    const config = {
      maxSize: options.maxSize || this.defaultConfig.maxSize,
      allowedTypes: options.allowedTypes || this.defaultConfig.allowedImageTypes,
    };

    return multer({
      storage: multer.memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (config.allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              `Invalid file type. Only ${config.allowedTypes
                .map((type) => type.split("/")[1].toUpperCase())
                .join(", ")} are allowed.`
            )
          );
        }
      },
      limits: {
        fileSize: config.maxSize,
      },
    });
  }

  /**
   * Configure multer for document uploads
   * @param {Object} options - Custom configuration options
   * @param {number} options.maxSize - Maximum file size in bytes
   * @param {string[]} options.allowedTypes - Array of allowed mime types
   * @returns {Object} Configured multer middleware
   */
  configureDocumentUpload(options = {}) {
    const config = {
      maxSize: options.maxSize || 10 * 1024 * 1024, // 10MB default for documents
      allowedTypes: options.allowedTypes || this.defaultConfig.allowedDocumentTypes,
    };

    return multer({
      storage: multer.diskStorage(),
      fileFilter: (req, file, cb) => {
        if (config.allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              `Invalid file type. Only ${config.allowedTypes
                .map((type) => type.split("/")[1].toUpperCase())
                .join(", ")} are allowed.`
            )
          );
        }
      },
      limits: {
        fileSize: config.maxSize,
      },
    });
  }

  /**
   * Get file extension from mimetype
   * @param {string} mimetype - File mimetype
   * @returns {string} File extension
   */
  getFileExtension(mimetype) {
    return mimetype.split("/")[1];
  }

  /**
   * Generate unique filename
   * @param {string} originalname - Original file name
   * @param {string} mimetype - File mimetype
   * @returns {string} Unique filename
   */
  generateUniqueFilename(originalname, mimetype) {
    const timestamp = Date.now();
    const extension = this.getFileExtension(mimetype);
    const sanitizedName = originalname
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .substring(0, 50);
    return `${sanitizedName}-${timestamp}.${extension}`;
  }

  /**
   * Validate file size
   * @param {number} fileSize - File size in bytes
   * @param {number} maxSize - Maximum allowed size in bytes
   * @returns {boolean} Is file size valid
   */
  validateFileSize(fileSize, maxSize) {
    return fileSize <= maxSize;
  }

  /**
   * Format file size to human readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  }
}

module.exports = FileUploadHelper;