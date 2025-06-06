const SeedHelper = require("../helpers/SeedHelper");
const {
  SEED_URL,
  SEED_TOKEN,
  MONGODB_URI,
} = require("../constants/env");

(async () => {
  const seedHelper = new SeedHelper(MONGODB_URI, SEED_URL, SEED_TOKEN);
  
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
