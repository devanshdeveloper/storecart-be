const { ErrorMap, UserTypes } = require("../../constants");
const {
  PermissionHelper,
  ResponseHelper,
  RequestHelper,
} = require("../../helpers");

const permissionMiddleware = (...configs) => {
  return async (req, res, next) => {
    return next();
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      // Get the user from the request (set by auth middleware)
      const user = req.user;

      if (!user) {
        return responseHelper.error({ ...ErrorMap.UNAUTHORIZED }).send();
      }

      if (user.type === UserTypes.SuperAdmin) {
        return next();
      }

      // Check if user has required permissions for any of the provided configs
      for (const config of configs) {
        const { UserTypes, Operations, Modules, Counter } = config;

        // Check if user has the required role
        if (UserTypes) {
          if (!UserTypes.includes(user.type)) {
            continue;
          }
        }

        // Validate operations and module permissions
        const hasPermission = await PermissionHelper.validatePermissions(user, {
          operations: Operations,
          modules: Modules,
        });

        // If Counter function is provided, execute it
        if (Counter && typeof Counter === "function") {
          try {
            const count = await Counter(req, res);
            req.count = count;
          } catch (error) {
            console.error("Counter function error:", error);
            continue;
          }
        }

        // if (hasPermission) {
        //   // If any config passes, proceed to the next middleware
        //   return next();
        // }
      }


      // If no config passes, return forbidden
      return responseHelper
        .error({
          ...ErrorMap.FORBIDDEN,
          message: "You dont have permission to enter here.",
        })
        .send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  };
};

module.exports = {
  permissionMiddleware,
};
