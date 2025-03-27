class RequestHelper {
  constructor(req) {
    this.req = req;
  }

  // Get request body
  body(field = null, defaultValue = null) {
    if (field) {
      return this.req.body?.[field] ?? defaultValue;
    }
    return this.req.body || {};
  }

  // Get query parameters
  query(field = null, defaultValue = null) {
    if (field) {
      return this.req.query?.[field] ?? defaultValue;
    }
    return this.req.query || {};
  }

  // Get URL parameters
  params(field = null, defaultValue = null) {
    if (field) {
      return this.req.params?.[field] ?? defaultValue;
    }
    return this.req.params || {};
  }

  // Get request headers
  headers(field = null, defaultValue = null) {
    if (field) {
      return this.req.headers?.[field.toLowerCase()] ?? defaultValue;
    }
    return this.req.headers || {};
  }

  // Get uploaded files
  files(fieldName = null) {
    if (fieldName) {
      return this.req.files?.[fieldName];
    }
    return this.req.files || {};
  }

  // Get request method
  method() {
    return this.req.method;
  }

  // Get request path
  path() {
    return this.req.path;
  }

  // Get request protocol
  protocol() {
    return this.req.protocol;
  }

  // Get request hostname
  hostname() {
    return this.req.hostname;
  }

  // Get request IP address
  ip() {
    return this.req.ip;
  }

  // Check if request is HTTPS
  isSecure() {
    return this.req.secure;
  }

  // Check if request accepts a specific content type
  accepts(type) {
    return this.req.accepts(type);
  }

  // Get pagination parameters from query
  getPaginationParams(defaultLimit = 10, defaultPage = 1) {
    const page = parseInt(this.query("page", defaultPage));
    const limit = parseInt(this.query("limit", defaultLimit));
    return { page, limit };
  }

  // Get sort parameters from query
  getSortParams(defaultField = "createdAt", defaultOrder = "desc") {
    const sortField = this.query("sortBy", defaultField);
    const sortOrder = this.query("order", defaultOrder);
    return { sortField, sortOrder };
  }

  // Get search parameters from query
  getSearchParams(...fields) {
    const searchQuery = this.query("search" , "something");
    if (!searchQuery) return null;

    return fields.reduce((acc, field) => {
      acc[field] = { $regex: searchQuery, $options: "i" };
      return acc;
    }, {});
  }

  // Check if request is AJAX/XHR
  isAjax() {
    return this.headers("X-Requested-With") === "XMLHttpRequest";
  }

  // Get bearer token from Authorization header
  getBearerToken() {
    const authHeader = this.headers("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    return authHeader.substring(7);
  }

  // Get basic auth credentials
  getBasicAuthCredentials() {
    const authHeader = this.headers("authorization");
    if (!authHeader?.startsWith("Basic ")) return null;

    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    const [username, password] = credentials.split(":");

    return { username, password };
  }

  getFilePath() {
    return this.req?.file?.path?.replace(/\\/g, '/');
  }

  getFilePaths() {
    if (!this.req?.files) return [];
    return Array.isArray(this.req.files)
      ? this.req.files.map(file => file.path?.replace(/\\/g, '/'))
      : Object.values(this.req.files).flat().map(file => file.path?.replace(/\\/g, '/'));
  }
}

module.exports = RequestHelper;
