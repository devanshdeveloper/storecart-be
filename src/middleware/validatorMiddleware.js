const ResponseHelper = require("../helpers/ResponseHelper");
const { ErrorMap } = require("../constants/ErrorMap");
const ExpressValidator = require("../helpers/ExpressValidator").default;

const validatorMiddleware = (schema) => {
  return async (req, res, next) => {
    const responseHelper = new ResponseHelper(res);
    try {
      // Initialize validator with request
      const validator = new ExpressValidator();
      validator.setRequest(req);

      // Validate request data against schema
      const errors = await validator.validate(schema);


      if (errors) {
        return responseHelper.errors(errors).send();
      }

      // If validation passes, continue to next middleware/route handler
      next();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  };
};

module.exports = validatorMiddleware;

/*
Example usage in routes:

const validatorMiddleware = require('../middleware/validatorMiddleware');
const validator = new ExpressValidator();

router.post('/example',
  validatorMiddleware({
    body: {
      name: [
        validator.required(),
        validator.string(),
        validator.minLength(2),
        validator.maxLength(50)
      ],
      email: [
        validator.required(),
        validator.email()
      ],
      age: [
        validator.required(),
        validator.number()
      ]
    },
    query: {
      filter: [validator.string()]
    }
  }),
  (req, res) => {
    // Route handler logic
  }
);
*/
