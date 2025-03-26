const ErrorMap = require("../constants/ErrorMap");
const SuccessMap = require("../constants/SuccessMap");
const logger = require("./LogHelper");

class ResponseHelper {
  constructor(res) {
    this.res = res;

    this.response = {
      errors: [],
      success: true,
      data: null,
      message: "",
      pagination: {},
      status: 200,
    };
    this.additionalHeaders = {};
  }

  status(code) {
    this.response.status = code;
    return this;
  }

  body(data) {
    this.response.data = data;
    return this;
  }

  message(text) {
    this.response.message = text;
    return this;
  }

  headers(headers) {
    this.additionalHeaders = {
      ...this.additionalHeaders,
      ...headers,
    };
    return this;
  }

  errors(errors) {
    errors.forEach((error) => this.error(error));
    return this;
  }

  pushError(error) {
    if (this.response.status === 200) {
      this.status(500);
    }
    this.response.success = false;
    this.response.errors.push(error);
  }

  error(errorObj) {
    // Duplicate Key Error (e.g., email already exists)
    if (errorObj.code === 11000) {
      this.status(409); // Conflict
      const duplicateField = Object.keys(errorObj.keyValue)[0];
      const duplicateValue = errorObj.keyValue[duplicateField];

      this.pushError({
        ...ErrorMap.MONGODB_DUPLICATE_KEY,
        field: duplicateField,
        message: `The ${duplicateField} '${duplicateValue}' is already registered. Please use a different ${duplicateField}.`,
      });
      return this;
    }

    // Validation Errors
    if (errorObj.name === "ValidationError") {
      this.status(422); // Unprocessable Entity
      if (errorObj.errors) {
        for (const field in errorObj.errors) {
          this.pushError({
            ...ErrorMap.VALIDATION_ERROR,
            field,
            message: errorObj.errors[field].properties.message,
          });
        }

        return this;
      }
    }

    if (errorObj.name in ErrorMap) {
      const { status } = ErrorMap[errorObj.name];
      this.status(status);
      this.pushError({ ...ErrorMap[errorObj.name], ...errorObj });
      return this;
    }

    if (this.response.errors.length === 0) {
      this.pushError({
        ...ErrorMap.INTERNAL_SERVER_ERROR,
        message: errorObj.message,
      });
      this.status(500);
      return this;
    }

    return this;
  }

  paginate(pageObj) {
    this.response.pagination = pageObj;
    return this;
  }

  send() {
    const { status, ...body } = this.response;

    // Set headers
    Object.entries(this.additionalHeaders).forEach(([key, value]) => {
      this.res.setHeader(key, value);
    });

    // Send response
    this.res.status(status).json(body);
  }
}

// Usage Examples

// Example 1: Basic Success Response
/*
const responseHelper = new ResponseHelper(res);
responseHelper
  .body({ user: { id: 1, name: 'John' } })
  .message('User retrieved successfully')
  .send();
*/

// Example 2: Error Response with ValidationError
/*
const responseHelper = new ResponseHelper(res);
responseHelper
  .error(ErrorMap.VALIDATION_FAILED)
  .send();
*/

// Example 3: Paginated Response
/*
const responseHelper = new ResponseHelper(res);
responseHelper
  .body({users})
  .paginate({
    page: 1,
    limit: 10,
    total: 100,
    pages: 10
  })
  .message('Users retrieved successfully')
  .send();
*/

// Example 4: Custom Headers
/*
const responseHelper = new ResponseHelper(res);
responseHelper
  .headers({
    'X-Custom-Header': 'custom-value',
    'Cache-Control': 'no-cache'
  })
  .body(data)
  .send();
*/

// Example 5: Handling Duplicate Key Error
/*
const responseHelper = new ResponseHelper(res);
responseHelper
  .error()
  .send();
*/

module.exports = ResponseHelper;
