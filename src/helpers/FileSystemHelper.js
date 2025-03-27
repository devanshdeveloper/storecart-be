const fs = require("fs").promises;
const path = require("path");
const { fileTypeFromBuffer } = require("file-type");

class FileSystemHelper {
  static BASE_PATH = process.cwd();
  static UPLOAD_PATH = "uploads";

  // Helper method to ensure directory exists
  static async ensureDirectory(dirPath) {
    await fs.access(dirPath);
  }

  // Generate unique filename for uploads
  static generateUniqueFilename(originalFilename) {
    const ext = path.extname(originalFilename);
    return `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
  }

  // Get absolute path for uploads
  static getUploadPath(subPath = "") {
    return path.join(this.BASE_PATH, this.UPLOAD_PATH, subPath);
  }

  // Get relative path for uploads (for URL)
  static getUploadUrl(subPath = "") {
    return `/${this.UPLOAD_PATH}/${subPath}`.replace(/\/+/g, "/");
  }

  // Save uploaded image and return URL
  static async saveImage({ buffer, filename, path: subPath = "images" }) {
    const uniqueFilename = this.generateUniqueFilename(filename);
    const fullPath = this.getUploadPath(path.join(subPath, uniqueFilename));
    await this.createImage(fullPath, buffer);
    return this.getUploadUrl(path.join(subPath, uniqueFilename));
  }

  // Read file content
  static async readFile(filePath, encoding = "utf8") {
    return await fs.readFile(filePath, encoding);
  }

  // Create a new file with content
  static async createFile(filePath, content = "", encoding = "utf8") {
    const dirPath = path.dirname(filePath);
    await this.ensureDirectory(dirPath);
    await fs.writeFile(filePath, content, encoding);
  }

  // Update existing file content
  static async updateFile(filePath, content, encoding = "utf8") {
    await fs.access(filePath);
    return await fs.writeFile(filePath, content, encoding);
  }

  // Delete file
  static async deleteFile(filePath) {
    return await fs.unlink(filePath);
  }

  // Create directory
  static async createDirectory(dirPath) {
    return await fs.mkdir(dirPath, { recursive: true });
  }

  // Read directory contents
  static async readDirectory(dirPath) {
    return await fs.readdir(dirPath);
  }

  // Update directory (rename)
  static async updateDirectory(oldPath, newPath) {
    return await fs.rename(oldPath, newPath);
  }

  // Delete directory and its contents
  static async deleteDirectory(dirPath) {
    return await fs.rm(dirPath, { recursive: true, force: true });
  }

  // create image

  // Create image file with validation
  static async createImage(
    filePath,
    imageBuffer,
    allowedTypes = ["image/jpeg", "image/png", "image/gif"]
  ) {
    // Validate image type using file signature
    const type = await fileTypeFromBuffer(imageBuffer);

    if (!type || !allowedTypes.includes(`image/${type.ext}`)) {
      throw new Error(
        "Invalid image type. Only JPEG, PNG and GIF are allowed."
      );
    }

    const dirPath = path.dirname(filePath);
    await this.ensureDirectory(dirPath);
    await fs.writeFile(filePath, imageBuffer);
  }

  // Read image file
  static async readImage(filePath) {
    return await fs.readFile(filePath);
  }

  // Update image file with validation
  static async updateImage(
    filePath,
    imageBuffer,
    allowedTypes = ["image/jpeg", "image/png", "image/gif"]
  ) {
    // Check if file exists
    await fs.access(filePath);

    // Validate image type
    const type = await fileTypeFromBuffer(imageBuffer);

    if (!type || !allowedTypes.includes(`image/${type.ext}`)) {
      throw new Error(
        "Invalid image type. Only JPEG, PNG and GIF are allowed."
      );
    }

    await fs.writeFile(filePath, imageBuffer);
  }

  // Delete image file
  static async deleteImage(filePath) {
    await fs.unlink(filePath);
  }

  // Remove image file with validation
  static async removeImage(imagePath) {
    if (!imagePath) {
      throw new Error("Image path is required");
    }

    await this.deleteImage(imagePath);
  }
}

module.exports = FileSystemHelper;
