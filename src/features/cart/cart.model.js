const mongoose = require("mongoose");
const { Schema } = mongoose;

const CartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    appliedPromoCodes: [
      {
        promo: {
          type: Schema.Types.ObjectId,
          ref: 'PromoCode',
          required: true
        },
        discount: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

CartSchema.virtual('subtotal').get(function() {
  return this.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

CartSchema.set('toJSON', { virtuals: true });

const Cart = mongoose.model("Cart", CartSchema);

module.exports = Cart;