const SeedHelper = require("../helpers/SeedHelper");
const {
  SEED_URL,
  SEED_TOKEN,
  MONGODB_URI,
  PROD_MONGODB_URI,
  PROD_SEED_URL,
} = require("../constants/env");

(async () => {
  const seedHelper = new SeedHelper(PROD_MONGODB_URI, PROD_SEED_URL, SEED_TOKEN);
  
  try {
    await seedHelper.connect();
    // Get models to seed from command line arguments
    const modelsToSeed = process.argv.slice(2);
    await seedHelper.seedModels(modelsToSeed);
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await seedHelper.disconnect();
  }
})();
