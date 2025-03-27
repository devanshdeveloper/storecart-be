1. read server/src/features/[feature]/[feature].model.js (create if not exists).
2. read server/src/features/[feature]/[feature].route.js (create if not exists).
3. required imports

```js
// import express
const express = require("express");

// import middlewares
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");

// import models
const { User } = require("../../models");

// import helpers
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");

// import constants
const { ErrorMap, UserTypes } = require("../../constants"); 
```

4. possible imports
READ : server\src\helpers\index.js
READ : server\src\constants\index.js

5. defining a route
here are the required middlewares

NOTE FOR VALIDATOR MIDDLEWARE
DO NOT REPEAT VALIDATION DONE IN MODEL. LET MONGOOSE HANDLE THE VALIDATION FOR MODELS
```js
  permissionMiddleware(
    {
      UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
      Operations: Operations.CRUD,
      Modules: Modules.Teachers,
      Counter: (req) => {
        return Teacher.countDocuments({ user: req.user._id });
      },
    },
      validatorMiddleware({
    body: {
      name: [
        validator.required(),
        validator.string(),
        validator.minLength(2),
        validator.maxLength(50),
      ],
      email: [validator.required(), validator.string(), validator.email()],
      password: [
        validator.required(),
        validator.string(),
        validator.minLength(8),
      ],
      type: [validator.required(), validator.string()],
    },
  }),
```
start by initiating the helpers
```js
const requestHelper = new RequestHelper(req);
const responseHelper = new ResponseHelper(res);
```
daily methods
```js
const body = requestHelper.body();
const params = requestHelper.params(field,defaultValue);
const query = requestHelper.query(field,defaultValue);
```
send a response like this
```js
      return responseHelper
        .status(201)
        .body(data)
        .send();
```

send a error response like this
return responseHelper.error(error).send();

custom error response 
      return responseHelper
          .status(400)
          .error({
            ...ErrorMap.DUPLICATE_ENTRY,
            message: "Email already exists",
          })
          .send();

6. Required routes
/create-one
/read-one/:id
/paginate
```js
    const data = await Plan.paginate(
      { sort: { price: 1 } , filter : {}},
      requestHelper.getPaginationParams(),
    );
    return responseHelper.body({ plans: data.data }).paginate(data.meta).send();
```
/dropdown
    const data = await Plan.dropdown(
      { sort: { price: 1 } , select : "name"},
      requestHelper.getPaginationParams(),
    );
    return responseHelper.body({ plans: data.data }).paginate(data.meta).send();
/update-one
/delete-one
