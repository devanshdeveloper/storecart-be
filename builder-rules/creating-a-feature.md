# Feature Creation Guide

## File Structure
1. Model File: `server/src/features/[feature]/[feature].model.js`
2. Route File: `server/src/features/[feature]/[feature].route.js`

## Required Imports
```js
// Express and Router
const express = require("express");
const router = express.Router();

// Middleware
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const { idValidatorMiddleware } = require("../../helpers");

// Models
const { ModelName } = require("../../models");

// Helpers
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");

// Constants
const { ErrorMap, Operations, UserTypes, Modules } = require("../../constants");
```

## Filter Function Template
```js
function makeFilter(req) {
  const { status, search, start, end } = req.query;
  const searchFields = ["name", "email"];
  const filter = {};

  if (status) {
    filter.status = status;
  }

  // Date range filter
  if (start || end) {
    filter.createdAt = {};
    if (start) filter.createdAt.$gte = new Date(start);
    if (end) filter.createdAt.$lte = new Date(end);
  }

  // Search filter
  if (search && searchFields) {
    filter.$or = searchFields.map(field => ({
      [field]: { $regex: search, $options: "i" }
    }));
  }

  return filter;
}
```

## Route Helpers
```js
const requestHelper = new RequestHelper(req);
const responseHelper = new ResponseHelper(res);

// Common Methods
const body = requestHelper.body();
const params = requestHelper.params(field, defaultValue);
const query = requestHelper.query(field, defaultValue);
```

## Required Routes

### Create One
```js
router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin],
    Operations: Operations.CREATE,
    Modules: Modules.Feature
  }),
  validatorMiddleware({
    body: {
      name: [
        validator.required(),
        validator.string(),
        validator.minLength(2)
      ]
    }
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const data = requestHelper.body();
      const result = await Model.create(data);
      return responseHelper.status(201).body(result).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);
```

### Read One
```js
router.get(
  "/read-one/:id",
  idValidatorMiddleware(),
  permissionMiddleware({
    UserTypes: [UserTypes.Admin],
    Operations: Operations.READ,
    Modules: Modules.Feature
  }),
  async (req, res) => {
    const responseHelper = new ResponseHelper(res);
    try {
      const result = await Model.findById(req.params.id);
      if (!result) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND })
          .send();
      }
      return responseHelper.body(result).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);
```

### Paginate
```js
router.get(
  "/paginate",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin],
    Operations: Operations.READ,
    Modules: Modules.Feature
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const filter = makeFilter(req);
      const data = await Model.paginate(
        filter,
        requestHelper.getPaginationParams()
      );
      return responseHelper
        .body({ items: data.data })
        .paginate(data.meta)
        .send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);
```

### Update One
```js
router.put(
  "/update-one/:id",
  idValidatorMiddleware(),
  permissionMiddleware({
    UserTypes: [UserTypes.Admin],
    Operations: Operations.UPDATE,
    Modules: Modules.Feature
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const result = await Model.findByIdAndUpdate(
        req.params.id,
        requestHelper.body(),
        { new: true }
      );
      if (!result) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND })
          .send();
      }
      return responseHelper.body(result).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);
```

### Delete One
```js
router.delete(
  "/delete-one/:id",
  idValidatorMiddleware(),
  permissionMiddleware({
    UserTypes: [UserTypes.Admin],
    Operations: Operations.DELETE,
    Modules: Modules.Feature
  }),
  async (req, res) => {
    const responseHelper = new ResponseHelper(res);
    try {
      const result = await Model.findByIdAndDelete(req.params.id);
      if (!result) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND })
          .send();
      }
      return responseHelper
        .status(200)
        .message("Successfully deleted")
        .send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);
```

### Delete Many
```js
router.delete(
  "/delete-many",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin],
    Operations: Operations.DELETE,
    Modules: Modules.Feature
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const { ids } = requestHelper.body();
      let filter = {};

      if (ids && Array.isArray(ids) && ids.length !== 0) {
        filter._id = { $in: ids };
      } else {
        filter = makeFilter(req);
      }

      const result = await Model.deleteMany(filter);

      if (result.deletedCount === 0) {
        return responseHelper
          .status(404)
          .error({
            ...ErrorMap.NOT_FOUND,
            message: "No items found"
          })
          .send();
      }

      return responseHelper
        .status(200)
        .message(`Successfully deleted ${result.deletedCount} items`)
        .send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);
```

### Export
```js
router.post(
  "/export",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin],
    Operations: Operations.READ,
    Modules: Modules.Feature
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const { ids } = requestHelper.body();
      let filter = {};

      if (ids && Array.isArray(ids) && ids.length !== 0) {
        filter._id = { $in: ids };
      } else {
        filter = makeFilter(req);
      }

      const items = await Model.find(filter);
      return responseHelper.status(200).body({ items }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);
```

module.exports = router;
