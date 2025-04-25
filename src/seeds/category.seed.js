const { SEED_USER_ID } = require("../constants/env");
const { Category } = require("../models");
const { faker } = require("@faker-js/faker");

// Define main category types for more realistic data generation
const mainCategories = [
  "Electronics",
  "Fashion",
  "Home & Living",
  "Sports",
  "Beauty",
  "Books",
  "Toys",
  "Automotive",
  "Garden",
  "Health",
  "Jewelry",
  "Pet Supplies",
  "Office",
  "Food & Beverages",
  "Art",
];

// Generate subcategories for each main category
const generateSubcategories = (mainCategory) => {
  const subcategories = {
    Electronics: [
      "Smartphones",
      "Laptops",
      "Audio",
      "Gaming",
      "Cameras",
      "Accessories",
      "Smart Home",
    ],
    Fashion: [
      "Men's Wear",
      "Women's Wear",
      "Kids' Wear",
      "Footwear",
      "Accessories",
      "Sportswear",
    ],
    "Home & Living": [
      "Furniture",
      "Decor",
      "Bedding",
      "Kitchen",
      "Lighting",
      "Storage",
    ],
    Sports: [
      "Fitness",
      "Outdoor",
      "Team Sports",
      "Water Sports",
      "Winter Sports",
      "Yoga",
    ],
    Beauty: [
      "Skincare",
      "Makeup",
      "Haircare",
      "Fragrances",
      "Bath & Body",
      "Tools",
    ],
    Books: [
      "Fiction",
      "Non-Fiction",
      "Academic",
      "Children's",
      "Comics",
      "Magazines",
    ],
    Toys: [
      "Educational",
      "Action Figures",
      "Board Games",
      "Outdoor Toys",
      "Arts & Crafts",
    ],
    Automotive: ["Parts", "Accessories", "Tools", "Car Care", "Electronics"],
    Garden: ["Plants", "Tools", "Outdoor Furniture", "Decor", "Lighting"],
    Health: [
      "Vitamins",
      "Personal Care",
      "Medical Supplies",
      "Fitness Equipment",
    ],
    Jewelry: ["Necklaces", "Rings", "Earrings", "Watches", "Bracelets"],
    "Pet Supplies": ["Dog", "Cat", "Fish", "Bird", "Small Pets", "Pet Care"],
    Office: ["Furniture", "Supplies", "Electronics", "Organization", "Paper"],
    "Food & Beverages": ["Snacks", "Beverages", "Organic", "Gourmet", "Pantry"],
    Art: ["Supplies", "Digital Art", "Paintings", "Sculptures", "Photography"],
  };
  return subcategories[mainCategory] || [];
};

// Generate 100 categories with static IDs
const generateCategories = () => {
  const categories = [];
  let idCounter = 0;

  mainCategories.forEach((mainCat) => {
    // Add main category
    const mainCatId = `65f1a1b2c3d4e5f6a7b8c${idCounter
      .toString()
      .padStart(3, "0")}`;
    categories.push({
      _id: mainCatId,
      name: mainCat,
      image: faker.image.url(),
      description: faker.commerce.productDescription(),
      user: SEED_USER_ID,
      deletedAt: null,
    });
    idCounter++;

    // Add subcategories
    const subs = generateSubcategories(mainCat);
    subs.forEach((sub) => {
      if (idCounter < 100) {
        const subCatId = `65f1a1b2c3d4e5f6a7b8c${idCounter
          .toString()
          .padStart(3, "0")}`;
        categories.push({
          _id: subCatId,
          name: `${mainCat} - ${sub}`,
          image: faker.image.url(),
          description: faker.commerce.productDescription(),
          user: SEED_USER_ID,
          deletedAt: null,
        });
        idCounter++;
      }
    });
  });

  return categories;
};

const categorySeeds = {
  Model: Category,
  data: generateCategories(),
};

module.exports = categorySeeds;
