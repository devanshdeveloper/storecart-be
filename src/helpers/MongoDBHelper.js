const mongoose = require("mongoose");
const logger = require("./LogHelper");

class MongoDBHelper {
  constructor(
    uri = process.env.MONGODB_URI || "mongodb://localhost:27017/storecart",
    options = {}
  ) {
    this.uri = uri;
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ...options,
    };
    this.connection = null;
  }

  async connect() {
    try {
      if (!this.connection) {
        logger.info(`🚀 Connecting to MongoDB : ${this.uri}`);
        this.connection = await mongoose.connect(this.uri, this.options);
        logger.info(`✅ Successfully connected to MongoDB!!! ${this.uri}`);
      }
      return this.connection;
    } catch (error) {
      logger.error("MongoDB connection error : ", error.message);
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        logger.info("Disconnected from MongoDB.");
      }
    } catch (error) {
      logger.error("MongoDB disconnection error:", error);
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }

  async ping() {
    try {
      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      logger.error("MongoDB ping error:", error);
      return false;
    }
  }

  // Helper method to handle MongoDB operation errors
  handleError(error) {
    logger.error("MongoDB operation error:", error);
    if (error.name === "ValidationError") {
      return new Error(`Validation Error: ${error.message}`);
    }
    if (error.code === 11000) {
      return new Error("Duplicate Key Error");
    }
    return error;
  }
  /**
   * Executes a function within a MongoDB transaction
   * @param {Function} transactionFn - Async function to execute within transaction
   * @returns {Promise} - Result of the transaction
   */
  static async executeTransaction(transactionFn) {
    const session = await mongoose.startSession();
    try {
      let result;
      await session.withTransaction(async () => {
        result = await transactionFn(session);
      });
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
  /**
   * Creates multiple documents in parallel within a transaction
   * @param {Array<{model: mongoose.Model, data: Object}>} documents - Array of model and data pairs to create
   * @param {Object} options - Additional options for the operation
   * @returns {Promise<Array>} - Array of created documents
   */
  static async createParallelDocumentsWithTransaction(
    documents,
    options = { validateBeforeSave: true }
  ) {
    if (!Array.isArray(documents) || documents.length === 0) {
      throw new Error("Documents array must not be empty");
    }

    const session = await mongoose.startSession();
    try {
      let results = [];
      await session.withTransaction(async () => {
        if (options.validateBeforeSave) {
          // Batch validate all documents before creation
          const validationPromises = documents.map(async ({ model, data }) => {
            if (!model || !data) {
              throw new Error("Each document must have both model and data");
            }
            // Use model's schema to validate without creating instance
            return model.validate(data);
          });

          await Promise.all(validationPromises);
        }

        // Create documents in parallel after validation
        const createPromises = documents.map(({ model, data }) => {
          return model.create([data], { session }).catch((error) => {
            throw new Error(`Failed to create document: ${error.message}`);
          });
        });

        const createdDocs = await Promise.all(createPromises);
        results = createdDocs.map((docs) => docs[0]);
      });

      return results;
    } catch (error) {
      logger.error("Failed to create parallel documents:", error);
      throw error;
    } finally {
      await session.endSession();
    }
  }
  /**
   * Creates multiple documents in parallel without using transactions
   * @param {Array<{model: mongoose.Model, data: Object}>} documents - Array of model and data pairs to create
   * @param {Object} options - Additional options for the operation
   * @returns {Promise<Array>} - Array of created documents
   */
  static async createParallelDocuments(
    documents,
    options = { validateBeforeSave: true }
  ) {
    if (!Array.isArray(documents) || documents.length === 0) {
      throw new Error("Documents array must not be empty");
    }

    try {
      let results = [];
      const createdDocIds = [];

      if (options.validateBeforeSave) {
        // Batch validate all documents before creation
        const validationPromises = documents.map(async ({ model, data }) => {
          if (!model || !data) {
            throw new Error("Each document must have both model and data");
          }
          // Use model's schema to validate without creating instance
          return model.validate(data);
        });

        await Promise.all(validationPromises);
      }

      // Create documents in parallel after validation
      const createPromises = documents.map(({ model, data }) => {
        return model
          .create(data)
          .then((doc) => {
            createdDocIds.push({ model, _id: doc._id });
            return doc;
          })
          .catch((error) => {
            throw new Error(`Failed to create document: ${error.message}`);
          });
      });

      try {
        results = await Promise.all(createPromises);
      } catch (error) {
        // If any creation fails, attempt to rollback previously created documents
        const rollbackPromises = createdDocIds.map(({ model, _id }) => {
          return model.findByIdAndDelete(_id).catch((rollbackError) => {
            logger.error(`Rollback failed for document ${_id}:`, rollbackError);
          });
        });

        await Promise.all(rollbackPromises);
        throw error;
      }

      return results;
    } catch (error) {
      logger.error("Failed to create parallel documents:", error);
      throw error;
    }
  }

  /**
   * Updates multiple documents in parallel with validation and rollback
   * @param {Array<{model: mongoose.Model, id: string, data: Object}>} documents - Array of model, id and data pairs to update
   * @param {Object} options - Additional options for the operation
   * @returns {Promise<Array>} - Array of updated documents
   */
  static async updateParallelDocuments(
    documents,
    options = { validateBeforeSave: true }
  ) {
    if (!Array.isArray(documents) || documents.length === 0) {
      throw new Error("Documents array must not be empty");
    }

    try {
      let results = [];
      const originalDocs = [];

      // if (options.validateBeforeSave) {
      // Batch validate all update data before applying
      //   const validationPromises = documents.map(
      //     async ({ model, data, originalDocs }) => {
      //       if (!model || !data) {
      //         throw new Error("Each document must have model, id and data");
      //       }
      //       // Use model's schema to validate without updating instance
      //       return model.validate({ ...originalDocs, ...data });
      //     }
      //   );

      //   await Promise.all(validationPromises);
      // }

      // Store original documents for rollback
      const findPromises = documents.map(
        async ({ model, id, originalData }) => {
          const doc = originalData || (await model.findById(id).lean());
          if (!doc) {
            throw new Error(`Document not found with id: ${id}`);
          }
          originalDocs.push({ model, id, data: doc });
        }
      );

      await Promise.all(findPromises);

      // Update documents in parallel after validation
      const updatePromises = documents.map(({ model, id, data }) => {
        return model.findByIdAndUpdate(id, { $set: data }, { new: true });
      });

      try {
        results = await Promise.all(updatePromises);
      } catch (error) {
        // If any update fails, attempt to rollback to original state
        const rollbackPromises = originalDocs.map(({ model, id, data }) => {
          return model.findByIdAndUpdate(id, data).catch((rollbackError) => {
            logger.error(
              `Rollback failed for document ${id} in model ${model.modelName}:`,
              rollbackError
            );
          });
        });

        await Promise.all(rollbackPromises);
        throw error;
      }

      return results;
    } catch (error) {
      logger.error("Failed to update parallel documents:", error);
      throw error;
    }
  }
}

module.exports = MongoDBHelper;
