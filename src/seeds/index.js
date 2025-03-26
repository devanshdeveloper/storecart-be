const logger = require("../helpers/LogHelper");
const MongoDBHelper = require("../helpers/MongoDBHelper");
const fs = require("fs").promises;
const path = require("path");
const axios = require("axios");
const { config } = require("dotenv");
config();

(async () => {
  const mongoDBHelper = new MongoDBHelper();
  await mongoDBHelper.connect();

  try {
    // Get models to seed from command line arguments
    const modelsToSeed = process.argv.slice(2);

    // Read all files in the seeds directory
    const seedsDir = path.join(__dirname);
    const files = await fs.readdir(seedsDir);

    // Filter for .seed.js files and exclude index.js
    let seedFiles = files.filter((file) => file.endsWith(".seed.js"));

    // If specific models are provided, filter seed files accordingly
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

    // Process each seed file
    for (const file of seedFiles) {
      let seedModule = require(path.join(seedsDir, file));

      if (typeof seedModule === "function") {
        seedModule = await seedModule();
      }

      if (
        (seedModule.Model || seedModule.endpoint) &&
        Array.isArray(seedModule.data)
      ) {
        logger.info(`Seeding ${file}...`);

        // Track seeding results
        const results = {
          success: 0,
          failed: 0,
          errors: [],
        };

        // Process each item individually
        for (const item of seedModule.data) {
          try {
            if (seedModule.endpoint) {
              await axios.post(
                `${process.env.SEED_URL}${seedModule.endpoint}`,
                item, {
                  headers : {
                    'Authorization' : `Bearer ${process.env.SEED_TOKEN}`
                  }
                }
              );


            } else if (seedModule.Model) await seedModule.Model.create(item);
            else {
              throw new Error(
                "Invalid seed file format. Missing 'endpoint' or 'Model' property."
              );
            }
            results.success++;
          } catch (error) {
            results.failed++;
            results.errors.push({
              item,
              error : error.response.data,
            });
          }
        }

        // Log results
        if (results.success > 0) {
          logger.info(
            `✅ Successfully seeded ${results.success} items from ${file}`
          );
        }
        if (results.failed > 0) {
          logger.warn(`⚠️ Failed to seed ${results.failed} items from ${file}`);
          results.errors.forEach(({ item, error }) => {
            logger.error(`Failed to seed item:` , { item, error });
          });
        }
      }
    }

    logger.info("All seeds completed successfully!");
  } catch (error) {
    logger.error("Error during seeding:", error);
  } finally {
    // Close the database connection
    await mongoDBHelper.disconnect();
  }
})();
