class DataHelper {
  // Convert a data URL to a Buffer
  static dataURLtoBuffer(dataURL) {
    if (!dataURL) return null;
    
    try {
      const matches = dataURL.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid data URL format');
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      return {
        buffer,
        mimeType
      };
    } catch (error) {
      console.error('Error converting data URL to buffer:', error);
      return null;
    }
  }

  // Convert a file to buffer
  static async fileToBuffer(file) {
    try {
      return Buffer.from(await file.arrayBuffer());
    } catch (error) {
      console.error('Error converting file to buffer:', error);
      return null;
    }
  }

  // Convert buffer to base64
  static bufferToBase64(buffer) {
    try {
      return buffer.toString('base64');
    } catch (error) {
      console.error('Error converting buffer to base64:', error);
      return null;
    }
  }

  // Convert base64 to buffer
  static base64ToBuffer(base64String) {
    try {
      return Buffer.from(base64String, 'base64');
    } catch (error) {
      console.error('Error converting base64 to buffer:', error);
      return null;
    }
  }

  // Get mime type from data URL
  static getMimeTypeFromDataURL(dataURL) {
    try {
      const matches = dataURL.match(/^data:([A-Za-z-+\/]+);base64,/);
      if (!matches) return null;
      return matches[1];
    } catch (error) {
      console.error('Error extracting mime type:', error);
      return null;
    }
  }
}

module.exports = DataHelper;