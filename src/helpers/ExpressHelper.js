const path = require("path");
const fs = require("fs");
const logger = require("./LogHelper");

class ExpressHelper {
  constructor(app) {
    this.app = app;
    this.middlewares = [];
    this.routes = new Map();
  }

  // Add middleware to the application
  use(middleware) {
    this.middlewares.push(middleware);
    this.app.use(middleware);
    return this;
  }

  // wrapMiddleware
  wrapMiddleware(middleware) {
    return (req, res) => {
      return new Promise((resolve, reject) => {
        middleware(req, res, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    };
  }

  // Register a route group with prefix
  group(prefix, callback) {
    const currentRoutes = new Map();
    callback({
      get: (path, ...handlers) =>
        this.registerRoute("get", prefix + path, handlers),
      post: (path, ...handlers) =>
        this.registerRoute("post", prefix + path, handlers),
      put: (path, ...handlers) =>
        this.registerRoute("put", prefix + path, handlers),
      delete: (path, ...handlers) =>
        this.registerRoute("delete", prefix + path, handlers),
    });
    this.routes.set(prefix, currentRoutes);
    return this;
  }

  // Register individual route
  registerRoute(method, path, handlers) {
    this.app[method](path, ...handlers);
    this.routes.get(path)?.set(method, handlers);
    return this;
  }

  // Load routes dynamically from a directory
  async loadRoutes(directory) {
    try {
      const files = await fs.readdir(directory);
      for (const file of files) {
        if (file.endsWith(".js")) {
          const route = require(path.join(directory, file));
          if (typeof route === "function") {
            route(this);
          }
        }
      }
    } catch (error) {
      console.error("Error loading routes:", error);
    }
  }

  cleanRoutePath(routePath) {
    return routePath
      .replace(/\\\//g, "/")
      .replace(/\(\?:\\\/\)\?/g, "")
      .replace(/\(\?\=\/\|\$\)/g, "")
      .replace(/\^|\$|\?/g, "")
      .replace(/\/{2,}/g, "/");
  }

  getRoutes(stack, parentPath = "") {
    let routes = [];

    stack.forEach((layer) => {
      if (layer.route) {
        let routePath = parentPath + layer.route.path;
        const methods = Object.keys(layer.route.methods).map((m) =>
          m.toUpperCase()
        );
        routePath = routePath.replace(/\/{2,}/g, "/");
        routes.push({ path: this.cleanRoutePath(routePath), methods });
      } else if (
        layer.name === "router" &&
        layer.handle &&
        layer.handle.stack
      ) {
        const routerPath =
          parentPath + this.cleanRoutePath(layer.regexp.source);
        routes = routes.concat(this.getRoutes(layer.handle.stack, routerPath));
      }
    });

    return routes;
  }

  groupRoutesInFolders(routes) {
    const tree = {};
    routes.forEach((route) => {
      const segments = route.path.split("/").filter(Boolean);
      let node = tree;
      segments.forEach((seg, index) => {
        if (index === segments.length - 1) {
          if (!node.__requests__) node.__requests__ = [];
          node.__requests__.push(route);
        } else {
          if (!node[seg]) node[seg] = {};
          node = node[seg];
        }
      });
    });
    return tree;
  }

  convertTreeToPostmanItems(tree) {
    const items = [];
    for (const key in tree) {
      if (key === "__requests__") {
        tree[key].forEach((route) => {
          items.push({
            name: `${route.methods.join(", ")} ${route.path}`,
            request: {
              method: route.methods[0],
              header: [],
              body: { mode: "raw", raw: "" },
              url: {
                protocol: "http",
                host: ["{{base_url}}"],
                path: route.path.split("/").filter(Boolean),
              },
            },
          });
        });
      } else {
        items.push({
          name: key,
          item: this.convertTreeToPostmanItems(tree[key]),
        });
      }
    }
    return items;
  }

  generatePostmanCollection(routes, collectionName) {
    const tree = this.groupRoutesInFolders(routes);
    const items = this.convertTreeToPostmanItems(tree);
    return {
      info: {
        name: collectionName || "API Collection",
        description: "Postman collection generated from Express routes.",
        schema:
          "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      item: items,
    };
  }

  extractRoutesFromServer({ app = this.app, collectionName }) {
    if (app && app._router) {
      const allRoutes = this.getRoutes(app._router.stack);
      allRoutes.forEach((route) =>
        console.log(`${route.methods.join(", ")} ${route.path}`)
      );
      const collection = this.generatePostmanCollection(
        allRoutes,
        collectionName
      );
      const collectionPath = path.join(
        process.cwd(),
        `${collectionName || "postman-collection"}.json`
      );
      fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
      console.log(`Postman collection generated: ${collectionPath}`);
    }
  }

  /**
   * Recursively registers routes on the provided Express app.
   * @param {object} app - The Express application instance.
   * @param {Array} routes - An array of route configuration objects.
   * @param {string} parentPath - The accumulated parent path for nested routes.
   */
  registerRoutes(routes, parentPath = "") {
    const app = this.app;
    if (!Array.isArray(routes)) {
      throw new Error("Routes must be provided as an array.");
    }

    routes.forEach((route) => {
      // Validate the route object.
      if (!route || typeof route !== "object") {
        throw new Error("Each route must be an object.");
      }

      // Normalize the full path to avoid duplicate slashes.
      // Remove any trailing slash from parentPath and leading slash from route.path,
      // then join them with a single slash.
      let currentPath = `${parentPath.replace(/\/$/, "")}/${(
        route.path || "/"
      ).replace(/^\//, "")}`;
      // Ensure that the root path is correctly set to '/'.
      currentPath = currentPath === "" ? "/" : currentPath;

      // Normalize middlewares: if provided, ensure they are an array of functions.
      let middlewares = [];
      if (route.middlewares) {
        if (Array.isArray(route.middlewares)) {
          middlewares = route.middlewares;
        } else if (typeof route.middlewares === "function") {
          middlewares = [route.middlewares];
        } else {
          throw new Error(
            "Middlewares must be a function or an array of functions."
          );
        }
        // Validate each middleware is a function.
        middlewares.forEach((mw, idx) => {
          if (typeof mw !== "function") {
            throw new Error(
              `Middleware at index ${idx} in route "${currentPath}" is not a function.`
            );
          }
        });
      }

      // If a router is provided, validate it and register with any middlewares.
      if (route.router) {
        if (typeof route.router !== "function") {
          throw new Error(
            `Router for path "${currentPath}" must be a function (an Express router).`
          );
        }
        logger.info(
          `Registering router for path "${currentPath}" with middlewares.`
        );
        console.log(route);
        if (middlewares.length > 0) {
          app.use(currentPath, ...middlewares, route.router);
        } else {
          app.use(currentPath, route.router);
        }
      } else if (middlewares.length > 0) {
        // If no router is provided but middlewares are, register them.
        app.use(currentPath, ...middlewares);
      }

      // Recursively register child routes if provided.
      if (route.children) {
        if (!Array.isArray(route.children)) {
          throw new Error(
            `"children" for path "${currentPath}" must be an array.`
          );
        }
        this.registerRoutes(route.children, currentPath);
      }
    });
  }
}

module.exports = ExpressHelper;
/* Usage Examples:

// Initialize ExpressHelper with Express app instance
const express = require('express');
const app = express();
const expressHelper = new ExpressHelper(app);

// Add middleware
expressHelper
  .use(express.json())
  .use(express.urlencoded({ extended: true }));

// Create route groups
expressHelper.group('/api/v1', (router) => {
  // User routes
  router.get('/users', userController.getAll);
  router.post('/users', userController.create);
  
  // Auth routes
  router.post('/auth/login', authController.login);
  router.post('/auth/register', authController.register);
});

// Register individual routes
expressHelper.registerRoute('get', '/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get all registered routes
const routes = expressHelper.getRoutes();

// Load routes dynamically from a directory
await expressHelper.loadRoutes('./routes');

/* Routes Directory Structure:

/routes
  ├── auth.route.js      // Authentication related routes
  ├── user.route.js      // User management routes
  ├── product.route.js   // Product related routes
  └── example.route.js   // Example route structure

Each route file should:
1. Export a function that accepts the ExpressHelper instance
2. Use the group() method to create route groups with common prefixes
3. Implement proper middleware for authentication and validation
4. Use controller methods for route handlers
5. Include clear comments and documentation

See the example.route.js file for a detailed implementation example.
*/
