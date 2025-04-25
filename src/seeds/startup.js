const SeedHelper = require("../helpers/SeedHelper");
const {
  SEED_URL,
  SEED_TOKEN,
  MONGODB_URI,
} = require("../constants/env");

// Define models to seed during startup
const STARTUP_SEEDS = ["user" , "plan"];

(async () => {
  const seedHelper = new SeedHelper(MONGODB_URI, SEED_URL, SEED_TOKEN);
  
  try {
    await seedHelper.connect();
    await seedHelper.seedModels(STARTUP_SEEDS);
  } catch (error) {
    console.error("Error during startup seeding:", error);
  } finally {
    await seedHelper.disconnect();
  }
})();