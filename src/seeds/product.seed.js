const { SEED_USER_ID } = require("../constants/env");
const { Product } = require("../models");
const { faker } = require("@faker-js/faker");

// Helper function to generate random product data
const generateProduct = () => {
  // Get main category IDs (first 15 categories)
  const categories = Array.from({ length: 15 }, (_, i) => 
    `65f1a1b2c3d4e5f6a7b8c${i.toString().padStart(3, "0")}`
  );

  const users = [
    SEED_USER_ID  // General Store
  ];

  const variantTypes = ["size", "color", "material", "style"];
  const hasVariants = faker.datatype.boolean();
  console.log(hasVariants); // Testing
  const variants = hasVariants
    ? Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
        name: faker.helpers.arrayElement(variantTypes),
        value: faker.commerce.productMaterial(),
        stock: faker.number.int({ min: 0, max: 100 }),
        price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
        images: Array.from(
          { length: faker.number.int({ min: 1, max: 3 }) },
          () => faker.image.url()
        ),
      }))
    : [];

  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    images: Array.from(
      { length: faker.number.int({ min: 1, max: 5 }) },
      () => faker.image.url()
    ),
    price: parseFloat(faker.commerce.price({ min: 10, max: 2000 })),
    stock: faker.number.int({ min: 0, max: 200 }),
    featured: faker.datatype.boolean({ probability: 0.2 }),
    category: faker.helpers.arrayElement(categories),
    variants,
    user: faker.helpers.arrayElement(users),
  };
};

// Generate 1000 products
const productSeeds = {
  Model: Product,
  data: Array.from({ length: 2 }, generateProduct)
};

module.exports = productSeeds;