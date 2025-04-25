const express = require("express");
const { permissionMiddleware } = require("../permission/permission.middleware");
const { ResponseHelper, RequestHelper } = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");
const Models = require("../../models");

const router = express.Router();

router.get(
  "/:model?",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Schema,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const modelName = requestHelper.params("model");

      if (modelName) {
        // Return schema for specific model
        const Model = Models[modelName];
        if (!Model) {
          return responseHelper
            .status(404)
            .error({
              ...ErrorMap.NOT_FOUND,
              message: `Model '${modelName}' not found`,
            })
            .send();
        }
        const schema = Model.schema();
        return responseHelper.body({ schema }).send();
      }

      // Return schemas for all models
      const schemas = {};
      for (const [name, Model] of Object.entries(Models)) {
        schemas[name] = Model.schema();
      }
      return responseHelper.body({ schemas }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;