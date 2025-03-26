const { Product } = require("../models");

const productSeeds = {
  Model: Product,
  data: [
    {
      name: "Professional DSLR Camera",
      description: "High-end digital camera with 24.2MP sensor, 4K video recording, and advanced autofocus system",
      images: [
        "https://example.com/images/camera1.jpg",
        "https://example.com/images/camera2.jpg"
      ],
      price: 1299.99,
      category: "65f1a1b2c3d4e5f6a7b8c9d0", // Photography Equipment Category
      user: "65f1a1b2c3d4e5f6a7b8c9d1" // Electronics Store
    },
    {
      name: "Ergonomic Office Chair",
      description: "Premium office chair with lumbar support, adjustable height, and breathable mesh back",
      images: [
        "https://example.com/images/chair1.jpg",
        "https://example.com/images/chair2.jpg"
      ],
      price: 299.99,
      category: "65f1a1b2c3d4e5f6a7b8c9d2", // Office Furniture Category
      user: "65f1a1b2c3d4e5f6a7b8c9d3" // Furniture Store
    },
    {
      name: "Wireless Gaming Mouse",
      description: "High-precision gaming mouse with RGB lighting, programmable buttons, and long battery life",
      images: [
        "https://example.com/images/mouse1.jpg",
        "https://example.com/images/mouse2.jpg"
      ],
      price: 79.99,
      category: "65f1a1b2c3d4e5f6a7b8c9d4", // Gaming Accessories Category
      user: "65f1a1b2c3d4e5f6a7b8c9d1" // Electronics Store
    }
  ]
};

module.exports = productSeeds;