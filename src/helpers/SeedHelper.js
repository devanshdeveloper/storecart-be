const logger = require("./LogHelper");
const MongoDBHelper = require("./MongoDBHelper");
const PromiseHelper = require("./PromiseHelper");
const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");

class SeedHelper {
  constructor(mongoUri, seedUrl, seedToken) {
    this.mongoUri = mongoUri;
    this.seedUrl = seedUrl;
    this.seedToken = seedToken;
    this.mongoDBHelper = new MongoDBHelper(mongoUri);
  }

  async connect() {
    await this.mongoDBHelper.connect();
  }

  async disconnect() {
    await this.mongoDBHelper.disconnect();
  }

  async processSeedFile(file, seedsDir) {
    let seedModule = require(path.join(seedsDir, file));

    if (typeof seedModule === "function") {
      seedModule = await seedModule();
    }

    if (!seedModule) {
      logger.warn(`Skipping empty seed file: ${file}`);
      return null;
    }

    if (!(seedModule.Model || seedModule.endpoint) || !Array.isArray(seedModule.data)) {
      logger.warn(`Invalid seed file format: ${file}`);
      return null;
    }

    return seedModule;
  }

  async seedItem(item, seedModule) {
    if (seedModule.endpoint) {
      await axios.post(`${this.seedUrl}${seedModule.endpoint}`, item, {
        headers: {
          Authorization: `Bearer ${this.seedToken}`,
        },
      });
    } else if (seedModule.Model) {
      await seedModule.Model.create(item);
    } else {
      throw new Error("Invalid seed file format. Missing 'endpoint' or 'Model' property.");
    }
    return item;
  }

  async seedModels(modelsToSeed = []) {
    try {
      const seedsDir = path.join(__dirname, "../seeds");
      const files = await fs.readdir(seedsDir);
      let seedFiles = files.filter((file) => file.endsWith(".seed.js"));

      if (modelsToSeed.length > 0) {
        seedFiles = seedFiles.filter((file) => {
          const modelName = file.replace(".seed.js", "");
          return modelsToSeed.includes(modelName);
        });

        if (seedFiles.length === 0) {
          logger.error("No matching seed files found for the specified models.");
          return;
        }
      }

      for (const file of seedFiles) {
        const seedModule = await this.processSeedFile(file, seedsDir);
        if (!seedModule) continue;

        logger.info(`Seeding ${file}...`);

        const { successes, errors } = await PromiseHelper.processBatch(
          seedModule.data,
          (item) => this.seedItem(item, seedModule),
          {
            onSuccess: (result, item) => {
              logger.info(`✅ Successfully seeded item: ${item.name || item._id || ""}`);
            },
            onError: (error, item) => {
              logger.error(`Failed to seed item: ${error.message}`, {
                item,
                error: error?.response?.data || error,
              });
            }
          }
        );

        if (successes.length > 0) {
          logger.info(`✅ Successfully seeded ${successes.length} items from ${file}`);
        }
        if (errors.length > 0) {
          logger.warn(`⚠️ Failed to seed ${errors.length} items from ${file}`);
        }
      }

      logger.info("All seeds completed successfully!");
    } catch (error) {
      logger.error("Error during seeding: " + error.message, error);
    }
  }
}

module.exports = SeedHelper;