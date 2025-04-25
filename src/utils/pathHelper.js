/**
 * Helper utility for path manipulation and validation
 */

const PathHelper = {
  /**
   * Check if a path is relative
   * @param {string} path - Path to check
   * @returns {boolean} - True if path is relative, false otherwise
   */
  isRelative: (path) => {
    if (!path) return false;
    // Check if path starts with / or protocol (http://, https://, etc)
    return !path.startsWith('/') && !path.match(/^[a-zA-Z]+:\/\//); 
  },

  /**
   * Resolve a path against a base path
   * @param {string} path - Path to resolve
   * @param {Object} options - Resolution options
   * @param {string} options.basePath - Base path to resolve against
   * @returns {string} - Resolved path
   */
  resolve: (path, { basePath = '' } = {}) => {
    if (!path) return basePath;
    if (!PathHelper.isRelative(path)) return path;
    
    // Remove trailing slash from base and leading slash from path
    const normalizedBase = basePath.replace(/\/$/, '');
    const normalizedPath = path.replace(/^\//, '');
    
    return `${normalizedBase}/${normalizedPath}`;
  },

  /**
   * Join multiple path segments
   * @param {...string} segments - Path segments to join
   * @returns {string} - Joined path
   */
  join: (...segments) => {
    return segments
      .filter(Boolean)
      .map(segment => segment.replace(/^\/|\/$/g, ''))
      .join('/');
  }
};

module.exports = PathHelper;