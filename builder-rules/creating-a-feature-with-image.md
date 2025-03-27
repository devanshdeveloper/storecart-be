# Creating a Feature with Image Upload

## Setup Requirements

### 1. File Structure
Create these files if they don't exist:
- `server/src/features/[feature]/[feature].model.js`
- `server/src/features/[feature]/[feature].route.js`

### 2. Required Imports

```javascript
// import express
const express = require("express");
const router = express.Router();

// import middlewares
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");

// import helpers
const {
  ResponseHelper,
  RequestHelper,
  validator,
  FileUploadHelper,
  FileSystemHelper,
} = require("../../helpers");

// import constants
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");

// import models
const { YourModel } = require("../../models");
```

### 3. Configure File Upload

```javascript
const upload = new FileUploadHelper().configureImageUpload({
  destination: (req, file) => {
    return `uploads/${req.user._id}/[feature]/`;
  },
});
```

## Route Implementation

### Create Route (/create-one)

```javascript
router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.YourModule,
  }),
  upload.single("image"),  // Handle single image upload
  validatorMiddleware({
    body: {
      name: [validator.required(), validator.string(), validator.minLength(2)],
      description: [validator.string()],
      // Add other validation rules
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      const item = await YourModel.create({
        ...body,
        image: requestHelper.getFilePath(),  // Get uploaded image path
        user: req.user._id,
      });
      return responseHelper.status(201).body(item).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);
```

### Update Route (/update-one/:id)

```javascript
router.put(
  "/update-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.UPDATE,
    Modules: Modules.YourModule,
  }),
  upload.single("image"),  // Handle image update
  validatorMiddleware({
    body: {
      name: [validator.string(), validator.minLength(2)],
      description: [validator.string()],
      // Add other validation rules
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const body = requestHelper.body();
      const imagePath = requestHelper.getFilePath();
      
      // Prepare updates
      const updates = { ...body, user: req.user._id };
      if (imagePath) {
        updates.image = imagePath;
      }

      // Find and update document
      const oldDoc = await YourModel.findByIdAndUpdate(
        id,
        updates,
        { new: false }
      );

      // Delete old image if new one was uploaded
      if (imagePath && oldDoc.image) {
        await FileSystemHelper.removeImage(oldDoc.image);
      }

      if (!oldDoc) {
        return responseHelper.status(404).error(ErrorMap.NOT_FOUND).send();
      }

      return responseHelper.body(oldDoc).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);
```

### Delete Route (/delete-one/:id)

```javascript
router.delete(
  "/delete-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.DELETE,
    Modules: Modules.YourModule,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const doc = await YourModel.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );

      if (!doc) {
        return responseHelper.status(404).error(ErrorMap.NOT_FOUND).send();
      }

      // Clean up image when deleting document
      if (doc.image) {
        await FileSystemHelper.removeImage(doc.image);
      }

      return responseHelper.body(doc).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);
```

### Other Required Routes

#### 1. Read One Route (/read-one/:id)
Implement this route following the standard pattern shown in the base feature guide.

#### 2. Paginate Route (/paginate)

```javascript
router.get(
  "/paginate",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.YourModule,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      // Get paginated data with user-specific filter
      const data = await YourModel.paginate(
        { deletedAt: null, user: req.user._id },
        requestHelper.getPaginationParams()
      );

      // Return paginated response with data and metadata
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

#### 3. Dropdown Route (/dropdown)

```javascript
router.get(
  "/dropdown",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.YourModule,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      // Get dropdown data with optimized field selection
      const data = await YourModel.dropdown(
        { deletedAt: null, user: req.user._id },
        requestHelper.getPaginationParams()
      );

      // Return dropdown items with pagination metadata
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

## Image Upload Guidelines

1. **File Upload Configuration**
   - Use `FileUploadHelper` for handling image uploads
   - Configure proper destination paths using user ID
   - Set appropriate file size limits and types

2. **Image Storage**
   - Store images in user-specific folders: `uploads/${userId}/[feature]/`
   - Save relative image paths in the database
   - Use `FileSystemHelper` for image cleanup

3. **Best Practices**
   - Always validate file types and sizes
   - Clean up old images when updating
   - Remove images when deleting documents
   - Handle file upload errors gracefully

4. **Error Handling**
   - Validate file existence before operations
   - Handle file system errors appropriately
   - Return meaningful error messages

## Response Handling

1. **Success Response**
```javascript
return responseHelper
  .status(201)
  .body(data)
  .send();
```

2. **Error Response**
```javascript
return responseHelper.error(error).send();
```

3. **Custom Error Response**
```javascript
return responseHelper
  .status(400)
  .error({
    ...ErrorMap.DUPLICATE_ENTRY,
    message: "Custom error message",
  })
  .send();
```