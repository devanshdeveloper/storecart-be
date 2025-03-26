const ErrorMap = require("../constants/ErrorMap");

class ExpressValidator {
  constructor() {
    this.rules = {};
  }

  // Required field validation
  required(message = "Field is required") {
    return {
      type: "required",
      validate: (value) =>
        value !== undefined && value !== null && value !== "",
      message,
    };
  }

  // String validation
  string(message = "Must be a string") {
    return {
      type: "string",
      validate: (value) => typeof value === "string",
      message,
    };
  }

  // Boolean validation
  boolean(message = "Must be a boolean") {
    return {
      type: "boolean",
      validate: (value) => typeof value === "boolean",
      message,
    };
  }

  // Validate rules against a value
  _validateRules(value, rules) {
    const ruleArray = Array.isArray(rules) ? rules : [rules];
    for (const rule of ruleArray) {
      if (!rule.validate(value)) return false;
    }
    return true;
  }

  // Array validation with optional schema for array elements
  array(schemaOrMessage = "Must be an array", message = "Must be an array") {
    const isSchema = typeof schemaOrMessage === "object";
    const finalMessage = isSchema ? message : schemaOrMessage;

    return {
      type: "array",
      validate: (value) => {
        if (!Array.isArray(value)) return false;
        if (!isSchema) return true;

        // Validate each array element against the schema
        const errors = [];
        value.forEach((item, index) => {
          for (const [field, rules] of Object.entries(schemaOrMessage)) {
            const ruleArray = Array.isArray(rules) ? rules : [rules];
            if (!this._validateRules(item[field], rules)) {
              errors.push({
                index,
                field,
                message: ruleArray[0].message,
              });
            }
          }
        });
        return errors.length === 0;
      },
      message: (value) => {
        if (!Array.isArray(value)) return finalMessage;
        if (!isSchema) return finalMessage;

        const errors = [];
        value.forEach((item, index) => {
          for (const [field, rules] of Object.entries(schemaOrMessage)) {
            const ruleArray = Array.isArray(rules) ? rules : [rules];
            if (!this._validateRules(item[field], rules)) {
              errors.push(`Item ${index}: ${field} - ${ruleArray[0].message}`);
            }
          }
        });
        return errors.length > 0 ? errors.join("; ") : finalMessage;
      },
    };
  }

  // Object validation
  object(message = "Must be an object") {
    return {
      type: "object",
      validate: (value) => typeof value === "object" && value !== null,
      message,
    };
  }

  enum(enumArray, message = "Must be one of the allowed values") {
    return {
      type: "enum",
      validate: (value) => enumArray.includes(value),
      message,
    };
  }

  // Number validation
  number(message = "Must be a number") {
    return {
      type: "number",
      validate: (value) => typeof value === "number" && !isNaN(value),
      message,
    };
  }

  // Email validation
  email(message = "Invalid email format") {
    return {
      type: "email",
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message,
    };
  }

  // Min length validation
  minLength(min, message = `Must be at least ${min} characters long`) {
    return {
      type: "minLength",
      validate: (value) => String(value).length >= min,
      message,
    };
  }

  // Max length validation
  maxLength(max, message = `Must be no more than ${max} characters long`) {
    return {
      type: "maxLength",
      validate: (value) => String(value).length <= max,
      message,
    };
  }

  // min
  min(min, message = `Must be at least ${min}`) {
    return {
      type: "min",
      validate: (value) => value >= min,
      message,
    };
  }
  // max
  max(max, message = `Must be no more than ${max}`) {
    return {
      type: "max",
      validate: (value) => value <= max,
      message,
    };
  }

  // min max
  minMax(min, max, message = `Must be between ${min} and ${max}`) {
    return {
      type: "minMax",
      validate: (value) => value >= min && value <= max,
      message,
    };
  }

  matches(regex, message = "Invalid format") {
    return {
      type: "matches",
      validate: (value) => regex.test(value),
      message,
    };
  }

  // Custom validation rule
  custom(validatorFn, message = "Validation failed") {
    return {
      type: "custom",
      validate: validatorFn,
      message,
    };
  }

  // Validate request data
  async validate(schema) {
    const errors = [];

    for (const [location, fields] of Object.entries(schema)) {
      for (const [field, rules] of Object.entries(fields)) {
        const value = this._getValue(location, field);

        if (!this._validateRules(value, rules)) {
          const ruleArray = Array.isArray(rules) ? rules : [rules];
          errors.push({
            ...ErrorMap.VALIDATION_ERROR,
            field: field,
            message: ruleArray[0].message,
          });
        }
      }
    }

    return Object.keys(errors).length === 0 ? null : errors;
  }

  // Get value from request based on location (body, query, params)
  _getValue(location, field) {
    switch (location) {
      case "body":
        return this.req?.body?.[field];
      case "query":
        return this.req?.query?.[field];
      case "params":
        return this.req?.params?.[field];
      default:
        return undefined;
    }
  }

  // Set request object
  setRequest(req) {
    this.req = req;
    return this;
  }

  idValidatorMiddleware(field = "params") {
    return (req, res, next) => {
      const id = req[field].id;
      if (!id || id.length !== 24) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      next();
    };
  }

  // Add more validation methods as needed
  // Example: Custom validation rule for checking if a field is a valid URL
  url(message = "Invalid URL format") {
    return {
      type: "url",
      validate: (value) => /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(value),
      message,
    };
  }
  // Example: Custom validation rule for checking if a field is a valid date
  date(message = "Invalid date format") {
    return {
      type: "date",
      validate: (value) => !isNaN(new Date(value)),
      message,
    };
  }

  // Example: Custom validation rule for checking if a field is a valid phone number
  phone(message = "Invalid phone number format") {
    return {
      type: "phone",
      validate: (value) => /^\d{10}$/.test(value),
      message,
    };
  }

  // Example: Custom validation rule for checking if a field is a valid credit card number
  creditCard(message = "Invalid credit card number format") {
    return {
      type: "creditCard",
      validate: (value) => /^\d{16}$/.test(value),
      message,
    };
  }

  // Example: Custom validation rule for checking if a field is a valid IP address
  ip(message = "Invalid IP address format") {
    return {
      type: "ip",
      validate: (value) => /^(?:\d{1,3}\.){3}\d{1,3}$/.test(value),
      message,
    };
  }

  // Example: Custom validation rule for checking if a field is a valid hex color code
  hexColor(message = "Invalid hex color format") {
    return {
      type: "hexColor",
      validate: (value) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value),
      message,
    };
  }
}

module.exports = {
  default: ExpressValidator,
  validator: new ExpressValidator(),
  idValidatorMiddleware: new ExpressValidator().idValidatorMiddleware,
};

/* Usage Examples:

// Initialize ExpressValidator
const validator = new ExpressValidator();

// Define validation schema
const userSchema = {
  body: {
    email: [
      validator.required('Email is required'),
      validator.email('Invalid email format')
    ],
    password: [
      validator.required('Password is required'),
      validator.string('Password must be a string'),
      validator.minLength(8, 'Password must be at least 8 characters'),
      validator.maxLength(32, 'Password must not exceed 32 characters')
    ],
    age: [
      validator.number('Age must be a number'),
      validator.custom(value => value >= 18, 'Must be 18 or older')
    ]
  }
};

// Use in Express middleware
app.post('/users', async (req, res, next) => {
  const validator = new ExpressValidator();
  validator.setRequest(req);

  const errors = await validator.validate(userSchema);
  if (errors) {
    return res.status(400).json({ errors });
  }

  // Proceed with request handling
  next();
});

// Custom validation example
const passwordMatchRule = validator.custom(
  value => value === req.body.password,
  'Passwords do not match'
);

const confirmPasswordSchema = {
  body: {
    confirmPassword: [validator.required(), passwordMatchRule]
  }
};
*/
