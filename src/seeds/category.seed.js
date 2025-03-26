const { Category } = require("../models");

const categorySeeds = {
  Model: Category,
  data: [
    {
      name: "Electronics",
      image: "https://example.com/images/electronics.svg",
      description: "Latest gadgets and electronic devices",
      user: "67d81238de9a9b5b4b3e4fac",
      deletedAt: null,
    },
    {
      name: "Fashion",
      image: "https://example.com/images/fashion.svg",
      description: "Trendy clothing and accessories",
      user: "67d81238de9a9b5b4b3e4fac",
      deletedAt: null,
    },
    {
      name: "Home & Living",
      image: "https://example.com/images/home-living.svg",
      description: "Furniture and home decor items",
      user: "67d81238de9a9b5b4b3e4fac",
      deletedAt: null,
    },
  ],
};

module.exports = categorySeeds;
